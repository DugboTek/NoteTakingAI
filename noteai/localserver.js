const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;

//const response = await openai.listEngines();

// a express server, which will handle api requests coming in and respond back witha json object, it will use body-parser aswel as cross
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;



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
	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [
			{role: "system","content": "You are a helpful note generating robot that generates notes on important topics or details given an audio transcription."},
			{role: "user","content": "This is the class subject that the audio recording is about:" + `${subject}`+"use your prior knowlege on the topic to supplement the notes you generate. the title of the note should be Notes on: " + `${subject}`},
			{role: "user", "content": "The next user input will be the transcription of an audio file. Please provide detailed notes on the audio file and the teachers important points or details. Create headers on important points in the transcript. You will return the output in markdown format, for the header use ## for the Header and ### for subheaders, bold and italisize words that are important in the transcript and provide bulleted-list. after every new line create an aditional new line character."},
			{role: "user", "content": `${JSON.stringify(req.body)}`}
				],
		max_tokens: 2500,
		temperature: 0,
	});

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