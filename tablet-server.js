require('dotenv/config'); 
const connection = require('./tablet-server/data-base-connection');
var express = require('express');
const app = express();
connection(app);
const { Course: Course, Metadata: Metadata }= require('./data-base/data-base-schema');
const operations = require('./data-base/data-base-operations');

app.get('/', function (req, res) {
   res.send('Hello World');
})

var port = "8083"
var server = app.listen(port, function () {
   var host = "localhost"
   console.log("Example app listening at http://%s:%s", host, port)
})

 
