require('dotenv/config'); 
var express = require('express');
const app = express();

const { CourseA: CourseA }= require('./data-base/data-base-schema');
const { CourseB: CourseB }= require('./data-base/data-base-schema');

async function DeleteRow(url, num){
    if(num==1)
        return await CourseA.deleteMany({url: url});
    else 
        return await CourseB.deleteMany({url: url});
    
}
 // array of objects
 async function AddRow(data, num){
    try{ 
        if(num==1)
            return await CourseA.insertMany(data);
        else
            return await CourseB.insertMany(data);
    } catch(e){
        
    }
 }
 // string
 async function ReadRows(url, num){
    if(num==1)
        return await CourseA.find({url: url},{},{});
    else
         return await CourseB.find({url: url},{},{});

 }
 // string, array of objects
 async function set(url, data, num){
    if(num==1)
        return await CourseA.updateMany({url: url},{$set:data});
    else
        return await CourseB.updateMany({url: url},{$set:data});
 } 
 // string, array of objects of empty strings
 async function DeleteCells(url, data, num){
    if(num==1)
        return await CourseA.updateMany({url: url},{$unset:data});
    else
        return await CourseB.updateMany({url: url},{$unset:data});
 }


var port = "5000"
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
///////////////////
socket1.on('tablet-data-1',async function (data){
    await CourseA.deleteMany({});
    await CourseA.insertMany(data.data[0]);
    await CourseB.deleteMany({});
    await CourseB.insertMany(data.data[1]);
    // await Metadata.deleteMany({});
    // await Metadata.insertMany(data.metadata[1]);    
})
arr =[]
var ioserver = require('socket.io')(server);
ioserver.on('connection', function (socket) {
    socket.on('Add row', async function(data){
        result = await AddRow(data[0],data[1]);
        socket.emit('Add row', result); 
        socket1.emit('Add row', data); 

    })
    socket.on('Delete row', async function(data){
        result = await DeleteRow(data[0],data[1]);
        socket.emit('Delete row', result); 
        socket1.emit('Delete row', data); 
    })
    socket.on('Read rows',async function(data){
        result = ReadRows(data[0],data[1]);  
        socket.emit('Read rows',result);  
    })
    socket.on('Delete cells', async function(data){
        arr.push(data[0]);
        result = await DeleteCells(data[0],data[1],data[2]);
        socket.emit('Delete cells', result);  
    })
    socket.on('Set',async function(data){
        arr.push(data[0]);
        result = await set(data[0], data[1], data[2]);
        socket.emit('Set',result);  

    })
    setInterval(async ()=>{
        result = await Course.find({url:arr},{_id:0});
        arr=new Set(arr);
        socket1.emit('update', [arr,result]);
        arr=[]
    }, 1000*15*60)
}); 

