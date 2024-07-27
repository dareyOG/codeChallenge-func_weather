import { useEffect, useState } from 'react';

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], '☀️'],
    [[1], '⛅'],
    [[2], '⛅️'],
    [[3], '☁️'],
    [[45, 48], '🌫'],
    [[51, 56, 61, 66, 80], '🌦'],
    [[53, 55, 63, 65, 57, 67, 81, 82], '🌧'],
    [[71, 73, 75, 77, 85, 86], '🌨'],
    [[95], '🌩'],
    [[96, 99], '⛈'],
  ]);
  const arr = [...icons.keys()].find(key => key.includes(wmoCode));
  if (!arr) return 'NOT FOUND';
  return icons.get(arr);
}

// function convertToFlag(countryCode) {
//   const codePoints = countryCode
//     .toUpperCase()
//     .split('')
//     .map(char => 127397 + char.charCodeAt());
//   return String.fromCodePoint(...codePoints);
// }

function formatDay(dateStr) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
  }).format(new Date(dateStr));
}

export default function App() {
  const [inputLocation, setInputLocation] = useState('');
  // const [weather, setWeather] = useState({});
  return (
    <div className="app">
      <h1>Func Weather</h1>
      <Input input={inputLocation} setInput={setInputLocation} />
      <Weather weatherLocation={inputLocation} />
    </div>
  );
}

function Input({ input, setInput }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search for location... "
        value={input}
        onChange={e => setInput(e.target.value)}
      />
    </div>
  );
}

function Weather({ weatherLocation }) {
  const [weather, setWeather] = useState({});
  // const [error, setError] = useState(true);
  useEffect(
    function () {
      if (weatherLocation.length < 3) return;
      async function getWeather() {
        //1️⃣ fetch location
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${weatherLocation}`
          );
          const geoData = await geoRes.json();

          if (!geoData.results) throw new Error('Location not found');

          // destructure geoData
          const { country, latitude, longitude, timezone } =
            geoData.results.at(0);

          console.log(country);

          //2️⃣ fetch weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );

          if (!weatherRes.ok) {
            // setError('Error fetching data');
            console.log('Error fetching data');
          }
          const weatherData = await weatherRes.json();
          console.log(weatherData);

          // destructure weatherData
          const {
            time: dates,
            temperature_2m_max: max,
            temperature_2m_min: min,
            weathercode: codes,
          } = weatherData.daily;

          setWeather({ dates, country, max, min, codes });
        } catch (err) {
          console.log(err.message);
          // setError(err.message);
        }
      }
      getWeather();
    },
    [weatherLocation]
  );
  const { dates, country, max, min, codes } = weather;
  console.log(dates);
  return (
    <div>
      <h2>{`${weatherLocation}, ${country}`}</h2>
      <ul className="weather"></ul>
    </div>
  );
}
