const MASTER_URL = "http://localhost:4000";
var colors = require("colors");
colors.setTheme({
  input: "grey",
  verbose: ["cyan", "bold"],
  prompt: "grey",
  info: ["green", "bold"],
  data: "grey",
  help: "cyan",
  warn: "yellow",
  debug: "blue",
  error: "red",
});

require("localtunnel")({ port: 4000, subdomain: "ts1kareem3m" }).then(() => {
    console.log("Tablet Server Online".info);
  });


require('dotenv/config'); 
db = require('./data-base/data-base-operations')
// const connection = require('./tablet-server/data-base-connection');
var express = require('express');
const app = express();
// connection(app);
const { Course: Course, Metadata: Metadata }= require('./data-base/data-base-schema');

// TODO get tablet of given Key
// TODO put online url
// TODO el operations been el client w el server tablet

var port = "3000"
var server = app.listen(port, function () {
   var host = "localhost"
   console.log("Example app listening at http://%s:%s", host, port)
})


var io = require('socket.io-client');
var socket1 = io.connect(MASTER_URL, {
    reconnection: true
});

socket1.on('connect', function () {
    console.log('connected to Master'.info);    
});
socket1.on('tablet-data-2',async function (data){
    await Course.deleteMany({});
    await Course.insertMany(data.data);
    socket1.emit('Message', "hi")
    // await Metadata.deleteMany({});
    // await Metadata.insertMany(data.metadata);    
})
arr =[]
var ioserver = require('socket.io')(server);
ioserver.on('connection', function (socket) {
    socket.on('Add row', async function(data){
        result = await db.AddRow(data[0]);
        socket.emit('Add row', result); 
        socket1.emit('Add row', data[0]); 

    })
    socket.on('Delete row', async function(data){
        result = await db.DeleteRow(data[0]);
        socket.emit('Delete row', result); 
        socket1.emit('Delete row', data[0]); 
    })
    socket.on('Read rows',async function(data){
        result = db.ReadRows(data[0]);  
        socket.emit('Read rows',result);  
    })
    socket.on('Delete cells', async function(data){
        arr.push(data[0]);
        result = await db.DeleteCells(data[0], data[1]);
        socket.emit('Delete cells', result);  
    })
    socket.on('Set',async function(data){
        arr.push(data[0]);
        result = await db.set(data[0], data[1]);
        socket.emit('Set',result);  

    })
    setInterval(async ()=>{
        result = await Course.find({url:arr},{_id:0});
        arr=new Set(arr);
        socket1.emit('update', [arr,result]);
        arr=[]
    }, 1000*15*60)
}); 

