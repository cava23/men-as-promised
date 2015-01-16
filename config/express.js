'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	logger = require('./logger'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path'),
    cors = require('cors'),
    errors = require('../app/util/errors'),
    serviceManager = require('../app/services/serviceManager'),
    log = require('../app/util/logs').getLogger("Request"),
	cacheResponseDirective = require('express-cache-response-directive'),
	_ = require('lodash');

module.exports = function(db) {
	// Initialize express app
	var app = express();

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);

	app.engine('.html', consolidate.swig);
	app.set('view engine', '.html');
	app.set('views', './app/templates');

	// Enable request logging
    app.use(require('winston-request-logger').create(log, {
        route: ':method :url[pathname]',
        statusCode: ':statusCode',
        responseTime: ':responseTime ms'
    }));

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	} else if (process.env.NODE_ENV === 'test') {
        console.log('Using longjohn for long stack traces');
        require('longjohn');
    }

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		}),
		cookie: config.sessionCookie,
		name: config.sessionName
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');

    // enable CORS
    app.use(cors({
        origin: config.host,
        credentials: true
    }));

    // add the service manager to the req, so controllers have access to services
    app.use(function(req, res, next) {
        req.getServiceManager = function() { return serviceManager; };
        next();
    });

	app.use(cacheResponseDirective());
	app.all('*', function(req, res, next) {
		res.cacheControl("no-store");
		next();
	});

	// API calls send results in a "result" subdocument using the res.sendResult() method
	app.use(function(req, res, next) {
		res.sendResult = function(result) {
			var response;
			if (result) {
				response = {
					ok: true,
					result: result
				};

				if (_.isArray(result)) {
					response.count = result.length;
				}

				res.json(response);
			} else {
				next();
			}
		};
		next();
	});

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	app.use(function(err, req, res, next) {
		// If the error object doesn't exist
		if (!err) {
            return next();
        }

        // Uncaught Error
        log.error(err);
        errors.returnError(res, err);
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).json({
            statusCode:404,
            message: "Not Found"
        });
	});

	if (process.env.NODE_ENV === 'secure') {
		// Log SSL usage
		console.log('Securely using https protocol');

		// Load SSL key and certificate
		var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}

    // Return Express server instance
    return app;
};