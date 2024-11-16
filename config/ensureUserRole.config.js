import { ensureLoggedIn as __ensureLoggedIn } from 'connect-ensure-login';

function ensureAdmin(options = '/auth/login') {
  // Reuse the ensureLoggedIn functionality first to check if user is logged in
  const ensureLoggedInMiddleware = __ensureLoggedIn(options);

  return function (req, res, next) {
    // First, call the ensureLoggedIn middleware
    ensureLoggedInMiddleware(req, res, function () {
      // If the user is logged in, check if they are an admin
      if (req.user && req.user.isAdmin) {
        return next(); // User is admin, allow access
      } else {
        return res
          .status(403)
          .send(
            "Forbidden: you are authorized to access. <a href='/'>Go home</a>"
          ); // User is not admin
      }
    });
  };
}
function ensureLoggedIn(options = '/auth/login') {
  return __ensureLoggedIn(options);
}
const _ensureAdmin = ensureAdmin;
export { _ensureAdmin as ensureAdmin };
const _ensureLoggedIn = ensureLoggedIn;
export { _ensureLoggedIn as ensureLoggedIn };
