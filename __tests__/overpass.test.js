// _tests_/overpass.simple.test.js
import { fetchOverpassData } from '../src/api/overpass';

describe('fetchOverpassData (super simple)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  test('POSITIVE: returns one mapped item when API returns a named element', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [
          { id: 1, lat: 47, lon: 8, tags: { name: 'Cafe Test', amenity: 'cafe' } },
        ],
      }),
    });

    const res = await fetchOverpassData('Bern');
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Cafe Test');
    expect(res[0].type).toBe('cafe');
    expect(res[0].lat).toBe(47);
    expect(res[0].lng).toBe(8);
  });

  test('NEGATIVE: returns [] if response not ok OR element has no name', async () => {
    // A) not ok -> []
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'error',
    });
    const a = await fetchOverpassData('Bern');
    expect(a).toEqual([]);

    // B) ok but element without name -> filtered -> []
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elements: [{ id: 2, lat: 47, lon: 8, tags: {} }],
      }),
    });
    const b = await fetchOverpassData('Bern');
    expect(b).toEqual([]);
  });
});
