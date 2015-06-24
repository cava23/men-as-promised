'use strict';

module.exports = {
	maxFileSize: 25 * 1024 * 1024,
	hostname: process.env.API_HOSTNAME || "http://localhost:3000",
	port: process.env.PORT || 3000,
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'SHHHHHIMASECRET',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',
	// The session cookie settings
	sessionCookie: {
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge: null
		// To set the cookie in a specific domain uncomment the following
		// setting:
		// domain: 'yourdomain.com'
	},
	// The session cookie name
	sessionName: 'connect.sid',
	log_level: 'debug',
    services: {
		externalServiceExample: {
			hostname: process.env.EXAMPLE_SERVICE_HOSTNAME || "localhost",
			port: process.env.EXAMPLE_SERVICE_PORT || 8080,
			timeout: process.env.EXAMPLE_SERVICE_TIMEOUT || 10000
		}
    }
};
