const asyncMiddleware = (fn) => (req, res, next) => {
  // Wrap the asynchronous function `fn` with Promise.resolve to handle both Promise-based and async/await functions
  Promise.resolve(fn(req, res, next)).catch(next); // Catch any errors and pass them to Express's error handling middleware (next)
};

// Export the asyncMiddleware function
export default asyncMiddleware;
export { asyncMiddleware };
