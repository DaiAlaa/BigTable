const MASTER_URL = "https://master123321kareem3m.loca.lt";
var colors = require("colors");
var logger = require('./logger.js');

colors.setTheme({
    input: "grey",
    verbose: ["cyan", "bold"],
    prompt: "grey",
    info: [" blue", "bold"],
    data: "grey",
    help: "cyan",
    warn: "yellow",
    debug: "blue",
    error: "red",
  });
  
require("localtunnel")({ port: 5000, subdomain: "ts2777kareem3m" }).then(() => {
    console.log("Tablet Server Online".info);
});

require("dotenv/config");
const Course = require('./data-base/data-base-schema');
const { CourseA: CourseA } = require("./data-base/data-base-schema");
const { CourseB: CourseB } = require("./data-base/data-base-schema");
var express = require("express");
const app = express();
db = require('./data-base/data-base-operations')

var port = "5000";
var server = app.listen(port, function () {
  var host = "localhost";
  console.log("Example app listening at http://%s:%s", host, port);
});

var io = require("socket.io-client");
var socket1 = io.connect(MASTER_URL, {
  reconnection: true,
});

socket1.on("connect", function () {
  logger.info({"message":"Tablet Server 2 connected to master"});
  console.log("connected to Master");
});
rowKey = [];
updatedData = [];
///////////////////
socket1.on("tablet-data-2", async function (data) {
  await CourseA.deleteMany({});
  await CourseA.insertMany(data.data[0]);
  await CourseB.deleteMany({});
  await CourseB.insertMany(data.data[1]);
  metadata=data.metadata
  logger.info({"message":"Tablet Server 2 recieved metadata"});
  console.log("meta recieved", metadata)
});
arr = [];
function updateInsert(cols, data) {
  dataObject = {};
  for (i = 0; i < cols.length; i++) dataObject[cols[i]] = data[i];
     return dataObject;
}
function deleteCells(cols){
    dataObject = {};
    for (i = 0; i < cols.length; i++) dataObject[cols[i]] = "";
       return dataObject;
}
var ioserver = require("socket.io")(server);
ioserver.on("connection", function (socket) {
    console.log("Client connected")
    socket.on("addRow", async function (data) {
      logger.info({"message":"Tablet Server 2 received query addRow", "rowKey": data["rowKey"]});
      dataObject = updateInsert(data["cols"], data["data"]);
      result = await db.AddRow({url:data["rowKey"], ...dataObject}, Tablet(data["rowKey"]));
      socket.emit("addRow", result);
      socket1.emit("addRow", {url:data["rowKey"], ...dataObject});
  });
  socket.on("deleteRows", async function (data) {
    Mutex.runExclusive( async () => {
      logger.info({"message":"Tablet Server 2 received query deleteRows","rowKey": data["rowKey"]});
      result = await db.DeleteRow(data,Tablet(data[0]));
      socket.emit("deleteRows", result);
      socket1.emit("deleteRows", data);
    })
  });
  socket.on("readRows", async function (data) {
    Mutex.runExclusive( async () => {
      logger.info({"message":"Tablet Server 2 received query readRows", "rowKeys": data});
      result = await db.ReadRows(data, Tablet(data[0]));
      console.log(data, result)
      socket.emit("readRows", result);
    })
  });
  socket.on("deleteCells", async function (data) {
    Mutex.runExclusive( async () => {

      logger.info({"message":"Tablet Server 2 received query deleteCells", "rowKey": data["rowKey"]});

      dataObject = deleteCells(data["cols"]);
      result = await db.DeleteCells(data["rowKey"],dataObject, Tablet(data["rowKey"]));
      socket.emit("deleteCells", result);

      tablet = await db.ReadRows(data["rowKey"],  Tablet(data["rowKey"]));
      rowKey.push(data["rowKey"]);
      updatedData.push(tablet);
    })
  });
  socket.on("setCells", async function (data) {
    Mutex.runExclusive( async () => {
      logger.info({"message":"Tablet Server 2 received query setCells", "data": data});
      dataObject = updateInsert(data["cols"], data["data"]);
      result = await db.set(data["rowKey"],dataObject, Tablet(data["rowKey"]));
      socket.emit("setCells", result);
      tablet = await db.ReadRows(data["rowKey"],  Tablet(data["rowKey"]));
      rowKey.push(data["rowKey"]);
      updatedData.push(tablet);
    })
  });
  setInterval(async () => {
    socket1.emit("update", [rowKey, updatedData]);
    logger.info({"message":"Tablet Server 2 send updated data to master" });
    rowKey = [];
    updatedData = [];
  }, 1000 * 1 * 60);


});
function Tablet(rowKey) {
  index = metadata.findIndex((t) => rowKey >= t.start && rowKey <= t.end);
  if(index==-1)
    index = 1;
  return index+1;
}
