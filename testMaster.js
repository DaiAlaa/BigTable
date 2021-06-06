const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  // ...
});

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

require("localtunnel")({ port: 4000, subdomain: "masterkareem3m" }).then(() => {
  console.log("Master Online".info);
});

io.on("connection", (socket) => {
  // ...
  socket.emit("meta-data", [
    { start: 0, end: 10, url: "https://ts1kareem3m.loca.lt" },
    { start: 11, end: 20, url: "https://ts2kareem3m.loca.lt" },
  ]);
});

httpServer.listen(4000);
