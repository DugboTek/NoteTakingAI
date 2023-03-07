//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput.jsx';

const UploadFileBox = () => {
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