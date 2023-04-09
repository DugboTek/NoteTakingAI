//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import TextWriter from './TextWriter.js';
import ReactMarkdown from 'react-markdown'
import { ScaleLoader } from 'react-spinners';

import './text-area-box.css';
import TextWriteOut from './textWriteOut';

const fillerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies lacinia, nisl nisl aliquet nisl, eget aliquet nis";
const initialText = 'test'
	//const [textVals, setTextVals] = useState('');
const TextAreaBox = (props) => {
	const { text, loading } = props;
  
	return (
	  <div className="flex flex-column flex-1">
		<div className="boxdefault results-card">
		  <div className="box-body">
			<div className="text-area">
			  <div className="text-area-title">Your Notes</div>
			  <div className="output-format" id="outputDiv">
				<ReactMarkdown
				  source={text}
				  escapeHtml={false}
				  skipHtml={false}
				  linkTarget="_blank"
				>
				  {text}
				</ReactMarkdown>
  
				{loading && (
				  <div class="book">
					<div class="book__pg-shadow"></div>
					<div class="book__pg"></div>
					<div class="book__pg book__pg--2"></div>
					<div class="book__pg book__pg--3"></div>
					<div class="book__pg book__pg--4"></div>
					<div class="book__pg book__pg--5"></div>
			  	</div>
				)}
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	);
  };
  

//write random filler text

export default TextAreaBox;