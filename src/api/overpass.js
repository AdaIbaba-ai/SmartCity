
const cityNameMap = {
    Zürich: 'Zürich',
    Bern: 'Bern',
    Basel: 'Basel',
    Geneva: 'Genève',
    Lausanne: 'Lausanne',
    Luzern: 'Luzern',
};

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

async function fetchOverpass(query) {
  const body = 'data=' + encodeURIComponent(query);

  let lastError = null;

  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json',
        },
        body,
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (!res.ok) {
        console.error('Overpass HTTP error:', res.status, url, text.slice(0, 500));
        lastError = new Error(`Overpass HTTP ${res.status}`);
        continue; // nächsti mirror probiere
      }

      if (!contentType.includes('application/json')) {
        console.error('Overpass returned non-JSON:', url, text.slice(0, 500));
        lastError = new Error('Overpass returned non-JSON (HTML/XML)');
        continue;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Overpass JSON parse failed:', url, text.slice(0, 500));
        lastError = new Error('Invalid JSON from Overpass');
        continue;
      }

      return (data.elements || [])
        .map((el) => {
          const lat = el.lat || el.center?.lat;
          const lng = el.lon || el.center?.lon;
          if (lat == null || lng == null) return null;

          const tags = el.tags || {};
          const name = tags.name || null;
          if (!name) return null;

          const type = detectType(tags);
          const rating = tags.rating || tags['rating:google'] || 'unknown';
          const openingHours = tags.opening_hours || 'unknown';

          return {
            id: el.id,
            lat,
            lng,
            tags,
            name,
            type,
            properties: { type, name, rating, openingHours },
          };
        })
        .filter(Boolean);

    } catch (err) {
      console.error('Overpass fetch failed:', url, err?.message || err);
      lastError = err;
      // nächsti mirror probiere
    }
  }

  // Wenn alles failt:
  console.error('Overpass failed on all mirrors:', lastError);
  return [];
}

function detectType(tags) {
    if (tags.amenity === 'cafe') return 'cafe';
    if (tags.amenity === 'restaurant') return 'restaurant';
    if (tags.amenity === 'toilets') return 'toilet';
    if (tags.amenity === 'parking') return 'parking';
    if (tags.event || tags['event:type']) return 'event';
    if (tags.leisure || tags.tourism) return 'activity';
    return 'poi';
}

function buildQuery(city, filters = []) {
    const osmCity = cityNameMap[city] || city;
    const queryParts = [];

    const foodFilter = filters.includes('food') || filters.includes('restaurant') || filters.includes('cafe');
    const facilityFilter = filters.includes('toilet') || filters.includes('parking');
    const activityFilter = filters.includes('activity') || filters.includes('activity-indoor') || filters.includes('activity-outdoor') || filters.includes('leisure');
    const eventFilter = filters.includes('event');

    if (foodFilter) {
        queryParts.push(
            //node, way, relation
            'nwr["amenity"="restaurant"](area.searchArea);',
            'nwr["amenity"="cafe"](area.searchArea);'
        );
    }

    if (facilityFilter) {
        if (filters.includes('toilet')) queryParts.push('nwr["amenity"="toilets"](area.searchArea);');
        if (filters.includes('parking')) queryParts.push('nwr["amenity"="parking"](area.searchArea);');
    }

    if (activityFilter) {
        queryParts.push(
            'nwr["leisure"](area.searchArea);',
            'nwr["tourism"](area.searchArea);'
        );
    }

    if (eventFilter) {
        queryParts.push(
            'nwr["event"](area.searchArea);',
            'nwr["event:type"](area.searchArea);'
        );
    }

    if (filters.length === 0 || filters.includes('all') || queryParts.length === 0) {
        queryParts.push(
            'nwr["amenity"="restaurant"](area.searchArea);',
            'nwr["amenity"="cafe"](area.searchArea);',
            'nwr["amenity"="toilets"](area.searchArea);',
            'nwr["amenity"="parking"](area.searchArea);',
            'nwr["leisure"](area.searchArea);',
            'nwr["tourism"](area.searchArea);',
            'nwr["event"](area.searchArea);',
            'nwr["event:type"](area.searchArea);'
        );
    }

    return `
    [out:json][timeout:25];
    area["name"="${osmCity}"]["boundary"="administrative"]["admin_level"="8"]->.searchArea;
    (
      ${queryParts.join('\n')}
    );
    out center;
  `;
}

export async function fetchOverpassData(cityName, filters = []) {
    const query = buildQuery(cityName, filters);
    return await fetchOverpass(query);
}