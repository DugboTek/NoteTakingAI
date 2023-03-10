//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;

const key = process.env.React_App_OPEN_AI_API_KEY;
console.log(key);

const UploadFileBox = (props) => {
	
	const [convertedText, setConvertedText] = useState("");
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState(null);
	const [hasFile, setHasFile] = useState(false);
	const [message, setMessage] = useState('')
	const [response, setResponse] = useState('')

	const api_key = process.env.OPEN_AI_API_KEY;
	

	const handleSubmit = async (inputText) => {
		const response = await fetch('http://localhost:3001', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({inputText}),
		})
		const data = await response.json();
		setResponse(data.message);
		//props.setConvertedText(data.message);
		props.onConvertedText(data.message);
		console.log(data.message);
		/*.then(res => res.json())
		.then((data) => setResponse(data.message))
		.then((data) => setConvertedText(data.message))
		.then((data) => props.onConvertedText(data.message));*/
		console.log("submitted");

	  };

	/*const handleFile = async(e) =>{
  
		if (e.target.files && e.target.files[0]) 
		{
		  const file = e.target.files[0];
		  const data = new FormData();~
		  data.append("file", file);
		  data.append("model", "whisper-1");
		  setFormData(data);
		  console.log("File Uploaded");
		  console.log(data);
		  setHasFile(true); // set the flag to true
		  if (file.size > 25 * 1024 * 1024) 
		  {
			alert("Please upload an audio file less than 25MB");
			console.log("Please upload an audio file less than 25MB");
	  
			setHasFile(false); // reset the flag if the file is too big
			return;
		  }
		}
	}*/

	

	const sendAudio = async () => {
		setLoading(true);
		const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
		  headers: {
			"Authorization": `Bearer ${key}`
		  },
		  method: "POST",
		  body: formData,
		});
		console.log("audio sent");
		const data = await res.json();
		setLoading(false);
		console.log(data);
		setConvertedText(data.text);
		props.onConvertedText(data.text);
		handleSubmit(data.text);
	  };

	return(
		<div className="box">
			<h2 className="header">
				Get Summerized Lectures With AI
			</h2>
			{
			<DropFileInput setFormData={setFormData}/>
				//setFormData={setFormData}
				//onFileChange={handleFile}


			}
			<button type = "button" className ="ant-btn padded" onClick={sendAudio}>Send Audio</button>

		</div>
	)
};

export default UploadFileBox;