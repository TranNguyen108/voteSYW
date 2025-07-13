// Authentication middleware
const requireAuth = (type) => {
    return (req, res, next) => {
        // Check if user is authenticated for this type
        if (req.session && req.session[`${type}Authenticated`]) {
            return next();
        }
        
        // Redirect to login page with return URL
        res.redirect(`/login?type=${type}&return=${encodeURIComponent(req.originalUrl)}`);
    };
};

module.exports = {
    requireAuth
};
