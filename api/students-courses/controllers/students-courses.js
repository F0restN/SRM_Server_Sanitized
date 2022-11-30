// noinspection JSCheckFunctionSignatures

"use strict";
const underscore = require("underscore");

module.exports = {
    bulkAddCourseSelections: async (ctx) => {
        try {
            const studentId = ctx.request.body.studentId;
            const courses = ctx.request.body.courses;
            // Deactivate pre selections
            let updateResult = await strapi.services[
                "students-courses"
            ].bulkDeactivateCourseSelectionsByStudent(studentId);
            // Add new selections
            let result = await strapi.services[
                "students-courses"
            ].bulkAddCourseSelectionsOfStudent(studentId, courses);
            ctx.send(result);
        } catch (e) {
            console.log(e);
        }
    },

    // Get selected courses for a student, join course table
    getSelectedCoursesForStudent: async (ctx) => {
        let doneCourses = await strapi.query("students-courses").find({
            student_id: ctx.request.body.studentId,
            deactivate: false,
            _limit: -1,
        });
        let result = [];
        for (let i = 0; i < doneCourses.length; i++) {
            let ele = doneCourses[i];
            let course = await strapi.query("course").find({
                uid: ele.course_id,
                _limit: -1,
            });

            result.push({
                coursePrefix: course[0].prefix,
                courseCredit: course[0].credit,
                courseTitle: course[0].course_name,
                courseId: course[0].course_id,
                courseUid: course[0].uid,
                courseDay: course[0].day,
                courseTime: course[0].time,
                courseTerm: ele.term,
                courseYear: ele.year,
                transactionId: Number(ele.transaction_id) + 1,
            });
        }
        ctx.send(result);
    },

    getTransactionHistoryByStudent: async (ctx) => {
        let args = ctx.request.body;
        let data = {
            nextTransactionId: 0,
            currentTransactionId: 0,
            data1: [],
            data2: [],
        };
        let result = await strapi.query("students-courses").find({
            student_id: args.studentId,
            _sort: "transaction_id:desc",
            _limit: 1,
        });
        if (result !== null && result.length > 0) {
            let mostRecentTransactionId = Number(result[0].transaction_id);
            data.nextTransactionId = mostRecentTransactionId + 1;
            data.currentTransactionId = mostRecentTransactionId;
            if (mostRecentTransactionId >= 1) {
                result = await strapi.services[
                    "students-courses"
                ].getTransactionByTransIdAndStudentId(
                    mostRecentTransactionId - 1,
                    args.studentId
                );
                let arr = [];
                for (let i = 0; i < result.length; i++) {
                    let ele = result[i];
                    let course = await strapi.query("course").find({
                        uid: ele.course_id,
                        _limit: -1,
                    });
                    arr.push({
                        coursePrefix: course[0].prefix,
                        courseCredit: course[0].credit,
                        courseTitle: course[0].course_name,
                        courseId: course[0].course_id,
                        courseUid: course[0].uid,
                        courseDay: course[0].day,
                        courseTime: course[0].time,
                        courseTerm: ele.term,
                        courseYear: ele.year,
                        transactionId: Number(ele.transaction_id),
                    });
                }
                data.data1 = arr;
                if (mostRecentTransactionId >= 2) {
                    result = await strapi.services[
                        "students-courses"
                    ].getTransactionByTransIdAndStudentId(
                        mostRecentTransactionId - 2,
                        args.studentId
                    );
                    let arr = [];
                    for (let i = 0; i < result.length; i++) {
                        let ele = result[i];
                        let course = await strapi.query("course").find({
                            uid: ele.course_id,
                            _limit: -1,
                        });
                        arr.push({
                            coursePrefix: course[0].prefix,
                            courseCredit: course[0].credit,
                            courseTitle: course[0].course_name,
                            courseId: course[0].course_id,
                            courseUid: course[0].uid,
                            courseDay: course[0].day,
                            courseTime: course[0].time,
                            courseTerm: ele.term,
                            courseYear: ele.year,
                            transactionId: Number(ele.transaction_id),
                        });
                    }
                    data.data2 = arr;
                }
            }
        }

        ctx.send(data);
    },

    getAppearedSemester: async (ctx) => {
        let result = await strapi.services[
            "students-courses"
        ].getAppearedSemester(ctx);
        let sortArr = underscore.sortBy(result, (ele) => {
            let flag = 0;
            switch (ele.term) {
                case "Spring":
                    flag = 1;
                    break;
                case "Summer":
                    flag = 2;
                    break;
                case "Fall":
                    flag = 3;
                    break;
            }
            return ele.year * 10 + flag;
        });
        let arr = sortArr.map((ele, index) => {
            return {
                value: ele.year + " " + ele.term,
                label: ele.year + " " + ele.term,
            };
        });
        ctx.send(arr);
    },

    /**
     * Return Return how many students enrolled for each course for each semester
     * Wrapped By errorHandle and responseControl.
     *
     * @param {*} ctx
     */
    getCourseEnrollStat: async (ctx) => {
        let responseBody = {
            status: "",
            mssg: "",
            data: [],
            error: null,
        };
        await strapi.services["students-courses"]
            .getCourseEnrollStat()
            .then((data) => {
                responseBody.data = data;
                responseBody.status = "success";
            })
            .catch((err) => {
                responseBody.data = [];
                responseBody.status = "failed";
                responseBody.error = err.message;
            });
        ctx.response.statusText = "good";
        // PENDING FOR RESPONSE MODIFY
        ctx.response.send(responseBody.data);
    },

    testController: async (ctx) => {
        let result = await strapi.services["students-courses"].testService(ctx);
        ctx.send(result);
    },
};
