"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
const _ = require("underscore");

module.exports = {
    groupByProperty: async (condition) => {
        let data = await strapi.query("student").find({ _limit: -1 });
        return _.groupBy(data, (obj) => {
            return obj[condition];
        });
    },
};
