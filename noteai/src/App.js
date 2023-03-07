// create a react component that inputs a textarea message then performs a fetch request to localhost:3001 gets back a response a data.message and displys that message in a box below

import React, { useState } from 'react'
import './App.css'
import TextWriter from './components/TextWriter.js';
import UploadFileBox from './components/UploadFileBox';
import DropFileInput from './components/Drop-File-Input/DropFileInput';


function App() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  const [hasFile, setHasFile] = useState(false);


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
    console.log("submitted");
  };

const [formData, setFormData] = useState(null);
// write a handleFile function that takes in a file and sets the formData state to a new FormData object with the file appended to it

const handleFile = async(e) =>{
  
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);
    data.append("model", "whisper-1");
    setFormData(data);
    console.log("File Uploaded");

    setHasFile(true); // set the flag to true
    if (file.size > 25 * 1024 * 1024) {
      alert("Please upload an audio file less than 25MB");
      console.log("Please upload an audio file less than 25MB");

      setHasFile(false); // reset the flag if the file is too big
      return;
    }
  }
}

const [convertedText, setConvertedText] = useState("");
const [loading, setLoading] = useState(false);



const sendAudio = async () => {
  setLoading(true);
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    headers: {
      "Authorization": `Bearer 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`,
    },
    method: "POST",
    body: formData,
  });
  console.log("audio sent");
  const data = await res.json();
  setLoading(false);
  console.log(data.text);
  setConvertedText(data.text);
};

 /*const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
     
      const data = new FormData();
      data.append("file", file);
      data.append("model", "whisper-1");
      data.append("language", "en");
      setFormData(data);

      // check if the size is less than 25MB
      if (file.size > 25 * 1024 * 1024) {
        alert("Please upload an audio file less than 25MB");
        return;
      }
    }
  };*/

  return (
    <div className="App">
      <UploadFileBox/>
      <h1>Quick Note</h1>
    
      <button onClick={sendAudio}>Send Audio</button>
      <form onSubmit={handleSubmit}>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
      <div>{response}</div>
      <div>{convertedText}</div>
      { /*
      <TextWriter text={convertedText} delay={10} />*/
      }
    </div>
  );
}

export default App