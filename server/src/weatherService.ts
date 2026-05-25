import fetch from 'node-fetch';

export async function geocode(name: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5`;
  const res = await fetch(url);
  const json = await res.json();
  return (json.results || []).map((r: any) => ({
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function fetchWeather(lat: number, lon: number) {
  const params = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'windspeed_10m_max',
    'snowfall_sum',
    'weathercode'
  ];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=${params.join(',')}&timezone=auto&forecast_days=8`;
  const res = await fetch(url);
  const json = await res.json();
  console.log('Weather API response:', json);
  return json.daily || {};
}
