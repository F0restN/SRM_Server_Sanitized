"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { isAfter, isBefore, parseISO } = require("date-fns");
const underscore = require("underscore");

/**
 *
 * @param {
 *        startYear: student.studentInfo.start_year,
 *        startTerm: student.studentInfo.start_term,
 *        type: student.studentInfo.type,
 *        status: studentStatus,
 *        program: studentProgram,
 *        programSemesters: programSemesters,
 *  }
 *  @return {
 *      data: [],
 *      mssg: "",
 *      status: "",
 *  };
 */
module.exports = {
    async getTemplateByStudent(ctx) {
        let responseBody = {
            data: [],
            mssg: "",
            status: "",
        };
        let studentInfo = ctx.request.body;
        let template = await strapi.query("templates").findOne({
            term: studentInfo.startTerm,
            // year: studentInfo.startYear,
            program: studentInfo.program,
            student_status: studentInfo.status,
            student_type: studentInfo.type,
        });

        try {
            // Format data
            let currSequence = template.courses;
            let termArr = studentInfo.programSemesters;
            let queryArr = [];
            for (let i = 0; i < currSequence.length; i++) {
                let term = termArr[i];
                let termObj = currSequence[i];
                termObj.courses.forEach((courseObj, index) => {
                    let queryObj = {
                        courseId: courseObj.courseId,
                        courseTerm: term,
                    };
                    queryArr.push(queryObj);
                });
            }

            // Join select to add more info to a course
            let coursesArr = [];
            let failedCount = 0;
            let totalCount = queryArr.length;
            for (let i = 0; i < queryArr.length; i++) {
                let queryObj = queryArr[i];
                let sliceYear = queryObj.courseTerm.slice(0, 4);
                let sliceTerm = queryObj.courseTerm.slice(
                    4,
                    queryObj.courseTerm.length
                );
                let correspondedCourse = await strapi.query("course").findOne({
                    course_id: queryObj.courseId,
                    type: studentInfo.type,
                    term: sliceTerm,
                    start_year_lt: sliceYear + 1,
                    end_year_gt: sliceYear - 1,
                });
                if (correspondedCourse !== null) {
                    coursesArr.push({
                        courseId: correspondedCourse.course_id,
                        courseUid: correspondedCourse.uid,
                        courseTitle: correspondedCourse.course_name,
                        courseDay: correspondedCourse.day,
                        courseTime: correspondedCourse.time,
                        courseTerm: sliceTerm,
                        courseYear: sliceYear,
                    });
                } else {
                    failedCount++;
                    console.error("Cant find corresponding course");
                }
            }

            responseBody.mssg = `Auto-populate ${
                totalCount - failedCount
            } out of ${totalCount} courses`;
            responseBody.status = failedCount === 0 ? "success" : "warning";
            responseBody.data = coursesArr;
            return responseBody;
        } catch (e) {
            // return ctx.send(e);
            console.error(e);
            ctx.response.throw(400, "Server side error", { user: user });
        }
    },
};
