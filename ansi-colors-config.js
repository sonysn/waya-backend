const ansicolors = require('ansi-colors');

const error = ansicolors.red;
const warning = ansicolors.yellow;

// USAGE:
// console.log(error('Error'));
// console.log(warning('Warning'));

module.exports = { error, warning };

