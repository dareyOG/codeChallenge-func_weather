import { useState } from 'react';
import { Input } from './Input';
import { Weather } from './Weather';

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
