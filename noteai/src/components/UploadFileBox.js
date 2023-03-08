//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;

const UploadFileBox = (props) => {
	
	const [convertedText, setConvertedText] = useState("");
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState(null);
	const [hasFile, setHasFile] = useState(false);
	const api_key = process.env.OPEN_AI_KEY;


	const handleFile = async(e) =>{
  
		if (e.target.files && e.target.files[0]) 
		{
		  const file = e.target.files[0];
		  const data = new FormData();
		  data.append("file", file);
		  data.append("model", "whisper-1");
		  setFormData(data);
		  console.log("File Uploaded");
	  
		  setHasFile(true); // set the flag to true
		  if (file.size > 25 * 1024 * 1024) 
		  {
			alert("Please upload an audio file less than 25MB");
			console.log("Please upload an audio file less than 25MB");
	  
			setHasFile(false); // reset the flag if the file is too big
			return;
		  }
		}
	}

	


	return(
		<div className="box">
			<h2 className="header">
				Get Summerized Lectures With AI
			</h2>
			{
			<DropFileInput/>

			}
		</div>
	)
};

export default UploadFileBox;