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

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  // ...
});

require("localtunnel")({ port: 3000, subdomain: "ts1kareem3m" }).then((tunnel) => {
  console.log("Tablet Server Online".info);
});

io.on("connection", (socket) => {
  // ...
  console.log("Client connected".info);

  socket.onAny((event, data) => {
    console.log("Received " + event + " with data ", data);
    socket.emit(event)
  });
});

httpServer.listen(3000);
