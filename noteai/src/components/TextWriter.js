
// TextWriter.js	
// This component is used to display text on the screen one character at a time.
// It takes in a text prop and a delay prop.
// The delay prop is the number of milliseconds between each character being displayed.

import React, { useEffect, useState } from 'react';

const TextWriter = ({ text, delay }) => {
	const [displayText, setDisplayText] = useState("");
	const [index, setIndex] = useState(0);
  
	useEffect(() => {
	  const timer = setInterval(() => {
		const currentChar = text.charAt(index);
		const nextChar = text.charAt(index + 1);
		setDisplayText((prevDisplayText) => {
		  if (currentChar === "." && nextChar !== " ") {
			return prevDisplayText + currentChar + " ";
		  }
		  return prevDisplayText + currentChar;
		});
		setIndex((prevIndex) => prevIndex + 1);
	  }, delay);
  
	  return () => clearInterval(timer);
	}, [text, delay, index]);
  
	return <div>{displayText}</div>;
  };
  
  export default TextWriter;

  