const mongoose = require('mongoose');
var conn1   = mongoose.createConnection(process.env.tabletServer1,{ useUnifiedTopology: true });
var conn2   = mongoose.createConnection(process.env.tabletServer2,{ useUnifiedTopology: true });
var conn3  = mongoose.createConnection(process.env.tabletServer3,{ useUnifiedTopology: true });
var connMaster = mongoose.createConnection(process.env.master,{ useUnifiedTopology: true });
const courseSchema = new mongoose.Schema({
    "course_id":Number,
    "course_title":String,
    "url":  { type: String, unique: true },
    "is_paid":Boolean,
    "price":Number,
    "num_subscribers":Number,
    "num_reviews":Number,
    "num_lectures":Number,
    "level":String,
    "content_duration":String,
    "published_timestamp":String,
    "subject":String
});

const metadataSchema = new mongoose.Schema({
    "start": String,
    "end": String,
    "tabletServerId": { type: Number, unique: true }
});
const Metadata = connMaster.model('Metadata', metadataSchema);
var Course = conn1.model('Course', courseSchema);
var CourseMaster = connMaster.model('Course', courseSchema);
var CourseA = conn2.model('Course', courseSchema);
var CourseB = conn3.model('Course', courseSchema);

module.exports = {Course, CourseA, CourseB, CourseMaster, Metadata};
