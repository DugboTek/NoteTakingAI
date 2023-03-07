//import react
import React from 'react';
import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useState } from 'react';

import './drop-file-input.css';

import { ImageConfig } from '../../config/imageConfig';
import uploadImg from '../../assets/images/upload.png';



const DropFileInput = props => {
	const wrapperRef = useRef(null);
	const [fileList, setFileList] = useState([]);
	
	const [hasFile, setHasFile] = useState(false);

	const onDrageEnter = () => wrapperRef.current.classList.add('dragover');
	const onDrageLeave = () => wrapperRef.current.classList.remove('dragover');

	const onDrop = () => wrapperRef.current.classList.remove('dragover');

	
	const [formData, setFormData] = useState(null);
	// write a handleFile function that takes in a file and sets the formData state to a new FormData object with the file appended to it

	const handleFile = async(e) =>{
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const data = new FormData();
			data.append("file", file);
			data.append("model", "whisper-1");
			setFormData(data);
			console.log("File Uploaded");

			setHasFile(true); // set the flag to true
			if (file.size > 25 * 1024 * 1024) {
			alert("Please upload an audio file less than 25MB");
			console.log("Please upload an audio file less than 25MB");

			setHasFile(false); // reset the flag if the file is too big
			return;
			}
		}
	}

	return (
		<div 
			ref ={wrapperRef}
			className="drop-file-input"
			onDragEnter={onDrageEnter}
			onDragLeave={onDrageLeave}
			onDrop={onDrop}
		>
			<div className="drop-file-input__label">
				<img src={uploadImg} alt="upload" />
				<p>Drag & Drop your file here.</p>
			</div>
			<input
				type="file"
				accept="audio/*"
				onChange={handleFile}
			/>
		</div>
	);
}

DropFileInput.propTypes = {
}

export default DropFileInput