const buffer = require('buffer/').Buffer;

const encodedString = (email) => {
    return buffer.from(email).toString('base64');
}

const decodedString = (string) => {
    return buffer.from(string, 'base64').toString('ascii');
}

module.exports = {
    encodedString,
    decodedString
}
