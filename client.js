var io = require("socket.io-client");
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

const MASTER_URL = "http://localhost:4000";

var metaData = null;
var master = io.connect(MASTER_URL);

master.on("connect", () => {
  console.log("Connected to master".info);
  master.emit('Message', 'Client: ' + 'Connected to Master')
  master.on("meta-data", (newMetaData) => {
    metaData = newMetaData;
    console.log("Received Metadata".info, metaData);
    master.emit('Message', 'Client: ' + 'Received Metadata')
  });
  
});


var tabletServers = []; // tabletServers[url] = Socket Object

function setCells(rowKey, cols, data) {
  // one row multiple cells
  send("setCells", { rowKey:rowKey, cols:cols, data:data }, TabletServer(rowKey));
}

function deleteCells(rowKey, cols) {
  // one row multiple cells
  send("deleteCells", { rowKey, cols }, TabletServer(rowKey));
}

function addRow(rowKey, cols, data) {
  // one row multiple cells
  send("addRow", { rowKey, cols, data }, TabletServer(rowKey));
}

function deleteRows(rowKeys) {
  // multiple rows
  let rowsPerTS = [];
  rowKeys.forEach((key) => {
    let TS = TabletServerURL(key);   
    if (TS in rowsPerTS) rowsPerTS[TS].push(key);
    else rowsPerTS[TS] = [key];
  });

  for (TS in rowsPerTS) {
      send("deleteRows", rowsPerTS[TS], getSocket(TS));    
  }
}

function readRows(rowKeys) {

  let rowsPerTS = [];
  rowKeys.forEach((key) => {
    let TS = TabletServerURL(key);   
    if (TS in rowsPerTS) rowsPerTS[TS].push(key);
    else rowsPerTS[TS] = [key];
  });

  for (TS in rowsPerTS) {
      send("readRows", rowsPerTS[TS], getSocket(TS));    
  }
}

function TabletServer(rowKey) {
  data = metaData.find((ts) => rowKey >= ts.start && rowKey <= ts.end);
  if(data == undefined){
    url = metaData[0].url;
  }
  else
    url = data.url;
  return getSocket(url);
}
function getSocket(url){
  if (!(url in tabletServers)) {
    tabletServers[url] = io(url);
  }
  return tabletServers[url]
}

function TabletServerURL(rowKey) {
  data = metaData.find((ts) => rowKey >= ts.start && rowKey <= ts.end);
  if(data == undefined){
    url = metaData[0].url;
  }
  else
    url = data.url;
  return url;
}

function send(event, data, socket) {
  if (socket.connected) {
    socket.emit(event, data);
  } else {
    socket.on("connect", () => {
      setResponseListeners(socket)
      socket.emit(event, data);
    });
  }
}

function setResponseListeners(socket) {
  socket.on("setCells", (response) => {
    console.log("Response received for setCells");
    console.log(response);
    // master.emit('Message', 'Client: Received ' + response)
  });
  socket.on("deleteCells", (response) => {
    console.log("Response received for deleteCells");
    console.log(response);
    master.emit('Message', 'Client: Received ' + response)
  });
  socket.on("addRow", (response) => {
    console.log("Response received for addRow");
    console.log(response);
    master.emit('Message', 'Client: Received ' + response)
  });
  socket.on("deleteRows", (response) => {
    console.log("Response received for deleteRows");
    console.log(response);
    master.emit('Message', 'Client: Received ' + response)
  });
  socket.on("readRows", (response) => {
    console.log("Response received for readRows");
    console.log(response);
    master.emit('Message', 'Client: Received ' + response)
  });
  
}

module.exports = {
  setCells,
  deleteCells,
  addRow,
  deleteRows,
  readRows
};
