import { useState, useEffect } from 'react';
import { Day } from './Day';
import { Error } from './Error';

export function Weather({ weatherLocation }) {
  const [weather, setWeather] = useState(() => {
    const storedValue = localStorage.getItem('weather');
    return storedValue ? JSON.parse(storedValue) : {};
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    function () {
      // clean up data fetching
      const controller = new AbortController();
      async function getWeather() {
        try {
          setIsLoading(true);
          setError('');

          //1️⃣ get location data
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${weatherLocation}`
          );
          const geoData = await geoRes.json();
          console.log(geoData);
          if (!geoData.results) throw new Error('Location not found');
          const { country, latitude, longitude, timezone } = geoData.results.at(0);

          //2️⃣ get weather data
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`,
            { signal: controller.signal }
          );

          if (!weatherRes.ok || weatherRes.status !== 200) throw new Error('Data fetching failed');

          const weatherData = await weatherRes.json();

          const {
            time: days,
            temperature_2m_max: max,
            temperature_2m_min: min,
            weathercode: codes,
          } = weatherData.daily;

          const name = weatherLocation;
          const weatherReport = { name, country, days, max, min, codes };

          // update weather
          setWeather(weatherReport);
        } catch (err) {
          // if (error) console.log(err.message);
          if (err.name !== 'AbortError') setError(err.message);
          // setError(err.message);
        } finally {
          setIsLoading(false);
        }

        if (weatherLocation.length >= 1 && weatherLocation.length <= 2) {
          setError('More clues..🤔💭');
        }
      }
      getWeather();
      return function () {
        controller.abort();
      };
    },
    [weatherLocation]
  );

  // current location --NOT needed anymore

  /*   useEffect(function () {
    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      }

      function showPosition(position) {
        // console.log(position);
        const { latitude, longitude } = position.coords;
      }
    }
    getLocation();
  }, []); */

  // Add weather data to local storage
  useEffect(
    function () {
      localStorage.setItem('weather', JSON.stringify(weather));
    },
    [weather]
  );

  return (
    <div>
      {isLoading ? (
        <h2>Loading...</h2>
      ) : error ? (
        <Error errorMessage={error} />
      ) : (
        <>
          <h2>{`📌${weather.name}, ${weather.country}`}</h2>
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
