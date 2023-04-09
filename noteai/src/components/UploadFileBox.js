import React, { useState, useEffect, useRef} from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import recordIcon from '../assets/images/record-black.png';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import lamejs from 'lamejstmp';

const OpenAI = require('openai');
const { Configuration, OpenAIApi } = OpenAI;

const key = process.env.React_App_OPEN_AI_API_KEY;

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

  const [elapsedRecordingTime, setElapsedRecordingTime] = useState(0);

  const [autoResumeRecording, setAutoResumeRecording] = useState(false);

  const recordedChunksRef = useRef([]);
  const recordedChunksRefOld = useRef([]);



  const trackLengthInMS = (512 / 16000) * 1000; // Length of audio chunk in miliseconds
  const maxNumOfSecs = 1000; // Number of mili seconds we support per recording (1 second)

  const api_key = process.env.OPEN_AI_API_KEY;
  const TIMEOUT_MS = 1000 * 60 * 5; // 5 minutes

  const blobToFile = (theBlob, fileName) => {
    const b = theBlob;
    // Add properties to the blob
    b.lastModifiedDate = new Date();
    b.name = fileName;
    const fileObj = new File([theBlob], fileName, { type: theBlob.type });
    return fileObj;
  }

  const sleep = time => new Promise(resolve => setTimeout(resolve, time));

  const maxFileSize = 1 * 1024 * 1024; // 25 MB
let mp3Encoder;

// useEffect(() => {
// 	let timer;
  
// 	if (recording) {
// 	  timer = setTimeout(async () => {
// 		setAutoResumeRecording(true);
// 		await toggleAudioRecording(); // Toggle off
// 		setTimeout(toggleAudioRecording, TIMEOUT_MS); // Schedule toggling on after 5 minutes
// 	  }, TIMEOUT_MS); // Schedule toggling off after 5 minutes
// 	}
  
// 	return () => {
// 	  if (timer) clearTimeout(timer);
// 	};
//   }, [recording]);

// useEffect(()  => {
// 	if (elapsedRecordingTime >= TIMEOUT_MS) {
// 		setElapsedRecordingTime(0);
// 		restartAudio(); 
// 	  }
//   }, [elapsedRecordingTime]);

const intervalRef = useRef(null);

useEffect(() => {
  if (recording) {
	if (intervalRef.current) clearInterval(intervalRef.current);

	intervalRef.current = setInterval(async () => {
	  setAutoResumeRecording(true);
	  await restartAudio(); // Restart the recording
	}, TIMEOUT_MS); // Schedule restarting every 1 minute
  } else {
	if (intervalRef.current) clearInterval(intervalRef.current);
  }

  return () => {
	if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [recording]);



  const restartAudio = async () => {
	console.log("Timeout reached. Stopping recording.");
	// Stop the recording
	await WebVoiceProcessor.unsubscribe(audioProcessor);
	recordedChunksRefOld.current = recordedChunksRef.current;
	recordedChunksRef.current = [];
	 // Reset elapsedRecordingTime
	 // Start a new recording session
	 if (recording) {
	   console.log("restarting recording...");
	   mp3Encoder = new lamejs.Mp3Encoder(1, 16000, 128);
  
	   // Create a new WebVoiceProcessor instance
	   const webVoiceProcessor = new WebVoiceProcessor({
		 context: "browsers",
		 frameLength: 512,
		 sampleRate: 16000,
	   });
   
	   // Start recording using the Web Voice Processor
	   try {
		 console.log("Recording Audio...");
		 await WebVoiceProcessor.subscribe(audioProcessor);
	   } catch (error) {
		 console.error("An error occurred while starting the recorder: ", error);
		 setRecording(false);
	   }
	 }
	// Send the audio and reset recordedChunks
	await sendAudio();
  }

  

const processAudioData = async (inputFrame) => {
	// If audio processing is disabled, return early
  
	const mp3Data = mp3Encoder.encodeBuffer(inputFrame);
	if (mp3Data.length > 0) {
	  recordedChunksRef.current = [...recordedChunksRef.current, mp3Data];
	}
	let filesize = recordedChunksRef.current.length * Uint8Array.BYTES_PER_ELEMENT;
  
	// Update elapsedRecordingTime
	setElapsedRecordingTime(prevTime => prevTime + trackLengthInMS);
	
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
		console.log('unsubscribing...');
		console.log(recordedChunksRef);
		await WebVoiceProcessor.unsubscribe(audioProcessor);
		await WebVoiceProcessor.reset();
		recordedChunksRefOld.current = recordedChunksRef.current;
		sendAudio().finally(() => {
		  setRecording(false);
		  console.log('stopping recording...');
		  recordedChunksRef.current = [];
		});
	  } catch (error) {
		console.error("An error occurred while stopping the recorder: ", error);
	  }
	} else {
	  setRecording(true);
  
	  // Initialize the MP3 encoder
	  mp3Encoder = new lamejs.Mp3Encoder(1, 16000, 128);
  
	  // Create a new WebVoiceProcessor instance
	  const webVoiceProcessor = new WebVoiceProcessor({
		context: "browsers",
		frameLength: 512,
		sampleRate: 16000,
	  });
  
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
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({ userSubject }),
	});
  
	const response = await fetch('https://scribb.ai:3001', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({ inputText }),
	});
	const data = await response.json();
	const newMessage = data.message;
  
	setOld((prevMessages) => {
	  const allMessages = [...prevMessages, newMessage].join("\n");
	  props.onConvertedText(allMessages);
	  return [...prevMessages, newMessage];
	});
  
	setLoading(false);
	props.isLoading(false);
	console.log(data.message);
	console.log("submitted");
  };
  

	
	

	  const sendAudio = async () => {
		
		try {
		  props.isLoading(true);
		  setLoading(true);
		  // Stop recording and get the recorded audio Blob as an MP3 file
		  const audioBlob = new Blob(recordedChunksRefOld.current, { type: "audio/mpeg" });
		  let file = new File([audioBlob], "audio.mpeg");
		  // Create a FormData instance to send the file and model information
		  let data = new FormData();
		  data.append("file", file);
		  data.append("model", "whisper-1");
		  // Send the audio file to the API for transcription
		  let res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
			headers: {
			  Authorization: `Bearer ${key}`,
			},
			method: "POST",
			body: data,
		  });
		  let responseJson = await res.json();
		  console.log(responseJson);
		  // Handle the form submit with the converted text
		  handleSubmit(responseJson.text);
		} catch (error) {
		  console.error(error);
		} finally {
		  // Reset the recordedChunks array
		  recordedChunksRefOld.current = [];
		}
	  };
	  
	  
	

	return(
		<div className="box--upload">
			<div className="micContainer">
			<div className = "micdotContainer">
			<div className ="microphone-box">
				<button className={`record-button${recording ? '-recording' : ''}`} onClick={toggleAudioRecording}>
				<img src={recordIcon} className="record-icon" alt= "recording button"/>
				</button>
			</div>
			<div className={`indicator${recording ? '-recording' : ''}`}></div>
			</div>
			<div className="instructions">
				<b>Press the button</b>
				<br/>
				to start note taking with Scribb
			</div>
				
			</div>
			<div class="tab-container">
					<div class="tab">
						<span>Record</span>
					</div>
					<div class="tab-upload">
						<span>Upload</span>
					</div>
			</div>

			{
			// <DropFileInput setFormData={setFormData}/>
			// 	//setFormData={setFormData}
			// 	//onFileChange={handleFile}


			}

			<form> 
				<div class = "input-container">
					<div class="tab-subject">
						<span>Subject</span>
					</div>
					<input type="text" onChange ={(e) => setUserSubject(e.target.value)} id="subject" name="subject" placeholder="Enter class subject" required class = "text-input"/>
				</div>
			
			{/* <button type = "button" className ="ant-btn padded marginTop" onClick={sendAudio}>Generate Notes</button> */}
			</form>
		</div>
	)
};

export default UploadFileBox;