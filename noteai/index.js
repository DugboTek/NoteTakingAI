const OpenAI = require('openai');
const {Configuration, OpenAIApi} = OpenAI;
//const response = await openai.listEngines();

// a express server, which will handle api requests coming in and respond back witha json object, it will use body-parser aswel as cross
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3001;


//TODO: add Whisper API integration

const configuration = new Configuration({
    organization: "org-z6irWsTc2C2dIvnVg5TEG2gE",
   // apiKey: "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",
   apiKey:"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",
});

const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());
app.use(cors());

app.post('/', async (req, res) => {
	// Destructure the `message` property from the `req.body` object using curly braces
	// This allows us to extract the `message` property and assign it to a variable with the same name
	const { message } = req.body;

	// Send a response back to the client with the message property
	const response = await openai.createChatCompletion({
		model: "gpt-3.5-turbo",
		messages: [{role: "user", content: `${message}`}],
		max_tokens: 20,
		temperature: 0,
	});

	console.log(response.data);

	if(response.data) {
		if(response.data.choices) {
			res.json({
				message: JSON.stringify(response.data.choices[0].message.content)
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