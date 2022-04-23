const express = require("express");
const app = express();
const https = require('https');
const fs = require("fs");
const PORT = 8001 || process.env.PORT;
const HOST = '0.0.0.0' || process.env.HOST;

const key = fs.readFileSync("./cert.key");
const cert = fs.readFileSync("./cert.crt");

const credentials = {
  key: key,
  cert: cert,
};

app.use("/src", express.static("src"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

const server = https.createServer(credentials, app);
server.listen(PORT, HOST, () => {
	console.log("Server is start on address " + HOST + ":" + PORT + ", ssl/tls enabled");
});