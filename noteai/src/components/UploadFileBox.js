import React, { useState, useEffect } from "react";
import DropFileInput from "./Drop-File-Input/DropFileInput";
import recordIcon from "../assets/images/record-black.png";
import { WebVoiceProcessor } from "@picovoice/web-voice-processor";
import lamejs from "lamejstmp";
import GPT3Tokenizer from "gpt3-tokenizer";

const OpenAI = require("openai");

const key = process.env.React_App_OPEN_AI_API_KEY;

const UploadFileBox = (props) => {
  const [convertedText, setConvertedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [formDataList, setFormDataList] = useState([]);
  const [hasFile, setHasFile] = useState(false);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [response, setResponse] = useState("");
  const [old, setOld] = useState([]);
  const [userSubject, setUserSubject] = useState("");
  const [file, setFile] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const trackLengthInMS = 1000; // Length of audio chunk in miliseconds
  const maxNumOfSecs = 1000; // Number of mili seconds we support per recording (1 second)

  const maxFileSize = 2 * 1024 * 1024; // 20 MB
  let mp3Encoder;

  function numTokensFromMessages(messages, model = "gpt3") {
    const tokenizer = new GPT3Tokenizer({ type: model });
    let numTokens = 0;
    const encoded = tokenizer.encode(messages);
    numTokens += encoded.bpe.length;
    return numTokens;
  }

  function splitTranscription(text, maxTokens = 3096) {
	console.log("splitting text");
    const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
    const tokens = tokenizer.encode(text).bpe;
    const segments = [];

    for (let i = 0; i < tokens.length; i += maxTokens) {
      const segmentTokens = tokens.slice(i, i + maxTokens);
      const segmentText = tokenizer.decode(segmentTokens);
      segments.push(segmentText);
    }

    return segments;
  }

  const webVoiceProcessor = new WebVoiceProcessor({
    context: "browsers",
    frameLength: 512,
    sampleRate: 16000,
  });

  const calculateFileSize = () => {
	let fileSize = 0;
	recordedChunks.forEach((chunk) => {
	  fileSize += chunk.length;
	});
	return fileSize;
  };

  const processAudioData = async (inputFrame) => {
    const mp3Data = mp3Encoder.encodeBuffer(inputFrame);
    if (mp3Data.length > 0) {
      setRecordedChunks((prevChunks) => [...prevChunks, mp3Data]);
    }
    let filesize = calculateFileSize();
    // if (filesize % 5 == 0) {
    //   console.log(filesize);
    // }

    if (calculateFileSize() > maxFileSize) {
      console.log("Max file size reached. Stopping recording. File size:");
	  console.log(filesize);
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
        console.log("ubsubscribeing...");
        await WebVoiceProcessor.unsubscribe(audioProcessor);
        console.log(recordedChunks);
        sendAudio();
      } catch (error) {
        console.error("An error occurred while stopping the recorder: ", error);
      } finally {
        setRecording(false);
        console.log("stopping recording...");
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
    const resp = await fetch("https://scribb.ai:3001/noteDetails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userSubject }),
    });

    const response = await fetch("https://scribb.ai:3001", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputText }),
    });
    const data = await response.json(); //hi+old
    const newMessage = data.message;
    setOld((prevMessages) => [...prevMessages, newMessage]);
    const allMessages = old.concat(newMessage).join("\n");

    // Return the response message
    return newMessage;
  };

  const sendAudio = async () => {
    try {
      props.isLoading(true);
      setLoading(true);
      // Stop recording and get the recorded audio Blob as an MP3 file
      const audioBlob = new Blob(recordedChunks, { type: "audio/mpeg" });
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

      // Split the transcribed text into segments of 3096 tokens each
      const textSegments = splitTranscription(responseJson.text);
      let allResponses = [];

      // Process each text segment separately
      for (const textSegment of textSegments) {
		console.log("processing segment");
        const segmentResponse = await handleSubmit(textSegment);
        allResponses.push(segmentResponse);
      }

      // Combine the responses
      const combinedResponse = allResponses.join("\n");
      setConvertedText(combinedResponse);
      props.onConvertedText(combinedResponse);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      props.isLoading(false);
    }
  };

  const sendAudioFile = async (dataList) => {
	try {
	  props.isLoading(true);
	  setLoading(true);
  
	  let allResponses = [];
  
	  for (let index = 0; index < dataList.length; index++) {
		const data = dataList[index];
  
		const chunkFile = data.get('file');
		console.log(`Sending chunk ${index + 1} - Type: ${chunkFile.type}, Name: ${chunkFile.name}`); // Log the chunk information
  
		// Send the audio file to the API for transcription
		let res = await Promise.race([
			fetch("https://api.openai.com/v1/audio/transcriptions", {
			  headers: {
				Authorization: `Bearer ${key}`,
			  },
			  method: "POST",
			  body: data,
			}),
			new Promise((_, reject) =>
			  setTimeout(() => reject(`Timeout on chunk ${index + 1}`), 1280000)
			),
		  ]);
	
  
		let responseJson = await res.json();
		console.log(responseJson);
  
		// Split the transcribed text into segments of 3096 tokens each
		//const textSegments = splitTranscription(responseJson.text);
  
		// Process each text segment separately
		/*for (const textSegment of textSegments) {
		  console.log("processing segment");
		  const segmentResponse = await handleSubmit(textSegment);
		  allResponses.push(segmentResponse);
		}*/
		const respseg = await handleSubmit(responseJson.text);
		allResponses.push(respseg);
	  }
  
	  // Combine the responses
	  const combinedResponse = allResponses.join("\n");
	  setConvertedText(combinedResponse);
	  props.onConvertedText(combinedResponse);
  
	} catch (error) {
	  console.error(error);
	} finally {
	  setLoading(false);
	  props.isLoading(false);
	}
  };
  
  
  

  return (
    <div className="box--upload">
      <div className="microphone-box">
        <button
          className={`record-button${recording ? "-recording" : ""}`}
          onClick={toggleAudioRecording}
        >
          <img
            src={recordIcon}
            className="record-icon"
            alt="recording button"
          />
        </button>
      </div>
      <h2 className="header">Get Summerized Lectures With AI</h2>

      {
        <DropFileInput setFormDataList={setFormDataList} />
        //setFormData={setFormData}
        //onFileChange={handleFile}
      }
      <form>
        <div class="input-container">
          <input
            type="text"
            onChange={(e) => setUserSubject(e.target.value)}
            id="subject"
            name="subject"
            placeholder="Enter The Class Subject"
            required
            class="text-input"
          />
          <label for="subject" class="label">
            Subject
          </label>
        </div>

        <button
          type="button"
          className="ant-btn padded marginTop"
          onClick={() => sendAudioFile(formDataList)}
        >
          Generate Notes
        </button>
      </form>
    </div>
  );
};

export default UploadFileBox;
