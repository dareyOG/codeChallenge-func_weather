import { useEffect, useRef, useState } from 'react';
import * as wf from './weatherFormatter';

export default function App() {
  const [location, setLocation] = useState('');
  return (
    <div className="app">
      <h1>Func Weather</h1>
      <Input location={location} setLocation={setLocation} />
      <Weather weatherLocation={location} />
    </div>
  );
}

function Input({ location, setLocation }) {
  const inputEl = useRef(null);
  useEffect(
    function () {
      const activeInput = e => {
        if (e.code === 'Space') inputEl.current.focus();
        if (e.code === 'Delete') setLocation('');
        if (document.activeElement !== inputEl.current) return;
      };
      document.addEventListener('keydown', activeInput);
      return function () {
        document.removeEventListener('keydown', activeInput);
      };
    },
    [location, setLocation]
  );
  return (
    <div>
      <input
        type="text"
        placeholder="Search for location... "
        value={location}
        onChange={e => setLocation(e.target.value)}
        ref={inputEl}
      />
    </div>
  );
}

function Weather({ weatherLocation }) {
  const [weather, setWeather] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    function () {
      async function getWeather() {
        try {
          setIsLoading(true);
          if (!weatherLocation) setError('Input location');

          // get location data
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${weatherLocation}`
          );
          const geoData = await geoRes.json();

          console.log(geoData.results.at(0));

          if (!geoData.results) throw new Error('Location not found');
          // setError('');

          const { name, country, latitude, longitude, timezone } =
            geoData.results.at(0);

          // get weather data
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );

          // console.log(weatherRes);
          if (!weatherRes.ok) throw new Error('Data fetching failed');

          const weatherData = await weatherRes.json();

          const {
            time: days,
            temperature_2m_max: max,
            temperature_2m_min: min,
            weathercode: codes,
          } = weatherData.daily;

          const weatherReport = { name, country, days, max, min, codes };

          // console.log(weatherReport);
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
      {error ? (
        <Error errorMessage={error} />
      ) : isLoading ? (
        'Loading...'
      ) : (
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

function Day({ day, code, max, min, isToday }) {
  return (
    <li className="day">
      <span>{wf.getWeatherIcon(code)}</span>
      <p>{isToday ? 'Today' : wf.formatDay(day)}</p>
      <p>
        {Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}</strong>&deg;
      </p>
    </li>
  );
}

function Error({ errorMessage }) {
  return <div>{errorMessage}</div>;
}
