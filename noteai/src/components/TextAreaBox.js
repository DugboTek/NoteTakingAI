//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import TextWriter from './TextWriter.js';
import ReactMarkdown from 'react-markdown'

import './text-area-box.css';
import TextWriteOut from './textWriteOut';

const fillerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies lacinia, nisl nisl aliquet nisl, eget aliquet nis";

const TextAreaBox = (props) => {
	const{text} = props;
	console.log("TextArea")
	//<TextWriter text={text} delay={50} divId="outputDiv" />
	console.log(text);
	return(
		<div className="flex flex-column flex-1">
			<div className ="boxdefault results-card">
				<div className = "box-body">
					<div className="text-area">
						<h1 className="text-area-title">Your Notes</h1>
						<div className="loader">
						</div>	
						
							<div className = "output-format" id="outputDiv">
							<ReactMarkdown 
								source={text}
								escapeHtml={false} // allows rendering of HTML tags
								skipHtml={false}   // allows rendering of HTML tags
								linkTarget="_blank" // opens links in a new tab
              				>
								{text}
							</ReactMarkdown>
							</div>
						
					</div>
				</div>
			</div>
		</div>
	)
};

//write random filler text

export default TextAreaBox;