'use strict';

var config = require('config');
var _ = require('underscore');

var errorHandler = require('et-express-error-handlers');
var testController = require('./test-can-remove'); // you should remove this. just for unit tests

var SQLHelper = require(__dirname + '/../models/SQLHelper.js');
var sqlHelper = new SQLHelper();



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
			appId = config.fuelConfigs.QA1S1.appId;
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
			appId = config.fuelConfigs.QA1S1.appId;
		}

		//Check to see if the Folder ID's are present in the session
		if(req.session.DEFolderID == null || req.session.QueryFolderID == null){

			//Folder ID's were not found so let's go get them.
			sqlHelper.init(req, mid + "_" +config.appOptions.folderName, function(err, response) {
				console.log(response);
				
				sqlHelper.GetFoldersAndObjects(req, req.session.ParentDEFolderID, function(err, response){
					res.render('index', _.extend(defaultOptions, {
						csrfToken: res.locals._csrf,
						mid: mid,
						eid: eid,
						appId: appId, 
						uiObjects: JSON.stringify(response)
					}));
				});
				
				
			});
		}
		else{
				
			console.log("Session values found");
			sqlHelper.GetFoldersAndObjects(req, req.session.ParentDEFolderID, function(err, response){
					res.render('index', _.extend(defaultOptions, {
						csrfToken: res.locals._csrf,
						mid: mid,
						eid: eid,
						appId: appId, 
						uiObjects: JSON.stringify(response)
					}));
				});
		}
	});

	server.post('/GetFoldersAndObjects', function(req, res) {
		sqlHelper.de_retrieveAll(req, function(err, results) {
			res.send(results);
		});
		
		//sqlHelper.GetFoldersAndObjects(req, req.session.ParentDEFolderID, function(err, response){
		//			res.send(response);
		//});
	});
	
	server.post('/GetFolders', function(req, res) {
		console.log("Calling Get Folders: ParentID - " + req.session.ParentDEFolderID)
		sqlHelper.GetFolders(req, req.session.ParentDEFolderID, function(err, response){
			res.send(response);
		});
	});
	
	server.post('/CreateFolder', function(req, res) {
		sqlHelper.CreateFolder(req, function(err, response){
			res.send(response);
		});
	});
	
	server.post('/GetObjects', function(req, res) {
		sqlHelper.GetObjects(req, req.body.ParentFolderID, function(err, response){
			res.send(response);
		});
	});
	
	server.post('/deFieldlist', function(req, res) {
		sqlHelper.deField_list(req, function(err, results) {
			res.send(results);
		});
	});
	
	server.post('/queryStatus', function(req, res) {
		sqlHelper.queryStatus(req, function(err, results) {
			res.send(results);
		});
	});
	
	server.post('/nameCheck', function(req, res) {
		
		sqlHelper.nameCheck(req, function(err, results) {
			res.send(results);
		});
	});

	server.post('/CreateQuery', function(req, res) {

		var mid = null;
		var eid = null;
		var appId = null;

		if (req.session.fuel) {
			mid = req.session.fuel.mid;
			eid = req.session.fuel.eid;
			appId = config.fuelConfigs[req.session.fuel.stackKey].appId;
		} else {
			appId = config.fuelConfigs.QA1S1.appId;
		}		

		sqlHelper.createQuery(req, function(err, response) {
				
			res.render('index', _.extend(defaultOptions, {
				csrfToken: res.locals._csrf,
				mid: mid,
				eid: eid,
				appId: appId, 
				query: req.body.nameCustKey,
				StatusCode: response.StatusCode,
				StatusMessage: response.StatusMessage
				//QueryTaskID: response.QueryResponse.Task.ID
			}));
		
		});
		
		
	});

	server.get('/install', function(req, res) {
		var mid = null;
		var eid = null;
		var appId = null;

		if (req.session.fuel) {
			mid = req.session.fuel.mid;
			eid = req.session.fuel.eid;
			appId = config.fuelConfigs[req.session.fuel.stackKey].appId;
		} else {
			appId = config.fuelConfigs.QA1S1.appId;
		}

		//We need to create the folders
		res.render( 'index', {} );
	});

	/*
	ETParms = 
					{
						objectType: "QueryDefinition",
						props:
						{
							Name: req.body.NameCustKey, 
							CustomerKey:req.body.NameCustKey, 
							Description: req.body.Description,
							QueryText: req.body.QueryText,  
							CategoryID: folders[0].ID,
							DataExtensionTarget: {CustomerKey: "de_sql", Name: "de_sql"},
							TargetUpdateType: "Overwrite",
							Client: {ID: mid }
						},
						options: {}
					}
					
					//Wire this to the new Helper
					etHelper.create(ETParms, function(err, query){
						res.render('index', {});							
		
*/


	server.get('/harness', function(req, res) {
		res.render('harness', {});
	});

	errorHandler(server);
	testController(server);
};

