const data = [
    {
        studentId: 2,
        startTerm: "2023 Spring",
        gradTerm: "2026S pring",
    },
    {
        studentId: 1,
        startTerm: "2021 Fall",
        gradTerm: "2025 Fall",
    },
    {
        studentId: 3,
        startTerm: "2022 Fall",
        gradTerm: "2026 Fall",
    },
];

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

function descendingComparator(a, b, orderBy) {
    let bVal = calculateTermValue(b[orderBy]);
    let aVal = calculateTermValue(a[orderBy]);
    if (bVal < aVal) {
        return -1;
    }
    if (bVal > aVal) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === "DESC"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function sortByTerm(array, order, orderBy) {
    const comparator = getComparator(order, orderBy);
    const sortedArray = array.sort((a, b) => {
        return comparator(a, b);
    });
    return sortedArray;
}

module.exports = { sortByTerm };
