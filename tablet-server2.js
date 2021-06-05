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
  
require("localtunnel")({ port: 5000, subdomain: "ts2kareem3m" }).then(() => {
    console.log("Tablet Server Online".info);
});

require("dotenv/config");
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
  console.log("connected to Master");
});
///////////////////
socket1.on("tablet-data-1", async function (data) {
  await CourseA.deleteMany({});
  await CourseA.insertMany(data.data[0]);
  await CourseB.deleteMany({});
  await CourseB.insertMany(data.data[1]);
  await MetadataTabletServer1.deleteMany({});
  await MetadataTabletServer1.insertMany(data.metadata);
  reult = await MetadataTabletServer1.find({});
  console.log(reult);
});
arr = [];
async function updateInsert(cols, data) {
  dataObject = {};
  for (i = 0; i < cols.length; i++) dataObject[cols[i]] = data[i];
     return dataObject;
}
async function deleteCells(cols){
    dataObject = {};
    for (i = 0; i < cols.length; i++) dataObject[cols[i]] = "";
       return dataObject;
}
var ioserver = require("socket.io")(server);
ioserver.on("connection", function (socket) {
    console.log("Client connected".info)
  socket.on("addRow", async function (data) {
    dataObject = updateInsert(data[cols], data[data]);
    result = await db.AddRow(data[rowKey],dataObject);
    socket.emit("addRow", result);
    socket1.emit("addRow", data);
  });
  socket.on("deleteRows", async function (data) {
    result = await db.DeleteRow(data);
    socket.emit("deleteRows", result);
    socket1.emit("deleteRows", data);
  });
  socket.on("readRows", async function (data) {
    result = db.ReadRows(data);
    socket.emit("readRows", result);
  });
  socket.on("deleteCells", async function (data) {
    arr.push(data[0]);
    dataObject = deleteCells(data[cols]);
    result = await db.DeleteCells(data[rowKey],dataObject);
    socket.emit("deleteCells", result);
  });
  socket.on("setCells", async function (data) {
    dataObject = updateInsert(data[cols], data[data]);
    arr.push(data[0]);
    result = await db.set(data[rowKey],dataObject);
    socket.emit("setCells", result);
  });
  setInterval(async () => {
    result = await Course.find({ url: arr }, { _id: 0 });
    arr = new Set(arr);
    socket1.emit("update", [arr, result]);
    arr = [];
  }, 1000 * 15 * 60);
});
