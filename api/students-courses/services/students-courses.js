// noinspection JSCheckFunctionSignatures
"use strict";
const underscore = require("underscore");

/**
 *
 * @param {*} studentId
 * @returns Student-Course relationship should be sutiable for all dashboard chart
 */
const aggAllStudentEnrollStat = async (studentId) => {
    const knex = strapi.connections.default;
    try {
        const data = await knex
            .select(
                "sc.student_id",
                "sc.year as course_year",
                "sc.term as course_term",
                "s.type as student_type",
                "c.course_id",
                "c.day as course_day",
                "c.course_name"
            )
            .from("students_courses as sc")
            .join("courses as c", "sc.course_id", "c.uid")
            .join("students as s", "sc.student_id", "s.id")
            .where({
                // "sc.student_id": studentId,
                "sc.deactivate": false,
            });
        return data;
    } catch (error) {
        return error;
    }
};

module.exports = {
    /**
     * Return Student Info - Course Info
     *
     * @param [studentIds] studentId
     * @returns corresponding student enroll info or all if no id is specified
     */
    getAllStudentEnrollStat: async () => {
        const data = await aggAllStudentEnrollStat([]);
        return data;
    },

    /**
     * Return how many students enrolled for each course for each semester
     *
     * @returns {type: <course_id>, value: <Student Enroll number>} grouped by semester
     */
    getCourseEnrollStat: async () => {
        const data = await aggAllStudentEnrollStat([]);
        return underscore
            .chain(data)
            .groupBy((obj) => `${obj.course_year} ${obj.course_term}`)
            .mapObject((val) =>
                underscore
                    .chain(val)
                    .uniq(false, underscore.iteratee("student_id"))
                    .groupBy((obj) => obj.course_id)
                    .mapObject((value) => value.length)
                    .map((value, type) => ({ type: type, value: value }))
            );
    },

    bulkAddCourseSelectionsOfStudent: async (studentId, courses) => {
        try {
            if (courses && courses.length === 0) {
                return;
            } else {
                // Add new select course
                for (let i = 0; i < courses.length; i++) {
                    let obj = courses[i];
                    let course = {
                        student_id: studentId,
                        course_id: obj.courseUid,
                        year: obj.courseYear,
                        term: obj.courseTerm,
                        deactivate: false,
                        transaction_id: obj.transactionId,
                    };
                    await strapi.query("students-courses").create(course);
                }
            }
            return "Successfully Saved";
        } catch (e) {
            return e;
        }
    },

    bulkDeactivateCourseSelectionsByStudent: async (studentId) => {
        const knex = strapi.connections.default;
        try {
            return await knex("students_courses")
                .where("student_id", studentId)
                .update({
                    deactivate: true,
                });
        } catch (e) {
            console.log(e);
        }
    },

    getTransactionByTransIdAndStudentId: async (transactionId, studentId) => {
        return await strapi.query("students-courses").find({
            student_id: studentId,
            transaction_id: transactionId,
        });
    },

    getAppearedSemester: async () => {
        const knex = strapi.connections.default;
        try {
            const arr = await knex("students_courses as sc")
                .distinct("sc.year", "sc.term")
                .where("deactivate", false)
                .orderBy("sc.year", "sc.term");
            return arr;
        } catch (e) {
            return e;
        }
    },

    testService: async (ctx) => {
        return "Service print";
    },
};
