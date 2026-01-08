import { fetchWeather } from '../src/api/weather';

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({
            current_weather: {
                temperature: 20,
                weathercode: 1,
                windspeed: 5,
                apparent: 19
            }
        }),
    })
);

test('fetchWeather returns weather data correctly', async () => {
    const lat = 47.3769;
    const lon = 8.5417;

    const result = await fetchWeather(lat, lon);

    expect(result).toEqual({
        temperature: 20,
        weathercode: 1,
        windspeed: 5,
        apparent: 19,
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
        `https://api.open-meteo.com/v1/forecast?latitude=47.3769&longitude=8.5417&current_weather=true`
    );
});
