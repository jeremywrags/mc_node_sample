'use strict';


var fs      = require( 'fs' );
var http    = require( 'http' );
var https   = require( 'https' );
var config  = require( 'config' );
var express = require( 'express' );
var appsec  = require( 'lusca' );
var pkg     = require( './package.json' );
var app     = express();

var multer  = require('multer');
app.use(multer({ dest: './uploads/'}));

// express handlebars setup
var exphbs    = require( 'express-handlebars' );
var hbsConfig = require( './lib/hbs-config' );
var hbs       = exphbs.create( hbsConfig );

// fuel token management configured from config file
var fuelTokenMiddleware = require( 'et-fuel-token' )( config.fuelConfigs );

// getting main controller for routes
var mainController = require( './controllers/main' );

// rest proxies
var restProxyController = require( 'et-rest-proxy' );

// adding custom middleweare
var lessCompiler = require( 'express-less-middleware' )();

// switched to method-override from express.methodOverride()
var methodOverride = require('method-override');

// Webfonts need mime types, too!
express.static.mime.define( { 'application/x-font-woff': [ 'woff' ] } );
express.static.mime.define( { 'application/x-font-ttf': [ 'ttf' ] } );
express.static.mime.define( { 'application/vnd.ms-fontobject': [ 'eot' ] } );
express.static.mime.define( { 'font/opentype': [ 'otf' ] } );
express.static.mime.define( { 'image/svg+xml': [ 'svg' ] } );

// use express session middleware
// for multi-instance apps MemoryStore should be replaced
// with a cross instance store such as RedisStore
app.use( express.session({
	store: new express.session.MemoryStore()
	, secret: 'samplenodeappSecret!@#$2453'
	, key: 'samplenodeapp450Key'
} ) );

// gzipping
app.use( express.compress() );

// setting port correctly
app.set( 'port', process.env.PORT || ( config.sslOptions && config.sslOptions.port) || config.port );

// using express3 handlebars for templating
app.engine( 'handlebars', hbs.engine );
app.set( 'view engine', 'handlebars' );
app.set( 'views', __dirname + '/views/' );

// serving front-facing app from static place
// include before any middleware unnecessary for static files
app.use( config.ui.bowerBase, express.static( __dirname + config.ui.bowerBase ) );
app.use( express.static( __dirname + config.ui.publicDir ) );

// allowing express to behave like a RESTful app
app.use( methodOverride() );
app.use( express.cookieParser() );

app.use( function ( req, res, next ) {
	app.disable( 'X-Powered-By' );
	res.setHeader( "X-Powered-By", "ExactTarget" );
	next();
});

// SECURITY IMPLEMENTED WITH LUSCA --> https://github.com/krakenjs/lusca


// HTTP Strict Transport Security --> https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
// default because we should only be using SSL, and the dev NODE_ENV is run on an SSL
app.use(appsec.hsts({ maxAge: 31536000 }));

// IE8 XSS. Included by default since most apps will be used in IE8
app.use(appsec.xssProtection(true));

// setup buffers for rest proxies to handle async actions before proxy
// must be added prior to any asynchronous middleware (e.g. fuelTokenManager )
restProxyController.registerProxyBuffers( app );

// Fuel Token middleware
app.use( fuelTokenMiddleware );

if (app.get('env') === 'dev') {
	console.log( 'Running '+ pkg.name +' in dev mode' );

	// using less compiler
	app.use( lessCompiler );

	// error handling dump, only in dev
	app.use( express.errorHandler( { dumpException: true, showStack: true } ) );
}

 if (app.get('env') === 'prod') {
	console.log( 'Running '+ pkg.name +' in production mode' );	
}

console.log( 'Running in '+ app.get('env') +' mode' );	

/*
// getting csrf tokens to work on pages that need SSO flow
var csrf = appsec.csrf();
var conditionalCSRF = function (req, res, next) {
	// actually checking to see if we need middleware
	if ( !config.csrfFreeRoutes[ req.path ] ) {
		csrf(req, res, next);
	} else {
		next();
	}
};

app.use(conditionalCSRF);
*/
// using router middleware

// configuring routes here. edit inside ./controllers/main.js to add routes
mainController( app );

// configure the rest proxy handlers ./controllers/rest.js
restProxyController.registerProxyHandlers( app );

app.use( app.router );

function start() {

	// creating server on SSL port based on config options (should only be in dev.js)
	if ( Boolean( config.sslOptions ) ) {
		https.createServer({
			key: fs.readFileSync( config.sslOptions.key_file ),
			cert: fs.readFileSync( config.sslOptions.cert_file )
		}, app ).listen( app.get( 'port' ) );

	} else {
		// otherwise starting the server up without SSL
		http.createServer( app ).listen( app.get( 'port' ) );
	}
	console.log(config.appOptions.appVersion);
	console.log('Express server for ' + pkg.name + ' started on port %d in %s mode', app.get('port'), process.env.NODE_ENV || 'local' );
}

exports.start = start;
exports.app   = app;
