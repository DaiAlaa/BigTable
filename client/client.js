var express = require('express');
const app = express();

app.get('/', function (req, res) {
   res.send('Hello World');
})

var io = require('socket.io-client');
var socket = io.connect("http://localhost:3000/", {
    reconnection: true
});
var socket2= io.connect("http://localhost:4000/", {
    reconnection: true
});
socket2.on('connect', function () {
   console.log('connected to localhost:4000');
});


socket2.on('meta-data',function (data){
    socket2.emit('Message',"lhjh"); 
})

socket.on('connect', function () {
    console.log('connected to localhost:3000');
    data1= { url:"https://www.udemy.com/lets-learn-javascript-by-coding/", course_title:"ma7ro2a" }
    data2= { url:"mdhkhdkdhndjkfhgsjdg" }
    data3= { url:"makhtofa" }

    
    data4= { url:"ma2tola" }
    data5= { url:"makhno2a" }
    socket.emit('Set',[data1.url, data1]);
    socket.emit('Add row',[data2,1]);
    socket.emit('Add row',[data3,1]);
    socket.emit('Add row',[data4,2]);
    socket.emit('Add row',[data5,2]);


});

//get metadata async function
//update metdata async function
//choose which tablet server to send query to
//emit out of connect
