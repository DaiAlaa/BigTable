const MASTER_URL = "http://localhost:4000";
var colors = require("colors");
m = require('async-mutex');
const mutex = new m.Mutex();
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
  


require("dotenv/config");
const Course = require('./data-base/data-base-schema');
const { CourseA: CourseA } = require("./data-base/data-base-schema");
const { CourseB: CourseB } = require("./data-base/data-base-schema");
var express = require("express");
const app = express();
db = require('./data-base/data-base-operations')

var port = "5000";
var server = app.listen(5000, function () {
  var host = "localhost";
  console.log("Example app listening at http://%s:%s", host, port);
});

var io = require("socket.io-client");
var socket1 = io.connect(MASTER_URL, {
  reconnection: true,
});

socket1.on("connect", function () {
  socket1.emit("message", {"message":"Tablet Server 2 connected to master"});
  console.log("connected to Master");
});
metadata=[];

rowKey = [];
updatedData = [];
///////////////////
socket1.on("tablet-data-2", async function (data) {
  metadata=data.metadata
  console.log(metadata)
  socket1.emit("message", {"message":"Tablet Server 2 recieved metadata"});
  await CourseA.deleteMany({});
  await CourseA.insertMany(data.data[0]);
  await CourseB.deleteMany({});
  await CourseB.insertMany(data.data[1]);
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
      socket1.emit("message", {"message":"Tablet Server 2 received query addRow", "rowKey": data["rowKey"]});
      dataObject = updateInsert(data["cols"], data["data"]);
      result = await db.AddRow({url:data["rowKey"], ...dataObject}, Tablet(data["rowKey"]));
      socket.emit("addRow", result);
      socket1.emit("addRow", {url:data["rowKey"], ...dataObject});
  });
  socket.on("deleteRows", async function (data) {
    mutex.runExclusive( async () => {
      socket1.emit("message", {"message":"Tablet Server 2 received query deleteRows","rowKey": data["rowKey"]});
      result = await db.DeleteRow(data,Tablet(data[0]));
      socket.emit("deleteRows", result);
      socket1.emit("deleteRows", data);
    })
  });
  socket.on("readRows", async function (data) {
    mutex.runExclusive( async () => {
      socket1.emit("message", {"message":"Tablet Server 2 received query readRows", "rowKeys": data});
      result = await db.ReadRows(data, Tablet(data[0]));
      console.log(data, result)
      socket.emit("readRows", result);
    })
  });
  socket.on("deleteCells", async function (data) {
    mutex.runExclusive( async () => {

      socket1.emit("message", {"message":"Tablet Server 2 received query deleteCells", "rowKey": data["rowKey"]});

      dataObject = deleteCells(data["cols"]);
      result = await db.DeleteCells(data["rowKey"],dataObject, Tablet(data["rowKey"]));
      socket.emit("deleteCells", result);

      tablet = await db.findRows(data["rowKey"],  Tablet(data["rowKey"]));
      rowKey.push(data["rowKey"]);
      updatedData.push(tablet[0]);
    })
  });
  socket.on("setCells", async function (data) {
    mutex.runExclusive( async () => {
      socket1.emit("message", {"message":"Tablet Server 2 received query setCells", "data": data});
      dataObject = updateInsert(data["cols"], data["data"]);
      result = await db.set(data["rowKey"],dataObject, Tablet(data["rowKey"]));
      socket.emit("setCells", result);
      tablet = await db.findRows(data["rowKey"],  Tablet(data["rowKey"]));
      rowKey.push(data["rowKey"]);
      updatedData.push(tablet[0]);
    })
  });
  setInterval(async () => {
    socket1.emit("update", [rowKey, updatedData]);
    socket1.emit("message", {"message":"Tablet Server 2 send updated data to master" });
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
