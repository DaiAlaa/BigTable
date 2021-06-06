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
  
require("localtunnel")({ port: 3000, subdomain: "ts2kareem3m" }).then(() => {
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
});
metadata=[]
///////////////////
socket1.on("tablet-data-1", async function (data) {
  await Course.deleteMany({});
  await Course.insertMany(data.data);
  metadata=data.metadata
  console.log(metadata)
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
    console.log("Client connected".info)
  socket.on("addRow", async function (data) {
    console.log(data)
    dataObject = updateInsert(data["cols"], data["data"]);
    result = await db.AddRow({url:data["rowKey"], ...dataObject}, 3);
    socket.emit("addRow", result);
    socket1.emit("addRow", {url:data["rowKey"], ...dataObject});
  });
  socket.on("deleteRows", async function (data) {
    console.log(data)
    result = await db.DeleteRow(data,3);
    socket.emit("deleteRows", result);
    socket1.emit("deleteRows", data);
  });
  socket.on("readRows", async function (data) {
    result = await db.ReadRows(data, 3);
    console.log(data, result)
    socket.emit("readRows", result);
  });
  socket.on("deleteCells", async function (data) {
    console.log(data)
    arr.push(data["rowKey"]);
    dataObject = deleteCells(data["cols"]);
    result = await db.DeleteCells(data["rowKey"],dataObject, 3);
    socket.emit("deleteCells", result);
  });
  socket.on("setCells", async function (data) {
    console.log(data)
    arr.push(data["rowKey"]);
    dataObject = updateInsert(data["cols"], data["data"]);
    console.log(dataObject)
    result = await db.set(data["rowKey"],dataObject, 3);
    socket.emit("setCells", result);
  });
  setInterval(async () => {
    result = await Course.find({ url: arr }, { _id: 0 });
    arr = new Set(arr);
    socket1.emit("update", [arr, result]);
    arr = [];
  }, 1000 * 1 * 60);
});
