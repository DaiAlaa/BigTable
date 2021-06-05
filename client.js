var io = require("socket.io-client");
var colors = require("colors");
const { set } = require("mongoose");

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

const MASTER_URL = "https://master123321kareem3m.loca.lt";

var metaData = null;
var master = io.connect(MASTER_URL);

master.on("connect", () => {
  console.log("Connected to master".info);
});

master.on("meta-data", (newMetaData) => {
  metaData = newMetaData;
  console.log("Received Metadata".info);
  console.log(metaData);
});

var tabletServers = []; // tabletServers[url] = Socket Object

function setCells(rowKey, cols, data) {
  // one row multiple cells
  send("setCells", { rowKey, cols, data }, TabletServer(rowKey));
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
    let TS = TabletServer(key);
    if (TS in rowsPerTS) rowsPerTS[TS].push(key);
    else rowsPerTS[TS] = [key];
  });

  for (TS in rowsPerTS) {
    send("deleteRows", rowsPerTS[TS], TS);
  }
}

function readRows(rowKeys) {
  // multiple rows
  rowsPerTS = [];
  rowKeys.forEach((key) => {
    let TS = TabletServer(key);
    if (TS in rowsPerTS) rowsPerTS[TS].push(key);
    else rowsPerTS[TS] = [key];
  });

  for (TS in rowsPerTS) {
    send("readRows", rowsPerTS[TS], TS);
  }
}

// TODO handle rowKey out of all ranges (when adding & when removing)
function TabletServer(rowKey) {
  url = metaData.find((ts) => rowKey >= ts.start && rowKey <= ts.end).url;
  if (!(url in tabletServers)) {
    console.log(("Connecting to Tablet Server at " + url).info);
    tabletServers[url] = io(url);
  }
  return tabletServers[url];
}

// TODO set listeners
function send(event, data, socket) {
  if (socket.connected) {
    socket.emit(event, data);
  } else {
    socket.on("connect", () => {
      console.log("Tablet Server Connected".info);
      setResponseListeners(socket)
      socket.emit(event, data);
    });
  }
}

function setResponseListeners(socket) {
  socket.on("setCells", (response) => {
    console.log("Response received for setCells");
  });
  socket.on("deleteCells", (response) => {
    console.log("Response received for deleteCells");
  });
  socket.on("addRow", (response) => {
    console.log("Response received for addRow");
  });
  socket.on("deleteRows", (response) => {
    console.log("Response received for deleteRows");
  });
  socket.on("readRows", (response) => {
    console.log("Response received for readRows");
  });
}

module.exports = {
  setCells,
  deleteCells,
  addRow,
  deleteRows,
  readRows,
};
