import { fetchOverpassData } from '../src/api/overpass';

describe('fetchOverpassData snapshot', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  test('snapshot of mapped Overpass response', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [
          {
            id: 123,
            lat: 47.0,
            lon: 8.0,
            tags: { name: 'Snapshot Café', amenity: 'cafe' },
          },
        ],
      }),
    });

    const result = await fetchOverpassData('Bern');

    expect(result).toMatchSnapshot();
  });
});
