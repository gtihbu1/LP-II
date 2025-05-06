import React, { useState } from 'react';

function Counter() {
  // Declare a state variable 'count' initialized to 0
  const [count, setCount] = useState(0);

  // Handlers to increment and decrement the count
  const handleIncrement = () => {
    setCount(count + 1);
  };

  const handleDecrement = () => {
    setCount(count - 1);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>React Counter using useState Hook</h1>
      <p>Current count: <strong>{count}</strong></p>
      <div>
        <button onClick={handleDecrement} style={{ marginRight: '10px', padding: '10px 20px' }}>- Decrease</button>
        <button onClick={handleIncrement} style={{ padding: '10px 20px' }}>+ Increase</button>
      </div>
    </div>
  );
}

export default Counter;