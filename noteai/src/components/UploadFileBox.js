import React, { useState, useEffect } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import { audioRecorder } from './audioRecorder.js';
import recordIcon from '../assets/images/record-black.png';

const OpenAI = require('openai');
const { Configuration, OpenAIApi } = OpenAI;

const key = process.env.React_App_OPEN_AI_API_KEY;
console.log(key);

const UploadFileBox = (props) => {
  const [convertedText, setConvertedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [hasFile, setHasFile] = useState(false);
  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState('');
  const [old, setOld] = useState([]);
  const [userSubject, setUserSubject] = useState("");
  const [file, setFile] = useState(null);
  const trackLengthInMS = 1000; // Length of audio chunk in miliseconds
  const maxNumOfSecs = 1000; // Number of mili seconds we support per recording (1 second)

  const api_key = process.env.OPEN_AI_API_KEY;

  const blobToFile = (theBlob, fileName) => {
    const b = theBlob;
    // Add properties to the blob
    b.lastModifiedDate = new Date();
    b.name = fileName;
    const fileObj = new File([theBlob], fileName, { type: theBlob.type });
    return fileObj;
  }

  const sleep = time => new Promise(resolve => setTimeout(resolve, time));

 /* const asyncFn = async (recording) => {
    for (let i = 0; i < maxNumOfSecs; i++) {
     // console.log("asyncFn loop iteration ", i);
      if (recording) {
        toggleAudioRecording(true);
        await sleep(trackLengthInMS);
        toggleAudioRecording(false);
      }
    }
  }*/
  

  const toggleAudioRecording = async () => {
	if (recording) {
	  // Stop the recording and get the recorded audio Blob as an MP3 file
	  try {
		let audioAsblob = await audioRecorder.stop();
		var file = blobToFile(audioAsblob, "audio.mp3");
		const data = new FormData();
		data.append('file', file);
		data.append('model', 'whisper-1');
		setFormData(data);
		console.log("formData" + formData);
	  } catch (error) {
		// Error handling structure
		switch (error.name) {
		  case 'InvalidStateError': // Error from the MediaRecorder.stop
			console.log("An InvalidStateError has occured.");
			break;
		  default:
			console.log("An error occured while stopping the recorder with the error name " + error.name);
		};
	  } finally {
		setRecording(false);
	  }
	} else {
	  setRecording(true);
	  // Start recording using the audio recording API
	  try {
		console.log("Recording Audio...");
		await audioRecorder.start();
	  } catch (error) {
		// Error handling structure
		switch (error.name) {
		  case 'AbortError': // Error from navigator.mediaDevices.getUserMedia
			console.log("An AbortError has occured.");
			break;
		  case 'NotAllowedError': // Error from navigator.mediaDevices.getUserMedia
			console.log("A NotAllowedError has occured. User might have denied permission.");
			break;
		  case 'NotFoundError': // Error from navigator.mediaDevices.getUserMedia
			console.log("A NotFoundError has occured.");
			break;
		  case 'NotReadableError': // Error from navigator.mediaDevices.getUserMedia
			console.log("A NotReadableError has occured.");
			break;
		  case 'SecurityError': // Error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
			console.log("A SecurityError has occured.");
			break;
		  case 'TypeError': // Error from navigator.mediaDevices.getUserMedia
			console.log("A TypeError has occured.");
			break;
		  case 'InvalidStateError': // Error from the MediaRecorder.start
			console.log("An InvalidStateError has occured.");
			break;
		  case 'UnknownError': // Error from the MediaRecorder.start
			console.log("An UnknownError has occured.");
			break;
		  default:
			console.log("An error occured while starting the recorder with the error name " + error.name);
		};
		setRecording(false);
	  }
	}
  };
  
  
  
	
	
	const handleSubmit = async (inputText) => {
		//gets the subject from the user
		const resp = await fetch('https://scribb.ai:3001/noteDetails', {
			method : 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({userSubject}),
		});

		const response = await fetch('https://scribb.ai:3001', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({inputText}),
		})
		const data = await response.json();//hi+old
		const newMessage = data.message;
		setOld((prevMessages) => [...prevMessages, newMessage]);
		const allMessages = old.concat(newMessage).join("\n");
		setConvertedText(data.message);
	//	props.setConvertedText(data.message);
		props.onConvertedText(allMessages);
		//setOld(convertedText);
		setLoading(false);
		props.isLoading(false);
		console.log(data.message);
		/*.then(res => res.json())
		.then((data) => setResponse(data.message))
		.then((data) => setConvertedText(data.message))
		.then((data) => props.onConvertedText(data.message));*/
		console.log("submitted");

	  };

	
	

	  const sendAudio = async () => {
		try {
			props.isLoading(true);
			setLoading(true);
			// Stop recording and get the recorded audio Blob as an MP3 file
			let audioBlob = await audioRecorder.combineAndEncodeAudioBlobs('audio/mp3');
			let file = new File([audioBlob], 'audio.mp3');
			// Create a FormData instance to send the file and model information
			let data = new FormData();
			data.append('file', file);
			data.append('model', 'whisper-1');
			// Send the audio file to the API for transcription
			let res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
				headers: {
					Authorization: `Bearer ${key}`,
				},
				method: 'POST',
				body: data,
			});
			let responseJson = await res.json();
			console.log(responseJson);
			// Set the converted text and user subject in the parent component
			setConvertedText(responseJson.text);
			props.onConvertedText(responseJson.text);
			setUserSubject('Computer Networks');
			console.log('userSubject in send audio');
			console.log(userSubject);
			// Handle the form submit with the converted text
			handleSubmit(responseJson.text);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
			props.isLoading(false);
		}
	};
	

	return(
		<div className="box--upload">
			<div className ="microphone-box">
				<button className={`record-button${recording ? '-recording' : ''}`} onClick={toggleAudioRecording}>
				<img src={recordIcon} className="record-icon" alt= "recording button"/>
				</button>
			</div>
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