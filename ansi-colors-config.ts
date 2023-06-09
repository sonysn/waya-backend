import ansicolors from 'ansi-colors';

export const errormessage = ansicolors.red;
export const warning = ansicolors.yellow;
export const info = ansicolors.blue; 

// USAGE:
// console.log(error('Error'));
// console.log(warning('Warning'));
// console.log(info('Info'));

module.exports = { errormessage, warning, info };

