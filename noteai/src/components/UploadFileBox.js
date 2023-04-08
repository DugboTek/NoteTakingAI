import React, { useState, useEffect } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import recordIcon from '../assets/images/record-black.png';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import lamejs from 'lamejstmp';

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
  const [recordedChunks, setRecordedChunks] = useState([]);
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

  const maxFileSize = 24 * 1024 * 1024; // 25 MB
let mp3Encoder;

const webVoiceProcessor = new WebVoiceProcessor({
	context: "browsers",
	frameLength: 512,
	sampleRate: 16000
  });

const processAudioData = async (inputFrame) => {
	const mp3Data = mp3Encoder.encodeBuffer(inputFrame);
	if (mp3Data.length > 0) {
		setRecordedChunks(prevChunks => [...prevChunks, mp3Data]);
	}
	let filesize = recordedChunks.length * Uint8Array.BYTES_PER_ELEMENT;
	if(filesize %5 == 0){
		console.log(filesize);
	}
  
	if (recordedChunks.length * Uint8Array.BYTES_PER_ELEMENT > maxFileSize) {
		console.log("Max file size reached. Stopping recording.");
	  // Stop the recording
	  await WebVoiceProcessor.unsubscribe(audioProcessor);
	  // Send the audio and reset recordedChunks
	  await sendAudio();
	  setRecordedChunks([]);
	  // Start a new recording session
	  if (recording) {
		console.log("restarting recording...");
		await WebVoiceProcessor.subscribe(audioProcessor);
	  }
	}
  };
  

const audioProcessor = {
    onmessage: (e) => {
      processAudioData(e.data.inputFrame);
    },
  };

  const toggleAudioRecording = async () => {
    if (recording) {
      // Stop the recording and get the recorded audio Blob as an MP3 file
      try {
		console.log('ubsubscribeing...');
        await WebVoiceProcessor.unsubscribe(audioProcessor);
		console.log(recordedChunks);
        sendAudio();
      } catch (error) {
        console.error("An error occurred while stopping the recorder: ", error);
      } finally {
        setRecording(false);
		console.log('stopping recording...');
      }
    } else {
      setRecording(true);

      // Initialize the MP3 encoder
      mp3Encoder = new lamejs.Mp3Encoder(1, 16000, 128);

      // Start recording using the Web Voice Processor
      try {
        console.log("Recording Audio...");
        await WebVoiceProcessor.subscribe(audioProcessor);
      } catch (error) {
        console.error("An error occurred while starting the recorder: ", error);
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
		  const audioBlob = new Blob(recordedChunks, { type: 'audio/mpeg' });
		  let file = new File([audioBlob], 'audio.mpeg');
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
		 // setConvertedText(responseJson.text);
		 // props.onConvertedText(responseJson.text);
		 // setUserSubject('Computer Networks');
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