require('dotenv/config'); 
// const connection = require('./tablet-server/data-base-connection');
var express = require('express');
const app = express();
// connection(app);
const { Course: Course, Metadata: Metadata }= require('./data-base/data-base-schema');
async function DeleteRow(url){
    return await Course.deleteMany({url: url});
 }
 // array of objects
 async function AddRow(data){
    try{ 
        return await Course.insertMany(data);
    } catch(e){
        
    }
 }
 // string
 async function ReadRows(url){
     return await Course.find({url: url},{},{}, function(error, result) {
         return result
     });
 }
 // string, array of objects
 async function set(url, data){
     return await Course.updateMany({url: url},{$set:data}, function(error, result) {
         return result
     });
 } 
 // string, array of objects of empty strings
 async function DeleteCells(url, data){
     return await Course.updateMany({url: url},{$unset:data}, function(error, result) {
         return result
     });
 }


var port = "3000"
var server = app.listen(port, function () {
   var host = "localhost"
   console.log("Example app listening at http://%s:%s", host, port)
})


var io = require('socket.io-client');
var socket1 = io.connect("http://localhost:4000/", {
    reconnection: true
});

socket1.on('connect', function () {
    console.log('connected to Master');    
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
        result = await AddRow(data[0]);
        socket.emit('Add row', result); 
        socket1.emit('Add row', data[0]); 

    })
    socket.on('Delete row', async function(data){
        result = await DeleteRow(data[0]);
        socket.emit('Delete row', result); 
        socket1.emit('Delete row', data[0]); 
    })
    socket.on('Read rows',async function(data){
        result = ReadRows(data[0]);  
        socket.emit('Read rows',result);  
    })
    socket.on('Delete cells', async function(data){
        arr.push(data[0]);
        result = await DeleteCells(data[0], data[1]);
        socket.emit('Delete cells', result);  
    })
    socket.on('Set',async function(data){
        arr.push(data[0]);
        result = await set(data[0], data[1]);
        socket.emit('Set',result);  

    })
    setInterval(async ()=>{
        result = await Course.find({url:arr},{_id:0});
        arr=new Set(arr);
        socket1.emit('update', [arr,result]);
        arr=[]
    }, 1000*15*60)
}); 

