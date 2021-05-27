var express = require('express');
const app = express();

app.get('/', function (req, res) {
   res.send('Hello World');
})

var port = "8082"
var server = app.listen(port, function () {
   var host = "localhost"
   console.log("Example app listening at http://%s:%s", host, port)
})
