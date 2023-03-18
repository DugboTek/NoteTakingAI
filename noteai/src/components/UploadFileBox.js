//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import { audioRecorder } from './audioRecorder.js';
import recordIcon from '../assets/images/record-black.png';

const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;



const 	key = process.env.React_App_OPEN_AI_API_KEY;
console.log(key);

const UploadFileBox = (props) => {
	
	const [convertedText, setConvertedText] = useState("");
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState(null);
	const [hasFile, setHasFile] = useState(false);
	const [message, setMessage] = useState('');
	const [recording, setRecording] = useState(false);
	const [response, setResponse] = useState('');
	const [userSubject, setUserSubject] = useState("");
	const [file, setFile] = useState(null);
	var recordingNotStopped; // User pressed record button and keep talking, still not stop button pressed
	const trackLengthInMS = 1000; // Length of audio chunk in miliseconds
	const maxNumOfSecs = 1000; // Number of mili seconds we support per recording (1 second)

	const api_key = process.env.OPEN_AI_API_KEY;

	//write 

	const blobToFile = (theBlob, fileName) => {
		const b = theBlob;
		// Add properties to the blob
		b.lastModifiedDate = new Date();
		b.name = fileName;
		const fileObj = new File([theBlob], fileName, { type: theBlob.type });
		return fileObj;
	}

	const sleep = time => new Promise(resolve => setTimeout(resolve, time));

	const asyncFn = async() => {
		for (let i = 0; i < maxNumOfSecs; i++) {
		  if (recordingNotStopped) {
			toggleAudioRecording(true);
			await sleep(trackLengthInMS);
			toggleAudioRecording(false);
		  }
		}
	  }

	const toggleAudioRecording = () => {	

		if (recording == false) {
			setRecording(true);
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
            //Error handling structure
            switch (error.name) {
                case 'AbortError': //error from navigator.mediaDevices.getUserMedia
                    console.log("An AbortError has occured.");
                    break;
                case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotAllowedError has occured. User might have denied permission.");
                    break;
                case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotFoundError has occured.");
                    break;
                case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A NotReadableError has occured.");
                    break;
                case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
                    console.log("A SecurityError has occured.");
                    break;
                case 'TypeError': //error from navigator.mediaDevices.getUserMedia
                    console.log("A TypeError has occured.");
                    break;
                case 'InvalidStateError': //error from the MediaRecorder.start
                    console.log("An InvalidStateError has occured.");
                    break;
                case 'UnknownError': //error from the MediaRecorder.start
                    console.log("An UnknownError has occured.");
                    break;
                default:
                    console.log("An error occured with the error name " + error.name);
            };
        });
	} 
	else {
		console.log("stop recording");
		setRecording(false);
		 //stop the recording using the audio recording API
		 audioRecorder.stop()
		 .then(audioAsblob => {
			var file = blobToFile(audioAsblob, "audio.wav");
			const data = new FormData();
			data.append('file', file);
			data.append('model', 'whisper-1');
			setFormData(data);
			console.log("formData"+formData);
			 //Play recorder audio
			// playAudio(audioAsblob);
 
			 //hide recording control button & return record icon
			// handleHidingRecordingControlButtons();
		 })
		 .catch(error => {
			 //Error handling structure
			 switch (error.name) {
				 case 'InvalidStateError': //error from the MediaRecorder.stop
					 console.log("An InvalidStateError has occured.");
					 break;
				 default:
					 console.log("An error occured with the error name " + error.name);
			 };
		 });
	}
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
		console.log(formData);
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
			<div className ="microphone-box">
				<button className="record-button" onClick={toggleAudioRecording}>
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