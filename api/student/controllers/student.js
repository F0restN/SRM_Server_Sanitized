// noinspection JSCheckFunctionSignatures
"use strict";
// Init
// const { sanitizeEntity } = require('strapi-utils');
const { format, isAfter, isBefore, parseISO } = require("date-fns");
const underscore = require("underscore");
const _ = require("underscore");
// const { sortByTerm } = require("../../../utils/sorted");

// ==============================|| Build-in functions ||============================== //

const calculateTermValue = (semster) => {
    let splitArr = semster.split(" ");
    let term = splitArr[1];
    let year = splitArr[0];
    if (year === "null" || term === "null") {
        return -1;
    }
    let flag = 0;
    switch (term) {
        case "Spring":
            flag = 1;
            break;
        case "Summer":
            flag = 2;
            break;
        case "Fall":
            flag = 3;
            break;
        default:
            flag = -999999999;
            break;
    }
    return year * 10 + flag;
};

/*
	Normalzied data : 
	{
		key: [obj1, obj2, obj3...],
		key2: [obj1, obj2, obj3...]
	}
*/

/**
 *
 * @param {key: [obj1, obj2, obj3...],key2: [obj1, obj2, obj3...]} data
 * @returns [
 * 		{
 * 			name: "2021 Spring",
 * 			value: 21
 * 		},
 * 		{...}
 * ]
 */
const calculateNumber = (data) => {
    let result = [];
    for (let key in data) {
        let valueArr = data[key];
        if (
            key === "" ||
            key === "null" ||
            key === null ||
            key === undefined ||
            key === "null null"
        ) {
            result.push({
                name: "Unassigned",
                value: valueArr.length,
            });
        } else {
            result.push({
                name: key,
                value: valueArr.length,
            });
        }
    }
    return result;
};

const lastDigitofNumber = (num) => {
    const lastDigit2Str = String(num).slice(-1);
    return Number(lastDigit2Str);
};

const fillTerm = (startSemesterValue, endSemesterValue) => {
    let startTermValue = lastDigitofNumber(startSemesterValue);
    let startYear = (startSemesterValue - startTermValue) / 10;
    let endTermValue = lastDigitofNumber(endSemesterValue);
    let endYear = (endSemesterValue - endTermValue) / 10;

    let fillArr = [];
    let flag = "";
    while (startYear < endYear || startTermValue < endTermValue) {
        switch (startTermValue) {
            case 1:
                flag = "Spring";
                break;
            case 2:
                flag = "Summer";
                break;
            case 3:
                flag = "Fall";
                break;
        }
        fillArr.push(startYear + " " + flag);
        startTermValue += 1;
        if (startTermValue > 3) {
            startTermValue = 1;
            startYear += 1;
        }
    }
    return fillArr;
};

// ==============================|| Export functions ||============================== //

module.exports = {
    async getStudentInfo(ctx) {
        // Initialize and retrieve basic information
        let student = ctx.request.body;
        let studentInfo = await strapi
            .query("student")
            .find({ id: student.id });

        let programInfo = await strapi
            .query("program")
            .find({ name: studentInfo[0].program });
        delete studentInfo[0].program;
        studentInfo[0].program = programInfo[0];
        student.studentInfo = studentInfo[0];

        // Add course(Already enrolled) information
        let result = await strapi
            .query("students-courses")
            .find({ student_id: student.id });
        let courseArr = [];
        for (let i = 0; i < result.length; i++) {
            let course = await strapi
                .query("course")
                .find({ uid: result[i].course_id });
            courseArr.push(course);
        }
        student.course = courseArr;

        // Return object
        ctx.send([student]);
        return student;
    },

    async updateStudentGraduate(ctx) {
        try {
            let studentInfo = ctx.request.body;
            let sliceYear = Number(studentInfo.lastSemester.slice(0, 4));
            let sliceTerm = studentInfo.lastSemester.slice(
                4,
                studentInfo.lastSemester.length
            );
            let result = await strapi.query("student").update(
                {
                    id: studentInfo.studentId,
                },
                {
                    expected_grad_year: sliceYear,
                    expected_grad_term: sliceTerm,
                }
            );
            ctx.send("Great, successfully saved!");
        } catch (e) {
            ctx.send(e);
        }
    },

    async getAdvisorStat(ctx) {
        try {
            let result = {
                advisor_name: [],
                data: [],
            };
            let data = await strapi.services["student"].groupByProperty(
                "advisor"
            );
            for (let key in data) {
                let obj = data[key];
                result.data.push(obj.length);
                if (key === "") {
                    result.advisor_name.push("Unassigned");
                } else {
                    result.advisor_name.push(key);
                }
            }
            return ctx.send(result);
        } catch (e) {
            return ctx.send(e);
        }
    },

    async getGenderStat(ctx) {
        let result = {
            label: [],
            data: [],
        };
        let data = await strapi.services["student"].groupByProperty("gender");
        for (let key in data) {
            let obj = data[key];
            result.data.push(obj.length);
            if (
                key === "" ||
                key === "null" ||
                key === null ||
                key === undefined
            ) {
                result.label.push("Unassigned");
            } else {
                result.label.push(key);
            }
        }
        ctx.send(result);
    },

    async getTypeStat(ctx) {
        let result = {
            label: [],
            data: [],
        };
        let data = await strapi.services["student"].groupByProperty("type");
        for (let key in data) {
            let obj = data[key];
            result.data.push(obj.length);
            if (
                key === "" ||
                key === "null" ||
                key === null ||
                key === undefined
            ) {
                result.label.push("Unassigned");
            } else {
                result.label.push(key);
            }
        }
        ctx.send(result);
    },

    /**
	 * 
	 * @param {N/A}
	 * @returns {
	 * 	label: ["2021 Spring", "2021 Summer", "2021 Fall"],
	 * 	data: [{
              name: 'series1',
              data: [31, 40, 28, 51, 42, 109, 100]
            }, {
              name: 'series2',
              data: [11, 32, 45, 32, 34, 52, 41]
        }],
	 * }
	 */
    async getStartTermAndGraduateTermStat(ctx) {
        let result = {
            label: [],
            data: [
                {
                    name: "Start",
                    data: [],
                },
                {
                    name: "Graduate",
                    data: [],
                },
            ],
        };
        const rawData = await strapi.query("student").find({ _limit: -1 });
        let groupByStartData = _.groupBy(rawData, (obj) => {
            return obj.start_year + " " + obj.start_term;
        });
        let groupByEndData = _.groupBy(rawData, (obj) => {
            return obj.expected_grad_year + " " + obj.expected_grad_term;
        });

        let sValue = 999999;
        let bValue = 0;
        let endTerm = "";
        let startTerm = "";
        for (let key in { ...groupByStartData, ...groupByEndData }) {
            let currValue = calculateTermValue(key);
            if (currValue > bValue && currValue > 0) {
                bValue = currValue;
                endTerm = key;
            }
            if (currValue < sValue && currValue > 0) {
                sValue = currValue;
                startTerm = key;
            }
        }
        const fillArr = ["Unassigned", ...fillTerm(sValue, bValue), endTerm];
        groupByStartData = calculateNumber(groupByStartData);
        groupByEndData = calculateNumber(groupByEndData);

        // Match to corresponding
        fillArr.forEach((currTerm) => {
            let startNumb = 0;
            let endNumb = 0;
            groupByStartData.forEach((startObj) => {
                if (startObj.name === currTerm) {
                    startNumb = startObj.value;
                }
            });
            groupByEndData.forEach((endObj) => {
                if (endObj.name === currTerm) {
                    endNumb = endObj.value;
                }
            });
            result.label.push(currTerm);
            result.data[0].data.push(startNumb);
            result.data[1].data.push(endNumb);
        });

        return ctx.send(result);
    },

    async getStudentCountTide(ctx) {
        const rawData = await strapi.query("student").find({ _limit: -1 });
        let groupByStartData = _.groupBy(rawData, (obj) => {
            return obj.start_year + " " + obj.start_term;
        });
        let groupByEndData = _.groupBy(rawData, (obj) => {
            return obj.expected_grad_year + " " + obj.expected_grad_term;
        });

        let sValue = 999999;
        let bValue = 0;
        let endTerm = "";
        let startTerm = "";
        for (let key in { ...groupByStartData, ...groupByEndData }) {
            let currValue = calculateTermValue(key);
            if (currValue > bValue && currValue > 0) {
                bValue = currValue;
                endTerm = key;
            }
            if (currValue < sValue && currValue > 0) {
                sValue = currValue;
                startTerm = key;
            }
        }
        const fillArr = ["Unassigned", ...fillTerm(sValue, bValue), endTerm];
        groupByStartData = calculateNumber(groupByStartData);
        groupByEndData = calculateNumber(groupByEndData);

        // Match to corresponding
        let antResult = [];
        fillArr.forEach((currTerm) => {
            let startNumb = 0;
            let endNumb = 0;
            groupByStartData.forEach((startObj) => {
                if (startObj.name === currTerm) {
                    startNumb = startObj.value;
                }
            });
            groupByEndData.forEach((endObj) => {
                if (endObj.name === currTerm) {
                    endNumb = endObj.value;
                }
            });
            antResult.push({
                term: currTerm,
                type: "Start",
                value: startNumb,
            });
            antResult.push({
                term: currTerm,
                type: "Graduate",
                value: endNumb,
            });
        });

        return ctx.send(antResult);
    },

    async getAdviseeByAdvisor(ctx) {
        const request = ctx.request.body;
        let queryBody = { _limit: -1 };
        switch (request.role) {
            case "Staff":
                break;
            case "Faculty":
                queryBody["advisor"] = request.advisorName;
                break;
        }
        const studentList = await strapi
            .query("student")
            .find(queryBody)
            .then((response) => {
                let arr = response.map((el, index) => {
                    return {
                        ...el,
                        concatStartTerm: el.start_year + " " + el.start_term,
                        concatGradTerm:
                            el.expected_grad_year + " " + el.expected_grad_term,
                    };
                });
                // arr = sortByTerm(arr, "DESC", "concatStartTerm");
                return arr;
            });
        return ctx.send(studentList);
    },
};
