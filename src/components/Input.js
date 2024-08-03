import { useEffect, useRef } from 'react';

export function Input({ location, setLocation }) {
  const inputEl = useRef(null);
  useEffect(
    function () {
      const activeInput = (e) => {
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
        onChange={(e) => setLocation(e.target.value)}
        ref={inputEl}
      />
    </div>
  );
}
