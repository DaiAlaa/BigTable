const MASTER_URL = "http://localhost:4000";
var colors = require("colors");
m = require('async-mutex');
const mutex = new m.Mutex();


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

  

require("dotenv/config");
const { Course: Course } = require("./data-base/data-base-schema");
var express = require("express");
const app = express();
db = require('./data-base/data-base-operations')
app.get('/', function (req, res) {
  res.send('Hello World');
})
var port = "3000";
var server = app.listen(port, function () {
  var host = "localhost";
  console.log("Example app listening at http://%s:%s", host, port);
});

var io = require("socket.io-client");
var socket1 = io.connect(MASTER_URL, {
  reconnection: true,
});

socket1.on("connect", function () {
  console.log("connected to Master");
  socket1.emit("message", {"message":"Tablet Server 1 connected to master"});

});

metadata=[]
///////////////////
socket1.on("tablet-data-1", async function (data) {
  metadata=data.metadata
  console.log(metadata)
  socket1.emit("message", {"message":"Tablet Server 1 recieved metadata"});

  await Course.deleteMany({});
  await Course.insertMany(data.data);
});

rowKey = [];
updatedData = [];
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
    mutex.runExclusive( async () => {
      socket1.emit("message", {"message":"Tablet Server 1 received query addRow", "rowKey": data["rowKey"]});
      dataObject = updateInsert(data["cols"], data["data"]);
      result = await db.AddRow({url:data["rowKey"], ...dataObject}, 3);
      socket.emit("addRow", result);
      socket1.emit("addRow", {url:data["rowKey"], ...dataObject});
    })
  });
  socket.on("deleteRows", async function (data) {
    mutex.runExclusive( async () => {
      socket1.emit("message", {"message":"Tablet Server 1 received query deleteRows","rowKey": data["rowKey"]});
      console.log(data)
      result = await db.DeleteRow(data,3);
      socket.emit("deleteRows", result);
      socket1.emit("deleteRows", data);
    })
  });
  socket.on("readRows", async function (data) {
    mutex.runExclusive( async () => {
      socket1.emit("message", {"message":"Tablet Server 1 received query readRows", "rowKeys": data});
      result = await db.ReadRows(data, 3);
      console.log(data, result)
      socket.emit("readRows", result);
    })
  });
  socket.on("deleteCells", async function (data) {
    mutex.runExclusive( async () => {
      socket1.emit("message", {"message":"Tablet Server 1 received query deleteCells", "rowKey": data["rowKey"]});
      dataObject = deleteCells(data["cols"]);
      result = await db.DeleteCells(data["rowKey"],dataObject, 3);
      tablet = await db.findRows(data["rowKey"], 3);
      socket.emit("deleteCells", result);

      rowKey.push(data["rowKey"]);
      updatedData.push(tablet[0]);
    })
  });
  socket.on("setCells", async function (data) {
    mutex.runExclusive( async () => {
      socket1.emit("message", {"message":"Tablet Server 1 received query setCells", "data": data});
      dataObject = updateInsert(data["cols"], data["data"]);
      console.log(dataObject)
      result = await db.set(data["rowKey"],dataObject, 3);
      tablet = await db.findRows(data["rowKey"], 3);
      socket.emit("setCells", result);

      rowKey.push(data["rowKey"]);
      updatedData.push(tablet[0]);
    })
  });
  
  setInterval(async () => {
    socket1.emit("update", [rowKey, updatedData]);
    socket1.emit("message", {"message":"Tablet Server 1 send updated data to master" });
    rowKey = [];
    updatedData = [];
  }, 1000 * 1 * 60);

});
