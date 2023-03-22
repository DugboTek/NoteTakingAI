function combineMarkdownStrings(markdownStrings) {
	const combinedStrings = {};
	let currentHeading = null;
	
	markdownStrings.forEach((markdownString) => {
	  const lines = markdownString.split("\n");
	  
	  lines.forEach((line) => {
		const headingMatch = line.match(/^#+\s+(.*)/);
		
		if (headingMatch) {
		  currentHeading = headingMatch[1].trim();
		  if (!combinedStrings[currentHeading]) {
			combinedStrings[currentHeading] = [];
		  }
		} else if (currentHeading) {
		  combinedStrings[currentHeading].push(line.trim());
		}
	  });
	});
	
	let outputString = "";
	
	for (const heading in combinedStrings) {
	  outputString += `## ${heading}\n\n`;
	  combinedStrings[heading].forEach((line) => {
		outputString += `- ${line}\n`;
	  });
	  outputString += "\n";
	}
	
	return outputString;
  }

  function extractMarkdownHeadings(markdownString) {
	const headings = [];
	const lines = markdownString.split("\n");
	
	lines.forEach((line) => {
	  const headingMatch = line.match(/^#+\s+(.*)/);
	  
	  if (headingMatch) {
		headings.push(headingMatch[1].trim());
	  }
	});
	
	return headings.join("\n");
  }
  