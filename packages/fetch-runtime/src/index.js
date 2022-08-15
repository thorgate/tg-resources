/* eslint-disable global-require,no-restricted-globals */
require('cross-fetch/polyfill');
require('abortcontroller-polyfill/dist/abortcontroller-polyfill-only');

(function ($self) {
    if (typeof $self.FormData === 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            global.FormData = require('form-data');
        } else {
            require('formdata-polyfill');
        }
    }
})(typeof self !== 'undefined' ? self : global);
