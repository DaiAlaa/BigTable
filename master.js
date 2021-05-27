require('dotenv/config'); 
const winston = require('winston');
const connection = require('./master/data-base-connection');
var express = require('express');
const app = express();
connection(app);
const { Course: Course, Metadata: Metadata }= require('./data-base/data-base-schema');
const operations = require('./data-base/data-base-operations');

app.get('/', function (req, res) {
   res.send('Hello World');
})

var port = "8081"
var server = app.listen(port, function () {
   var host = "localhost"
   console.log("Example app listening at http://%s:%s", host, port)
})

 
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'output.log' }),
  ],
});

info = {
    message:"3aa",
    Port:8081
}
logger.info(info);




















////////////////////////Divide Data//////////////////////////////
metadataTablet1 = {}
metadataTablet2 = {}
metadataTablet3 = {}
dataTablet1 = []
dataTablet2 = []
dataTablet3 = []


async function DivideData(){
    courses = await Course.find({},[], {
        sort: {
        url: 1 
        },
    }, function(error, result) {
        return result
    });


    length = courses.length/3;
    dataTablet1 = courses.slice(0, length);
    dataTablet2 = courses.slice(length, 2*length);
    dataTablet3 = courses.slice(2*length, courses.length);
    metadataTablet1 = { start: dataTablet1[0].url, end: dataTablet1[dataTablet1.length-1].url, tabletServerId : 1 };
    metadataTablet2 = { start: dataTablet2[0].url, end: dataTablet2[dataTablet1.length-1].url, tabletServerId : 2 };
    metadataTablet3 = { start: dataTablet3[0].url, end: dataTablet3[dataTablet1.length-1].url, tabletServerId : 3 };
    
    return await Metadata.insertMany([metadataTablet1, metadataTablet2, metadataTablet3]);

    //send new data to tablets with sockets
    //send new data to clients
}
async function getMetadata(){
    return await Metadata.find({},[], {
        sort: {
            tabletServerId: 1 
        },
    }, function(error, result) {
        //console.log(result)
        return result
    });
    //sent it to clients every time client connects
    
}
// async function test(){
//     c = await getMetadata();
//     console.log(c)
// }
// test();
//DivideData()
