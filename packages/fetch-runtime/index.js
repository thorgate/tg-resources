require('cross-fetch/polyfill');

if (typeof module !== 'undefined' && module.exports) {
    global.FormData = require('form-data');
} else {
    require('formdata-polyfill');
}
