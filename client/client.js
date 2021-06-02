var express = require('express');
const app = express();

app.get('/', function (req, res) {
   res.send('Hello World');
})

var io = require('socket.io-client');
var socket = io.connect("http://localhost:3000/", {
    reconnection: true
});
var socketmaster = io.connect("http://localhost:4000/", {
    reconnection: true
});
socketmaster.on('connect', function () {
   console.log('connected to localhost:4000');
   socketmaster.on('meta-data',function (data){
     console.log('meta data:', data); 
   })
   
});
socket.on('connect', function () {
    console.log('connected to localhost:3000');
   data={'read': {url:"https://www.udem33y.com/lets-learn-javascript-by-coding/" }}
   socket.emit('insert', data)
    
});


