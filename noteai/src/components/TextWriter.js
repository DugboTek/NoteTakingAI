
// TextWriter.js	
// This component is used to display text on the screen one character at a time.
// It takes in a text prop and a delay prop.
// The delay prop is the number of milliseconds between each character being displayed.

import React, { useEffect, useState } from 'react';

const TextWriter = ({ text, delay, divId }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDisplayText(prevDisplayText => {
        if (index >= text.length) {
          clearInterval(intervalId);
          return prevDisplayText;
        }
        return prevDisplayText + text.charAt(index);
      });
      setIndex(prevIndex => prevIndex + 1);
    }, delay);

    return () => clearInterval(intervalId);
  }, [text, delay, index]);

  return <div id={divId}>{displayText}</div>;
};

export default TextWriter;
  