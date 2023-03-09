// create a react component that inputs a textarea message then performs a fetch request to localhost:3001 gets back a response a data.message and displys that message in a box below

import React, { useState } from 'react'
import './App.css'
import UploadFileBox from './components/UploadFileBox';
import TextAreaBox from './components/TextAreaBox';
import DropFileInput from './components/Drop-File-Input/DropFileInput';
//import ion-icon

function App() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  const [convertedText, setConvertedText] = useState("");



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

const[textdata, setTextData] = useState("");


const getData = (textdata) => {
  console.log(textdata);
  setTextData(textdata);
};

  return (
    <div className="App">
      <h1>Quick Note</h1>
      
      <div className="content-box">
        <div className="header-area">
          <div className ="boxdefault">
            <div class = "header-text-area">
              <div className="box-body">

                <div className ="form-header-title">
                  <h4 className="toplogy">
                    <span class ="primaryTextColor">Need Notes?</span>
                    We've got this.
                  </h4>
                  <span className="toplolgy-mini">
                    Get Summerized Lectures With AI
                  </span>
                </div>
                <div className ="primary-action-btn gradient-animated-box">
                  <button type="button" className="ant-btn">
                      <span>Upgrade</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="left-rail-area flex">
          <TextAreaBox text ={convertedText}/>
        </div>
        <div className="right-rail-area flex">
        <UploadFileBox onConvertedText ={setConvertedText}/>
        </div>
      </div>

      
      { 
     
      }
    </div>
  );
}

export default App