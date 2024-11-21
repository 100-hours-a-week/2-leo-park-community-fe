// /backend/utils/authorization.js

function isAuthor(resourceAuthor, requestAuthor) {
    return resourceAuthor === requestAuthor;
}

module.exports = { isAuthor };