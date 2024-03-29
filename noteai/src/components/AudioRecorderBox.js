//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import audioRecorder from './audioRecorder';
const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;

const 	key = process.env.React_App_OPEN_AI_API_KEY;
console.log(key);

const AudioRecorderBox = (props) => {
	
	const startAudioRecording = () => {
		  //start recording using the audio recording API
		  audioRecorder.start()
		  .then(() => { //on success
			  console.log("Recording Audio...")    
		  })    
		  .catch(error => { //on error
			  //No Browser Support Error
			  if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {       
				  console.log("To record audio, use browsers like Chrome and Firefox.");
			  }
		  });
	}

	
	const handleSubmit = async (inputText) => {
		//gets the subject from the user
		const resp = await fetch('http://localhost:3001/noteDetails', {
			method : 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({userSubject}),
		});

		const response = await fetch('http://localhost:3001', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({inputText}),
		})
		const data = await response.json();
		setResponse(data.message);
		setConvertedText(data.message);
	//	props.setConvertedText(data.message);
		props.onConvertedText(data.message);
		setLoading(false);
		props.isLoading(false);
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
		props.isLoading(true);
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
		console.log(data);
		//setConvertedText(data.text);
		//props.onConvertedText(data.text);
		//setUserSubject("Computer Networks");
		console.log("userSubject in send audio");
		console.log(userSubject);
		handleSubmit(data.text);
	  };

	return(
		<div className="box--upload">
			<h2 className="header">
				Get Summerized Lectures With AI
			</h2>
			{
			<DropFileInput setFormData={setFormData}/>
				//setFormData={setFormData}
				//onFileChange={handleFile}


			}
			<form> 
				<div class = "input-container">
					<input type="text" onChange ={(e) => setUserSubject(e.target.value)} id="subject" name="subject" placeholder="Enter The Class Subject" required class = "text-input"/>
					<label for="subject" class = "label">Subject</label>
				</div>
			
			<button type = "button" className ="ant-btn padded marginTop" onClick={sendAudio}>Generate Notes</button>
			</form>
		</div>
	)
};

export default UploadFileBox;