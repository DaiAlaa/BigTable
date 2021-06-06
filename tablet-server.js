const MASTER_URL = "http://localhost:4000";
var colors = require("colors");
var logger = require('./logger.js');

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
  
require("localtunnel")({ port: 3000, subdomain: "ts1kareem3m" }).then(() => {
    console.log("Tablet Server Online".info);
});

require("dotenv/config");
const { Course: Course } = require("./data-base/data-base-schema");
var express = require("express");
const app = express();
db = require('./data-base/data-base-operations')

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
  logger.info({"message":"Tablet Server 1 connected to master"});

});
metadata=[]
///////////////////
socket1.on("tablet-data-1", async function (data) {
  logger.info({"message":"Tablet Server 1 recieved metadata"});
  await Course.deleteMany({});
  await Course.insertMany(data.data);
  metadata=data.metadata
  console.log(metadata)
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
  console.log("Client connected".info)
  socket.on("addRow", async function (data) {
    Mutex.runExclusive( async () => {
      logger.info({"message":"Tablet Server 1 received query addRow", "rowKey": data["rowKey"]});
      dataObject = updateInsert(data["cols"], data["data"]);
      result = await db.AddRow({url:data["rowKey"], ...dataObject}, 3);
      socket.emit("addRow", result);
      socket1.emit("addRow", {url:data["rowKey"], ...dataObject});
    })
  });
  socket.on("deleteRows", async function (data) {
    Mutex.runExclusive( async () => {
      logger.info({"message":"Tablet Server 1 received query deleteRows","rowKey": data["rowKey"]});
      console.log(data)
      result = await db.DeleteRow(data,3);
      socket.emit("deleteRows", result);
      socket1.emit("deleteRows", data);
    })
  });
  socket.on("readRows", async function (data) {
    Mutex.runExclusive( async () => {
      logger.info({"message":"Tablet Server 1 received query readRows", "rowKeys": data});
      result = await db.ReadRows(data, 3);
      console.log(data, result)
      socket.emit("readRows", result);
    })
  });
  socket.on("deleteCells", async function (data) {
    Mutex.runExclusive( async () => {
      logger.info({"message":"Tablet Server 1 received query deleteCells", "rowKey": data["rowKey"]});
      dataObject = deleteCells(data["cols"]);
      result = await db.DeleteCells(data["rowKey"],dataObject, 3);
      tablet = await db.ReadRows(data["rowKey"], 3);
      socket.emit("deleteCells", result);

      rowKey.push(data["rowKey"]);
      updatedData.push(tablet);
    })
  });
  socket.on("setCells", async function (data) {
    Mutex.runExclusive( async () => {
      logger.info({"message":"Tablet Server 1 received query setCells", "data": data});
      dataObject = updateInsert(data["cols"], data["data"]);
      console.log(dataObject)
      result = await db.set(data["rowKey"],dataObject, 3);
      tablet = await db.ReadRows(data["rowKey"], 3);
      socket.emit("setCells", result);

      rowKey.push(data["rowKey"]);
      updatedData.push(tablet);
    })
  });

  setInterval(async () => {
    socket1.emit("update", [rowKey, updatedData]);
    logger.info({"message":"Tablet Server 1 send updated data to master" });
    rowKey = [];
    updatedData = [];
  }, 1000 * 1 * 60);

});
