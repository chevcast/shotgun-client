// "this" === shotgun shell instance
module.exports = exports = {

    // Create a shell helper function for setting cookies on the client.
    setCookie: function (name, value, days) {
        this.emit('setCookie', name, value, days);
        return this;
    },

    // Create a shell helper function for retrieving a cookie.
    getCookie: function (name, callback) {
        this.emit('getCookie', name, callback);
        return this;
    },

    getAllCookies: function (callback) {
        this.emit('getAllCookies', callback);
        return this;
    },

    // Create a shell helper function for deleting a cookie.
    delCookie: function (name) {
        return this.setCookie(name, null, -1);
    },

    // Create a shell send function for multi line inputs.
    multiLine: function () {
        this.emit('multiline');
        return this;
    }
};
