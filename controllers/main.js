'use strict';

var config = require('config');
var _ = require('underscore');

var errorHandler = require('et-express-error-handlers');
var testController = require('./test-can-remove'); // you should remove this. just for unit tests


var SampleModel = require(__dirname + '/../models/SampleModel.js');
var sampleModel = new SampleModel();

var defaultOptions = {
	title: 'SampleNodeApp | by ExactTarget',
	ui: JSON.stringify(config.ui)
};

var matchDeeplink = function(link) {
	if (config.deepLinkWhitelist && config.deepLinkWhitelist.length) {
		for (var i = 0; i < config.deepLinkWhitelist.length; i++) {
			var deepLink = config.deepLinkWhitelist[i];
			if (_.isRegExp(deepLink)) {
				if (deepLink.test(link)) {
					return true;
				}
			} else {
				if (link === deepLink) {
					return true;
				}
			}
		}
	}
	return false;
};

module.exports = function(server) {
	server.post('/login', function(req, res) {
		if (req.deepLink) {
			if (matchDeeplink(req.deepLink)) {
				res.redirect(req.deepLink);
			} else {
				res.redirect('/');
			}
		} else {
			res.redirect('/');
		}
	});

	server.get('/logout', function(req, res) {
		req.session.destroy(function() {
			res.clearCookie(config.session.key, {
				path: '/'
			});
			res.send({
				'Logout': true
			});
		});
	});

	server.get('/', function(req, res) {
		var mid = null;
		var eid = null;
		var appId = null;

		if (req.session.fuel) {
			mid = req.session.fuel.mid;
			eid = req.session.fuel.eid;
			appId = config.fuelConfigs[req.session.fuel.stackKey].appId;
		} else {
			appId = config.fuelConfigs.S1.appId;
		}

		res.render('index', _.extend(defaultOptions, {
			csrfToken: res.locals._csrf,
			mid: mid,
			eid: eid,
			appId: appId
		}));
	});

	//This is the Main Route that is called when the application is requested
	server.post('/', function(req, res) {

		var mid = null;
		var eid = null;
		var appId = null;

		if (req.session.fuel) {
			mid = req.session.fuel.mid;
			eid = req.session.fuel.eid;
			appId = config.fuelConfigs[req.session.fuel.stackKey].appId;
		} 
		else {
			appId = config.fuelConfigs.S1.appId;
		}
		
		res.render('index', _.extend(defaultOptions, {
			csrfToken: res.locals._csrf,
			mid: mid,
			eid: eid,
			appId: appId
		}));
		
	});

	server.get('/test', function(req, res) {
		sampleModel.Sample(req, function(err, results){
			res.render('test', {
				results: JSON.stringify(results),
				title: "My Title"
			});
		});
	});
	
	errorHandler(server);
	testController(server);
};

