"use strict";

const { format, isAfter, isBefore, parseISO } = require("date-fns");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async getOverallSemesters(ctx) {
        let programDuration = ctx.request.body.program_duration;
        let studentStartYear = ctx.request.body.student_start_year;
        let studentStartTerm = ctx.request.body.student_start_term;
        let overallProgramSemesterArr = [studentStartYear + studentStartTerm];

        // Set initial value of flag, term and year
        let flag = 0;
        switch (studentStartTerm) {
            case "Spring":
                flag = 0;
                break;
            case "Summer":
                flag = 1;
                break;
            case "Fall":
                flag = 2;
                break;
            default:
                break;
        }

        // Fall = 1 and Spring = 0 when term goes to fall year will add one
        let currentYear = Number(studentStartYear);
        for (let count = 1; count < programDuration * 3; count++) {
            let nextTerm = "";
            let nextYear = currentYear + Math.floor(flag / 2);
            flag = (flag + 1) % 3;
            switch (flag) {
                case 0:
                    nextTerm = "Spring";
                    break;
                case 1:
                    nextTerm = "Summer";
                    break;
                case 2:
                    nextTerm = "Fall";
                    break;
                default:
                    nextTerm = "Spring";
            }
            let nextSemester = nextYear + nextTerm;
            overallProgramSemesterArr.push(nextSemester);
            currentYear = nextYear;
        }

        ctx.send(overallProgramSemesterArr);
    },
};
