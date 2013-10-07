// "this" === shotgun shell instance
module.exports = exports = {
    // Create a shell helper function for setting cookies on the client.
    setCookie: function (name, value, days) {
        var newCookies = shell.getVar('newCookies') || {};
        newCookies[name] = { value: value, days: days };
        return shell.setVar('newCookies', newCookies);
    },
    // Create a shell helper function for retrieving a cookie.
    getCookie: function (name) {
        var cookies = shell.getVar('cookies');
        if (!cookies) return;
        if (cookies.hasOwnProperty(name)) return cookies[name];
    },
    // Create a shell helper function for deleting a cookie.
    delCookie: function (name) {
        this.setCookie(name, null, -1);
    }
};