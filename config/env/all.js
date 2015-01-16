'use strict';

module.exports = {
	app: {
		title: 'Men-as-Promised',
		description: 'Back-end JavaScript with MongoDB, Express, and Node.js',
		keywords: 'mongodb, express, node.js, mongoose, passport'
	},
    host: "http://localhost:8000",
	port: process.env.PORT || 3000,
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'men-as-promised',
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
    },
	assets: {}
};