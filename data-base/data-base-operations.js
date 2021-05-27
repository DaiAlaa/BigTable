const Course = require('./data-base-schema');

//string
async function DeleteRow(url){
    return await Course.deleteOne({url: url});
 }
 // array of objects
 async function AddRow(data){
     return await Course.insertMany(data);
 }
 // string
 async function ReadRows(url){
     return await Course.find({url: url},{},{}, function(error, result) {
         return result
     });
 }
 // string, array of objects
 async function Set(url, data){
     return await Course.updateMany({url: url},{$set:data}, function(error, result) {
         return result
     });
 }
 // string, array of objects of empty strings
 async function DeleteCells(url, data){
     return await Course.updateMany({url: url},{$unset:data}, function(error, result) {
         return result
     });
 }
 
 module.exports= {Set, DeleteCells, DeleteRow, ReadRows, AddRow}
 
 