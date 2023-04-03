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
const TextAreaBox = (props) => {
	//const [textVals, setTextVals] = useState('');
	const{text} = props;
	//setTextVals(textVals+text);
	console.log("TextArea")
	//
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
							{
								props.loading ?
								
								<ScaleLoader
								size={50}
								color={"#cd5f44"}
								loading={props.loading}
								/>

								:
							
								<ReactMarkdown 
									source={text}
									escapeHtml={false} // allows rendering of HTML tags
									skipHtml={false}   // allows rendering of HTML tags
									linkTarget="_blank" // opens links in a new tab
								>
									{
									text
									}
								</ReactMarkdown>
							}	
							</div>
						
					</div>
				</div>
			</div>
		</div>
	)
};

//write random filler text

export default TextAreaBox;