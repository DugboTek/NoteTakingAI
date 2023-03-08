//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;

const UploadFileBox = (props) => {
	
	const [convertedText, setConvertedText] = useState("");
	const [loading, setLoading] = useState(false);
	//const [formData, setFormData] = useState(null);
	const [hasFile, setHasFile] = useState(false);
	const api_key = process.env.OPEN_AI_KEY;


	/*const handleFile = async(e) =>{
  
		if (e.target.files && e.target.files[0]) 
		{
		  const file = e.target.files[0];
		  const data = new FormData();
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

	

	const sendAudio = (formData) => async () => {
		setLoading(true);
		const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
		  headers: {
			"Authorization": `Bearer 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`
		  },
		  method: "POST",
		  body: formData,
		});
		console.log("audio sent");
		const data = await res.json();
		setLoading(false);
		console.log(data);
		setConvertedText(data.text);
		props.onClick(convertedText);
	  };


	return(
		<div className="box">
			<h2 className="header">
				Get Summerized Lectures With AI
			</h2>
			{
			<DropFileInput>
				{(formData)=>(
					<button type = "button" className ="ant-btn" onClick={() => sendAudio(formData)}>Send Audio</button>
				)}
			</DropFileInput>
				//setFormData={setFormData}
				//onFileChange={handleFile}


			}
			
		</div>
	)
};

export default UploadFileBox;