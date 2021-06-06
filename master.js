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
db = require('./data-base/data-base-operations')

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

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'output.log' }),
  ],
});


metadataTabletServer1 = {}
metadataTabletServer2 = {}
metadataClient = {}
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

    metadataTabletServer1 = {start: dataTablet1[0].url, end: dataTablet1[dataTablet2.length-1].url}

    metadataTabletServer2 = [{start: dataTablet2[0].url, end: dataTablet2[dataTablet2.length-1].url},
                             {start: dataTablet3[0].url, end: dataTablet3[dataTablet3.length-1].url}]
    metadataClient = [{start: dataTablet2[0].url,end: dataTablet3[dataTablet3.length-1].url , url : "http://localhost:5000"}, 
                      {start: dataTablet1[0].url, end: dataTablet1[dataTablet1.length-1].url, url : "http://localhost:3000"}]



}


var io = require('socket.io')(server);
io.on('connection', async function (socket) {
    await DivideData();
    socket.emit('tablet-data-2', {data:[dataTablet2,dataTablet3], metadata: metadataTabletServer2});
    socket.emit('tablet-data-1', {data:dataTablet1, metadata: metadataTabletServer1 });
    socket.emit('meta-data', metadataClient);
    
    socket.on('update', async function(data){
        for (let i=0;i<data[0].length;i++){
            await CourseMaster.updateOne({url:data[0][i]}, {$set:data[1][i]});
        }
        await DivideData();
        socket.emit('tablet-data-2', {data:[dataTablet2,dataTablet3], metadata: metadataTabletServer2});
        socket.emit('tablet-data-1', {data:dataTablet1, metadata: metadataTabletServer1 });
        io.emit('meta-data', metadataClient);
    
    })
    socket.on('deleteRows', async function(data){
        await db.DeleteRow(data, 4);
    })
    socket.on('addRow', async function(data){
        await db.AddRow(data, 4);
    })
    socket.on('Message', function(message){
        logger.info({"message":message,"SocketId":socket.id,"level":"info"});
    })

}); 

