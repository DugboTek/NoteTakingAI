// create a react component that inputs a textarea message then performs a fetch request to localhost:3001 gets back a response a data.message and displys that message in a box below

import React, { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('http://localhost:3001', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then((data) => setResponse(data.message));
  };

  return (
    <div className="App">
      <h1>Quick Note</h1>
      <form onSubmit={handleSubmit}>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
      <div>{response}</div>
    </div>
  );
}

export default App