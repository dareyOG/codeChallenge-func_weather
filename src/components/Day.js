import * as wf from '../weatherformatter/weatherFormatter';

export function Day({ day, code, max, min, isToday }) {
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
