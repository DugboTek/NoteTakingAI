//import react
import React, { useState, useEffect } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import { audioRecorder} from './audioRecorder.js';
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
	const [toggle, setToggle] = useState(false);
	const [file, setFile] = useState(null);
	const [formDataUpdated, setFormDataUpdated] = useState(false); //form data state flag
	const [audioBlobs, setAudioBlobs] = useState([]); // state variable to store audio blobs
	const [gptResponse, setGptResponse] = useState([]); // state variable to store gpt response
	const [headings, setHeadings] = useState([]); // state variable to store headings

	let record = false;

	var recordingNotStopped; // User pressed record button and keep talking, still not stop button pressed
	const trackLengthInMS = 30000; ///120000; // Length of audio chunk in miliseconds
	const maxNumOfSecs = 10000000; // Number of mili seconds we support per recording (1 second)

	const api_key = process.env.OPEN_AI_API_KEY;

	//write 

	function extractMarkdownHeadings(markdownString) {
		const headings = [];
		const lines = markdownString.split("\n");
		
		lines.forEach((line) => {
		  const headingMatch = line.match(/^#+\s+(.*)/);
		  
		  if (headingMatch) {
			headings.push(headingMatch[1].trim());
		  }
		});
		
		return headings.join("\n");
	
	}

	const getHeadings = (text) => {
		headings.push(extractMarkdownHeadings(text));
	}

	useEffect(() => {
		if (formData && formDataUpdated) {
		  sendAudio();
		  setFormDataUpdated(false);
		}
	  }, [formData, formDataUpdated]);


	 useEffect(() => {
		// call sendAudioFile with each oneMinuteBlob produced by toggleAudioRecording
		console.log("useEffect called one minute blob");
		console.log(audioBlobs);
		console.log(audioBlobs.length);

		for(let i = 0; i < audioBlobs.length; i++){
		  var file = blobToFile(audioBlobs[i], 'audio.wav');
		  const data = new FormData();
		  data.append('file', file);
		  data.append('model', 'whisper-1');
		  sendAudioFile(data);
		}
		// clear audioBlobs after calling sendAudioFile
		//setAudioBlobs([]);
	  }, [audioBlobs]);


	const splitAudioBlob = (audioBlob) => {
		// Create an audio URL from the audio blob
		console.log("spliting audio blob...")
		const audioUrl = URL.createObjectURL(audioBlob);
		
		// Create a media source and set the audio URL as the source
		const mediaSource = new MediaSource();
		mediaSource.addEventListener('sourceopen', async () => {
		  const sourceBuffer = mediaSource.addSourceBuffer('audio/wav; codecs=0');
		  const mediaRecorder = new MediaRecorder(new MediaStream([audioBlob]), {
			mimeType: 'audio/wav; codecs=0',
		  });
		  let audioChunks = [];
	  
		  mediaRecorder.ondataavailable = (e) => {
			audioChunks.push(e.data);
			if (audioChunks.length === 1 * 60) { // If 5 minutes have passed, save the audio chunk as a blob
			  const audioBlob = new Blob(audioChunks, { 'type' : 'audio/wav; codecs=0' });
			  audioChunks = [];
			  console.log("im bouta save audio chunk 60 ")
			  saveAudioChunk(audioBlob);
			}
		  };
	  
		  mediaRecorder.start();
	  
		  const saveAudioChunk = async (audioBlob) => {
			console.log("Saving audio chunk...");
			// Save the audio blob using the File API or a similar method
			const fileName = `audio-${Date.now()}.wav`;
			const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });

			const data = new FormData();
			data.append('file', file);
			data.append('model', 'whisper-1');
			setFormData(data);
       		setFormDataUpdated(true);
		  	console.log("formData"+formData);
			sendAudioFile(data);
			
			// Do something with the saved audio file
			console.log(audioFile);
		  };
	  
		  mediaRecorder.onstop = async () => {
			if (audioChunks.length > 0) { // Save any remaining audio chunks that are less than 5 minutes long
			  const audioBlob = new Blob(audioChunks, { type: 'audio/wav; codecs=0' });
			  console.log("im bouta save audio chunk less than 60 ")
			  saveAudioChunk(audioBlob);
			}
		  };
	});

	}

	  
	const blobToFile = (theBlob, fileName) => {
		const b = theBlob;
		// Add properties to the blob
		b.lastModifiedDate = new Date();
		b.name = fileName;
		const fileObj = new File([theBlob], fileName, { type: theBlob.type });
		return fileObj;
	}

	const sleep = time => new Promise(resolve => setTimeout(resolve, time));

	const splitRecord = async() => {
		toggle? setToggle(false) : setToggle(true);
		console.log(toggle);
		while(toggle){
			for (let i = 0; ((i < maxNumOfSecs) && !recording); i++) {
				toggleAudioRecording();//recording toggled on
				console.log("recording toggled on");
				console.log("toggle is " + toggle);
				console.log("recording is " + recording);
				await sleep(trackLengthInMS);
				toggleAudioRecording();//recording toggled off
				console.log("recording toggled off");
			}
		}

		
	  }


	  const RecordAudio = async () => {
		record = !record;
		console.log("flip flopped record" + record);

		console.log("recording status:" + record);

		for (let i = 0; ((i < maxNumOfSecs) && record); i++) {
				if (record) {
					startRecording();
					console.log("recording started");
					console.log("recording status:" + record);
					await sleep(trackLengthInMS);
				
					stopRecording();
					console.log("recording stopped");
					console.log("recording status:" + record);
				} 
				else {	  
					console.log("recording stopped manually");
					console.log("recording status:" + record);
					record = false;
					break;
				}
		}
			console.log("recording finished");
			console.log("recording status:" + record);
	
	
		console.log("recording status:" + record);
	  
	  };

	const startRecording =() => {
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

	const handleFormData = (data) => {
		setFormData(data);
	}

	const stopRecording = () => {
		console.log("stop recording");
		audioRecorder.stop()
		.then(audioAsblob => {
			var file = blobToFile(audioAsblob, "audio.wav");
			const data = new FormData();
			data.append('file', file);
			data.append('model', 'whisper-1');
			setFormData(data);
       		setFormDataUpdated(true);
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
		 .then(audioAsblob=> {
			setAudioBlobs(audioAsblob);
			//splitAudioBlob(audioAsblob);
			/*var file = blobToFile(audioAsblob, "audio.wav");
			const data = new FormData();
			data.append('file', file);
			data.append('model', 'whisper-1');
			setFormData(data);
			console.log("formData"+formData);
			sendAudio();*/
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

		const respHead = await fetch('http://localhost:3001/noteHeadings', {
			method : 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({headings}),
		});

		const response = await fetch('http://localhost:3001', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({inputText}),
		})
		const data = await response.json();
		gptResponse.push(data.message);
		getHeadings(data.message);
		//setResponse(data.message);
		//setConvertedText(data.message);
	
		//props.onConvertedText(data.message);
		setLoading(false);
		props.isLoading(false);
		console.log(data.message);



		//	props.setConvertedText(data.message);
		/*.then(res => res.json())
		.then((data) => setResponse(data.message))
		.then((data) => setConvertedText(data.message))
		.then((data) => props.onConvertedText(data.message));*/
		console.log("submitted");

	  };


	

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

	  const sendAudioFile = async (dataFile) => {
		console.log("bouta send audio file");
		console.log(dataFile);
		props.isLoading(true);
		setLoading(true);
		const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
		  headers: {
			"Authorization": `Bearer ${key}`
		  },
		  method: "POST",
		  body: dataFile,
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
				<button className="record-button" onClick={()=>toggleAudioRecording()}>
				<img src={recordIcon} className="record-icon" alt= "recording button"/>
				</button>
			</div>
			<h2 className="header">
				Get Summerized Lectures With AI
			</h2>

			{
			<DropFileInput setFormData={setFormData}/>
				//setFormData={setFormData}
				//onFileChange={handleFile}>


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