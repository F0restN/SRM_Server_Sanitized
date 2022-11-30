// noinspection JSCheckFunctionSignatures

'use strict';
const underscore = require('underscore')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

global.nextTerm = "21Fall";

module.exports = {

    // @Describe: Add one or multiple course to a student.
    getCoursesForStudent: async (ctx) => {
        let query = ctx.request.body
        let allCourses = await strapi.query('course').find(query);
        return ctx.send(allCourses);
    },

    getAllCourses: async (ctx) => {
        let allCourses = await strapi.query('course').find();
        return ctx.send(allCourses);
    },

    // @Describe: Search for a course for any keywords with a condition of "term"
    searchCourse: async (ctx) => {
        let knex = strapi.connections.default;
        let condition = ctx.request.body.condition;
        let courseResult = await strapi.query('course').search({
            _q: condition.keyword, _limit: -1,
        })
        return courseResult.map(ele => {
            if (ele.term === condition.term) {
                return ele;
            }
        });
    },

    bulkAddCourses: async (ctx) => {
        try {
            let courses = ctx.request.body;
            let studentId = ctx.request.body[0].student_id;
            if (courses && courses.length === 0) {
                return;
            } else {
                // Filter out courses already been selected
                let doneCourses = await strapi.query('students-courses').find({student_id: studentId});
                let doneCoursesId = doneCourses.map(ele => {
                    return ele.course_id;
                })
                let filtrateCourses = underscore.filter(courses, (ele) => {
                    return !underscore.contains(doneCoursesId, ele.course_id)
                })
                // Add new select course
                for (let i = 0; i < filtrateCourses.length; i++) {
                    let ele = filtrateCourses[i];
                    await strapi.query('students-courses').create(ele);
                }
            }
            return "Successfully Saved"
        } catch (e) {
            return "Failed"
        }
    },

    getOnlineOnCmpStat: async (ctx) => {
        try {
            let reqInfo = ctx.request.body;
            let knex = strapi.connections.default;
            const result = await knex('students_courses as sc')
                .select('sc.student_id', 's.type as student_type', 'c.course_id', 'c.day as course_day', 'c.course_name')
                .join('courses as c', 'sc.course_id', 'c.uid')
                .join('students as s', 'sc.student_id', 's.id')
                .where('deactivate', false)
                .andWhere('sc.year', reqInfo.year)
                .andWhere('sc.term', reqInfo.term)
            const groupedEnrollData = underscore.groupBy(result, 'course_day');

            // Format and count
            let enrollData = [
                {
                    "day": "MON",
                    "online": 0,
                    "oncmp": 0
                },
                {
                    "day": "TUE",
                    "online": 0,
                    "oncmp": 0
                },
                {
                    "day": "WED",
                    "online": 0,
                    "oncmp": 0
                },
                {
                    "day": "THR",
                    "online": 0,
                    "oncmp": 0
                },
                {
                    "day": "FRI",
                    "online": 0,
                    "oncmp": 0
                },
            ]
            for (let i in groupedEnrollData) {
                let dayData = groupedEnrollData[i]
                let onlineStudentIndex = []
                let oncmpStudentIndex = []
                for (let item of dayData) {
                    let id = item.student_id
                    if (item.student_type === "ONLINE" && !underscore.contains(onlineStudentIndex, id)) {
                        onlineStudentIndex.push(id)
                    }
                    if (item.student_type === "ONCMP" && !underscore.contains(oncmpStudentIndex, id)) {
                        oncmpStudentIndex.push(id)
                    }
                }
                for (let j = 0; j < enrollData.length; j++) {
                    if (enrollData[j].day === i){
                        enrollData[j].online = onlineStudentIndex.length
                        enrollData[j].oncmp = oncmpStudentIndex.length
                    }
                }
                // let dayJson = {
                //     "day": i,
                //     "online": onlineStudentIndex.length,
                //     "oncmp": oncmpStudentIndex.length
                // }
                // enrollData.push(dayJson)
            }
            return ctx.send({
                "stat": enrollData,
                "detail": groupedEnrollData
            })
        } catch (error) {
            return ctx.send(error)
        }
    }

};



