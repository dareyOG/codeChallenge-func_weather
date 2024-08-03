import { useState, useEffect } from 'react';
import { Day } from './Day';
import { Error } from './Error';

export function Weather({ weatherLocation }) {
  const [weather, setWeather] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    function () {
      async function getWeather() {
        try {
          setIsLoading(true);
          if (!weatherLocation) {
            setError('Input location');
            return;
          }
          //1️⃣ get location data
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${weatherLocation}`
          );

          const geoData = await geoRes.json();
          if (!geoData.results) throw new Error('Location not found');

          const { name, country, latitude, longitude, timezone } = geoData.results.at(0);

          //2️⃣ get weather data
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );

          if (!weatherRes.ok) throw new Error('Data fetching failed');

          const weatherData = await weatherRes.json();

          const {
            time: days,
            temperature_2m_max: max,
            temperature_2m_min: min,
            weathercode: codes,
          } = weatherData.daily;

          const weatherReport = { name, country, days, max, min, codes };

          // update weather
          setWeather(weatherReport);
        } catch (err) {
          if (error) setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      getWeather();
    },
    [weatherLocation, error]
  );

  return (
    <div>
      {isLoading && <h2>Loading...</h2>}
      {error && <Error />}
      {!error && !isLoading && (
        <>
          <h2>{`${weather.name}, ${weather.country}`}</h2>
          <ul className="weather">
            {weather.days?.map((day, index) => (
              <Day
                key={index}
                day={day}
                code={weather.codes.at(index)}
                max={weather.max.at(index)}
                min={weather.min.at(index)}
                isToday={index === 0}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
