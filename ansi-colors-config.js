const ansicolors = require('ansi-colors');

const errormessage = ansicolors.red;
const warning = ansicolors.yellow;
const info = ansicolors.blue; 

// USAGE:
// console.log(error('Error'));
// console.log(warning('Warning'));
// console.log(info('Info'));

module.exports = { errormessage, warning, info };

