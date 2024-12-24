import { ensureLoggedIn as __ensureLoggedIn } from 'connect-ensure-login';

class AuthenticationMiddleware {
  // Web Middleware for Admin Authentication
  static ensureAdmin(options = '/auth/login') {
    const ensureLoggedInMiddleware = __ensureLoggedIn(options);

    return function (req, res, next) {
      ensureLoggedInMiddleware(req, res, function () {
        if (req.user && req.user.isAdmin) {
          return next(); // User is admin, allow access
        } else {
          return res.sendJsonResponse(
            403,
            "Forbidden: You are not authorized to access. <a href='/'>Go home</a>"
          );
        }
      });
    };
  }

  // API Middleware for Admin Authentication
  static ensureAdminApi() {
    return function (req, res, next) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.sendJsonResponse(
          401,
          'Unauthorized: Please log in to access this resource.'
        );
      }
      if (req.user && req.user.isAdmin) {
        return next(); // User is admin, allow access
      } else {
        return res.status(403).json({
          status: 'Error',
          message: 'Forbidden: You are not authorized to access this resource.',
        });
      }
    };
  }

  // Web Middleware for Logged-In User Authentication
  static ensureLoggedIn(options = '/auth/login') {
    const ensureLoggedInMiddleware = __ensureLoggedIn(options);

    return function (req, res, next) {
      ensureLoggedInMiddleware(req, res, next);
    };
  }

  // API Middleware for Logged-In User Authentication
  static ensureLoggedInApi() {
    return function (req, res, next) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.sendJsonResponse(
          401,
          'Unauthorized: Please log in to access this resource.'
        );
      }
      return next();
    };
  }
}
// Optimized Exports
export { AuthenticationMiddleware };
