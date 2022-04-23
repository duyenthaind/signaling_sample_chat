const express = require('express');
const app = express();
const PORT = 8001 || process.env.PORT;
const HOST = '0.0.0.0' || process.env.HOST;

app.use('/src', express.static('src'))

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, HOST, function () {
	console.log('listening on localhost:' + PORT);
});