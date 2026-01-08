import { mapWeatherCode } from '../src/api/weather';

describe('mapWeatherCode', () => {
test('mapWeatherCode returns sunny for code 0', () => {
    expect(mapWeatherCode(0)).toBe('sunny');
});

test('mapWeatherCode returns cloudy for unknown code', () => {
    expect(mapWeatherCode(99)).toBe('cloudy');
});
});
