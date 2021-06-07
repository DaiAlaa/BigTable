const logger = require('./logger.js');
const MASTER_URL ="https://dina-master.herokuapp.com/";
var io = require("socket.io-client");

var master = io.connect(MASTER_URL);

master.on('connect', () => {

});

master.on('msg', (message) => {
    console.log(message);
    logger.info(message);
});   