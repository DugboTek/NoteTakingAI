const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;
//const response = await openai.listEngines();

// a express server, which will handle api requests coming in and respond back witha json object, it will use body-parser aswel as cross
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3001;


const davinci = true;
const gpt35 = false;

//TODO: add Whisper API integration
//whisper

const configuration = new Configuration({
    organization: "org-z6irWsTc2C2dIvnVg5TEG2gE",
   // apiKey: "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",
   apiKey:"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",
});

const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cors());

var subject = '';

function setSubject (inputSubject) {
	subject = inputSubject;
}


app.post('/noteDetails', async (req, res) => {
	
	// Destructure the `message` property from the `req.body` object using curly braces
	setSubject(req.body.userSubject);
	console.log(req.body);
	console.log("note Details:" + subject);
	res.send({message: "note details received"});
});


app.post('/', async (req, res) => {
	// Destructure the `message` property from the `req.body` object using curly braces
	// This allows us to extract the `message` property and assign it to a variable with the same name
	const { message } = req.body;
	console.log("message request:");
	console.log(JSON.stringify(req.body));
	// Send a response back to the client with the message property

	//	{role: "user", "content": "The next user input will be the transcription of an audio file. Please provide detailed notes on the audio file and the teachers important points or details."},
	if(davinci=true) {
		const subject = "your subject here";
		const transcription = JSON.stringify(req.body);

		const prompt = `You are a note generating robot that creates concise summaries from audio transcriptions using markdown and first-person perspective. Use prior knowledge on the topic to supplement the notes. The notes you generate are added to the bottom of previous notes so do not add any introduction or conclusion sections.

		User: You will create notes in the style of ${subject}
		User: Transcription: ${transcription}
		Assistant: Please provide a markdown-formatted summary with headers (##), subheaders (###), bold/italics, and bulleted lists. Use concise language and first-person perspective. Remove unnecessary words and phrases. Separate lines with an additional newline character.`;

		const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: prompt,
		max_tokens: 2500,
		temperature: 0,
		});

	}
	
	// gpt3.5-turbo
	if(gpt35 = true){
		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
				messages: [
				{role: "system", "content": "You are a note generating robot that creates concise summaries from audio transcriptions using markdown and first-person perspective. Use prior knowledge on the topic to supplement the notes. the notes you generate are added to the bottom of previous notes so do not add any introduction or conclusion sections."},
				{role: "user", "content": "You will create notes in the style of" + `${subject}`},
				{role: "user", "content": "Transcription: " + `${JSON.stringify(req.body)}`},
				{role: "assistant", "content": "Please provide a markdown-formatted summary with headers (##), subheaders (###), bold/italics, and bulleted lists. Use concise language and first-person perspective. Remove unnecessary words and phrases. Separate lines with an additional newline character."}
				],
				max_tokens: 2500,
				temperature: 0,
		});
	}

	console.log(response.data.choices[0].message.content);
	console.log("app.post() called");

	if(response.data) {
		if(response.data.choices) {
			res.json({
				message: response.data.choices[0].message.content
			})
		}
	}

});

// app.get('/', (req, res) => {
// 	res.json({
// 		message: 'Hello World!'
// 	})
// });

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});