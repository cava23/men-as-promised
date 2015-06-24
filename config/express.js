'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')(session),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path'),
    cors = require('cors'),
    errors = require('../app/util/errors'),
    serviceManager = require('../app/services/serviceManager'),
    log = require('../app/util/logs').getLogger("Request"),
	cacheResponseDirective = require('express-cache-response-directive'),
	constants = require('./constants'),
	_ = require('lodash');

module.exports = function(db) {
	// Initialize express app
	var app = express();

	// Register the app with swagger for documentation generation
	var swagger = require("swagger-node-express").createNew(app);

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
	if (process.env.NODE_ENV === 'local') {
		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'dev') {
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
			mongooseConnection: db.connection,
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
        origin: true,
        credentials: true
    }));

	// Add function to app so that it can be easily mocked in unit tests
	app.getServiceManager = function() {
		return serviceManager;
	};

	// add the service manager to the req, so controllers have access to services
    app.use(function(req, res, next) {
        req.getServiceManager = app.getServiceManager;
        next();
    });

	app.use(cacheResponseDirective());
	app.all('*', function(req, res, next) {
		res.cacheControl("no-store");
		next();
	});

	// API calls send results in a "result" subdocument using the res.sendResult() method
	// Objects returned by services may also have an additional subdocument called 'meta'
	app.use(function(req, res, next) {
		res.sendResult = function(result) {
			var response;
			if (result) {
				response = {
					ok: true
				};

				if (result.result) {
					response.result = result.result;
				} else {
					response.result = result;
				}

				if (result.meta) {
					response.meta = result.meta;
				}

				if (_.isArray(response.result)) {
					response.count = response.result.length;
				}

				if ((process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "local") && !req.headers[constants.HEADER_NO_DELAY]) {
					setTimeout(function() {res.json(response);}, Math.random()*1000);
				} else {
					res.json(response);
				}
			} else {
				next();
			}
		};
		next();
	});

	// Pretend to be an org
	app.use(function(req, res, next) {
		if (req.user && req.user.isSystemAdmin()) {
			if (req.headers && req.headers.org) {
				req.user.org = req.headers.org;
			}
		}
		next();
	});

	// Transform query parameters
	app.use(function(req, res, next) {
		_.forOwn(req.query, function(value, key) {
			if (value === 'true') {
				req.query[key] = true;
			} else if (value === 'false') {
				req.query[key] = false;
			}
		});
		next();
	});

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app, swagger);
	});

	// set api info
	swagger.setApiInfo({
		title: "API Docs",
		description: "",
		//termsOfServiceUrl: "http://helloreverb.com/terms/",
		contact: "api@men-as-promised.com",
		license: "Apache 2.0",
		licenseUrl: "http://www.apache.org/licenses/LICENSE-2.0.html"
	});

	swagger.configureSwaggerPaths("", "api-docs", "");
	swagger.configure(config.hostname, "0.0.1");

	// Serve up swagger ui at /docs via static route
	var docs_handler = express.static(__dirname + '/../app/swagger-ui/');
	app.get(/^\/docs(\/.*)?$/, function(req, res, next) {
		if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
			res.writeHead(302, { 'Location' : req.url + '/' });
			res.end();
			return;
		}
		// take off leading /docs so that connect locates file correctly
		req.url = req.url.substr('/docs'.length);
		return docs_handler(req, res, next);
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

    // Return Express server instance
    return app;
};
