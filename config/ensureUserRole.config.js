const connectEnsureLogin = require('connect-ensure-login');

function ensureAdmin(options = '/auth/login') {
    // Reuse the ensureLoggedIn functionality first to check if user is logged in
    const ensureLoggedInMiddleware = connectEnsureLogin.ensureLoggedIn(options);

    return function (req, res, next) {
        // First, call the ensureLoggedIn middleware
        ensureLoggedInMiddleware(req, res, function () {
            // If the user is logged in, check if they are an admin
            if (req.user && req.user.isAdmin) {
                return next(); // User is admin, allow access
            } else {
                return res.status(403).send("Forbidden: you are authorized to access. <a href='/'>Go home</a>"); // User is not admin
            }
        });
    };
}
function ensureLoggedIn(options = '/auth/login') {
    return connectEnsureLogin.ensureLoggedIn(options);
}
module.exports.ensureAdmin = ensureAdmin;
module.exports.ensureLoggedIn = ensureLoggedIn;
