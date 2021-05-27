const mongoose = require('mongoose');

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
const Course = mongoose.model('Course', courseSchema);
const Metadata = mongoose.model('Metadata', metadataSchema);

module.exports = {Course, Metadata};




