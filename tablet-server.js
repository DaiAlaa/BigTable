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

var port = "3000"
var server = app.listen(port, function () {
   var host = "localhost"
   console.log("Example app listening at http://%s:%s", host, port)
})

var ioserver = require('socket.io')(server);
ioserver.on('connection', async function (socket) {
    console.log('connected:', socket.client.id);
    socket.on('serverEvent', function (data) {
        console.log('new message from client:', data);
    });
    socket.on('insert',function(data){
       console.log(data);
    })

}); 

var io = require('socket.io-client');
var socket = io.connect("http://localhost:4000/", {
    reconnection: true
});

socket.on('connect', function () {
    console.log('connected to localhost:4000');
    socket.emit('tablet', 1);
    socket.on('tablet-meta-data',function (data){
        //console.log('meta data:', data);
    })
    
});

 
