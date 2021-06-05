const { Course:Course }  = require('./data-base-schema');
const { CourseMaster: CourseMaster } = require("./data-base-schema");
const { CourseA: CourseA } = require("./data-base-schema");
const { CourseB: CourseB } = require("./data-base-schema");

async function DeleteRow(url, num) {
    if (num == 1) return await CourseA.deleteMany({ url: url });
    else if(num == 2) return await CourseB.deleteMany({ url: url });
    else if(num == 3) return await Course.deleteMany({ url: url });
    else return await CourseMaster.deleteMany({ url: url });
}

  async function AddRow(data, num) {
    try {
      if (num == 1) return await CourseA.insertMany(data);
      else if(num == 2) return await CourseB.insertMany(data);
      else if(num == 3) return await Course.insertMany(data);
      else return await CourseMaster.insertMany(data);

    } catch (e) {}
  }
  async function ReadRows(url, num) {
    if (num == 1) return await CourseA.find({ url: url }, {}, {});
    else if(num == 2)  return await CourseB.find({ url: url }, {}, {});
    else if(num == 3)  return await CourseB.find({ url: url }, {}, {});
    else return await CourseMaster.find({ url: url }, {}, {});
}
  async function set(url, data, num) {
    console.log(url, data, num);
    if (num == 1) return await CourseA.updateMany({ url: url }, { $set: data });
    else if(num == 2)  return await CourseB.updateMany({ url: url }, { $set: data });
    else if(num == 3) return await Course.updateMany({ url: url }, { $set: data });
    else return await CourseMaster.updateMany({ url: url }, { $set: data });

  }
  async function DeleteCells(url, data, num) {
    if (num == 1) return await CourseA.updateMany({ url: url }, { $unset: data });
    else if(num == 2)  return await CourseB.updateMany({ url: url }, { $unset: data });
    else if(num == 3)  return await Course.updateMany({ url: url }, { $unset: data });
    else  return await CourseMaster.updateMany({ url: url }, { $unset: data });
  

}

  
 
 module.exports= {set, DeleteCells, DeleteRow, ReadRows, AddRow}