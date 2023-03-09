//a function that takes in a string and a delay and slowly displays it on the screen character by character waiting delay seconds before displaying the next character

const textWriteOut = (text, delay, divId) => {
	let i = 0;
	const intervalId = setInterval(() => {
	  document.getElementById(divId).textContent += text[i];
	  i++;
	  if (i === text.length) {
		clearInterval(intervalId);
	  }
	}, delay * 1000);
  };

  export default textWriteOut;
