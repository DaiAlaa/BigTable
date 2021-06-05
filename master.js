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

require("localtunnel")({ port: 4000, subdomain: "master123321kareem3m" }).then(() => {
    console.log("Master Online".info);
  });

require('dotenv/config'); 
const winston = require('winston');
// const connection = require('./master/data-base-connection');
var express = require('express');
const app = express();
// connection(app);
const { CourseMaster: CourseMaster, Metadata: Metadata }= require('./data-base/data-base-schema');
// const operations = require('./data-base/data-base-operations');

app.get('/', function (req, res) {
   res.send('Hello World');
})

var port = "4000"
var server = app.listen(port, function () {
   var host = "localhost"
   console.log("Example app listening at http://%s:%s", host, port)
})

async function DeleteRow(url){
    return await CourseMaster.deleteMany({url: url});
 }
 // array of objects
 async function AddRow(data){
    try{ 
    return await CourseMaster.insertMany(data);
    } catch(e){
        
    }
 }
 // string
 async function ReadRows(url){
     return await CourseMaster.find({url: url},{},{}, function(error, result) {
         return result
     });
 }
 // string, array of objects
 async function Set(url, data){
     return await CourseMaster.updateMany({url: url},{$set:data}, function(error, result) {
         return result
     });
 } 
 // string, array of objects of empty strings
 async function DeleteCells(url, data){
     return await CourseMaster.updateMany({url: url},{$unset:data}, function(error, result) {
         return result
     });
 }

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'output.log' }),
  ],
});


metadataTablet1 = {}
metadataTablet2 = {}
metadataTablet3 = {}
dataTablet1 = []
dataTablet2 = []
dataTablet3 = []


async function DivideData(){
    courses = await CourseMaster.find({},[], {
        sort: {
        url: 1 
        },
    }, function(error, result) {
        return result
    });

    length = courses.length/2;
    dataTablet1 = courses.slice(0, length);
    dataTablet2 = courses.slice(length, length+length/2);
    dataTablet3 = courses.slice(length+length/2, courses.length);
    console.log(dataTablet1.length, dataTablet2.length, dataTablet3.length)

    metadataTablet1 = { start: dataTablet1[0].url, end: dataTablet1[dataTablet1.length-1].url, tabletServerId : 1 };
    metadataTablet2 = { start: dataTablet2[0].url, end: dataTablet2[dataTablet2.length-1].url, tabletServerId : 2 };
    metadataTablet3 = { start: dataTablet3[0].url, end: dataTablet3[dataTablet3.length-1].url, tabletServerId : 3 };
    try{
        await Metadata.insertMany([metadataTablet1, metadataTablet2, metadataTablet3]);
    }
    catch(except){
        
    }
}
async function getMetadata(){
    return await Metadata.find({},[], {
        sort: {
            tabletServerId: 1 
        },
    }, function(error, result) {
        return result
    });
    
}

var io = require('socket.io')(server);
io.on('connection', async function (socket) {
    await DivideData();
    metaData = await getMetadata();
    console.log(metaData);
    socket.emit('tablet-data-1', {data:[dataTablet1,dataTablet2], metadata:[metaData[0],metaData[1]]});
    socket.emit('tablet-data-2', {data:dataTablet3, metadata:metaData[2]});
    socket.emit('meta-data', metaData);
    
    socket.on('update', async function(data){
        for (let i=0;i<data[0].length;i++){
            await CourseMaster.updateOne({url:data[0][i]}, {$set:data[1][i]});
        }
        await DivideData();
        metaData = await getMetadata();
        socket.emit('tablet-data-1', {data:[dataTablet1,dataTablet2], metadata:[metaData[0],metaData[1]]});
        socket.emit('tablet-data-2', {data:dataTablet3, metadata:metaData[2]});
        socket.emit('meta-data', metaData);    
    })
    socket.on('Delete row', async function(data){
        await DeleteRow(data);
    })
    socket.on('Add row', async function(data){
        await AddRow(data);
    })
    socket.on('Message', function(message){
        logger.info({"message":message,"Port":8081,"level":"info"})
    })

}); 

