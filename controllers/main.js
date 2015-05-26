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
	});
	
	server.post('/FolderTree', function(req, res) {
		
		var treeRef = req.body.treeRef;
		var treeType = req.body.treeType;
		

		sqlHelper.GetFolders(req, req.session.ParentDEFolderID, "dataextension", function(err, response){
			var items = response;
	        var arr = [];
	        var obj = new Object();
	          
        	obj.id = req.session.ParentDEFolderID;
	        obj.parent = "#";
	        obj.text = "Data Extensions";
	        arr.push(obj);
	
	        for (var i = 0; i < items.length; i++) {
	        	if (items[i].ParentFolder.ID != 0) {
	            	var obj = new Object();
	              	obj.id = items[i].ID;
	              	if(items[i].Name === req.session.fuel.mid + "_" +config.appOptions.folderName)
	              		obj.a_attr = {nodeType: "appFolder", treeRef: treeRef};
	              	else
		              	obj.a_attr = {nodeType: "folder"};
	              	obj.parent = items[i].ParentFolder.ID;
	              	obj.text = items[i].Name;
	              	arr.push(obj);
	            }
	       	}
			
			res.send(arr);
		});
	});
	
	server.post('/CreateFolder', function(req, res) {
		sqlHelper.CreateFolder(req, function(err, response){
			if(err)
				res.send(err.results[0]);
			else
				res.send(response[0]);
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
	
	server.post('/nameCheck', function(req, res) {
		
		sqlHelper.nameCheck(req, function(err, results) {
			res.send(results);
		});
	});

	server.post('/createDE', function(req, res) {
		sqlHelper.createDE(req, function(err, results, fields) {
			if(err)
				res.send({ results : err.results[0] });
			else
				res.send({ results: results, fields: fields});
		});
	});
	
	server.post('/createQuery', function(req, res) {
		sqlHelper.createQuery(req, function(err, results) {
			if(err)
				res.send(err.results[0]);
			else
				res.send(results);
		});
	});
	
	server.post('/executeQuery', function(req, res) {
		sqlHelper.executeQuery(req, function(err, results) {
			if(err)
				res.send(err.results[0]);
			else
				res.send(results);
		});
	});
	
	server.post('/queryStatus', function(req, res) {
		sqlHelper.queryStatus(req, function(err, results) {
			if(err)
				res.send(err.results[0]);
			else
				res.send(results);
		});
	});
	
	server.post('/retrieveRows', function(req, res) {
		sqlHelper.retrieveRows(req, function(err, results) {
			if(err)
				res.send(err.results[0]);
			else
			{
				var arr = [];
				for(var i = 0; i < results.length; i++)
				{
					var arr2 = [];
					for(var j = 0; j < results[i].Properties.Property.length; j++)
					{
						arr2.push(results[i].Properties.Property[j].Value); 
					}
					arr.push(arr2);
				}
				res.send({ data : arr });
			}
		});
	});
	

	server.post('/CreateQuery2', function(req, res) {

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

	server.get('/harness', function(req, res) {
		res.render('harness', {});
	});

	errorHandler(server);
	testController(server);
};

