//import react
import React, { useState } from 'react';
import DropFileInput from './Drop-File-Input/DropFileInput';
import './text-area-box.css';

const fillerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies lacinia, nisl nisl aliquet nisl, eget aliquet nis";

const TextAreaBox = ({text}) => {
	return(
		<div className="flex flex-column flex-1">
			<div className ="boxdefault results-card">
				<div className = "box-body">
					<div className="text-area">
						<div className = "output-format">
							{fillerText}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
};

//write random filler text

export default TextAreaBox;