export async function fetchWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.current_weather;
    } catch (error) {
        console.error('Fehler beim Laden der Wetterdaten:', error);
        return null;
    }
}
export async function fetch7DayForecast(city) {
    const lat = city.lat || 47.3769;
    const lon = city.lng || 8.5417;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    const days = data.daily.time.map((date, index) => ({
        date,
        temp: data.daily.temperature_2m_max[index],
        condition: mapWeatherCode(data.daily.weathercode[index])
    }));

    return days;
}

export function mapWeatherCode(code) {
    if ([0].includes(code)) return 'sunny';
    if ([1, 2, 3].includes(code)) return 'partly_cloudy';
    if ([45, 48, 51, 61].includes(code)) return 'cloudy';
    if ([53, 55, 63, 65, 80, 81, 82].includes(code)) return 'rainy';
    return 'cloudy';
}

