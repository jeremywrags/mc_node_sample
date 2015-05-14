'use strict';

var config = require('config');
var async = require('async');

var _ = require('underscore');

var FuelSoap = require('fuel-soap');
var SoapClient;
var req;
var ETHelper = require(__dirname + '/../models/ETHelper.js');
var etHelper = new ETHelper();
var errorHandler = require('et-express-error-handlers');

function SQLHelper() {

}

// This is the init function that ensures that the required Folders are present
SQLHelper.prototype.init = function(req, name, callback) {
	
	//instansiate the return object
	var out = new Object();
	
	//Use the async library to get the Query & DE folder at the same time. 
	async.parallel([
    function CheckDEFolder(callback) { 
        CheckFolder(req, name, "Data Extensions", "dataextension", function(err, response, parentID) {
            if (err) {
				callback(err, null);
			}
			else{
				req.session.DEFolderID = response.ID;
				req.session.ParentDEFolderID = parentID;
				callback(null, response);
			}
        });
    },
    function CheckQueryFolder(callback) { 
        CheckFolder(req, name, "Query", "queryactivity", function(err, response, parentID) {
            if (err) {
				callback(err, null);
			}
			else{
				req.session.QueryFolderID = response.ID;
				req.session.ParentQueryFolderID = parentID;
				callback(null, response);
			}
        });
    }
	], 
	function(err, response) { //This is the final callback
	    if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
};

//Return a list of All Data Extension from the ET helper
SQLHelper.prototype.de_retrieveAll = function(req, callback) { 
	etHelper.init(req); 
	etHelper.de_retrieveAll(function(err, response){
		if (err) {
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response);
	});
};

SQLHelper.prototype.GetFoldersAndObjects  = function(req, parentID, callback) { 
	etHelper.init(req); 
	
	async.parallel([
    function GetFolders(callback) { 
        //etHelper.folder_findByParent(parentID, function(err, response, parentID) {
        etHelper.folder_retrieveAll("dataextension", function(err, response, parentID) {
            if (err) {
				callback(err, null);
			}
			else{
				callback(null, response);
			}
        });
    },
    function GetObjects(callback) { 
        etHelper.de_findByParent(parentID, function(err, response, parentID) {
        //etHelper.de_retrieveAll(function(err, response, parentID) {
            if (err) {
				callback(err, null);
			}
			else{
				callback(null, response);
			}
        });
    }
	], 
	function(err, response) { //This is the final callback
	    if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
};

SQLHelper.prototype.GetObjects  = function(req, parentID, callback) { 
	etHelper.init(req); 
	
    etHelper.de_findByParent(parentID, function(err, response) {
        if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
    });
    
};

SQLHelper.prototype.GetFolders  = function(req, parentID, callback) { 
	etHelper.init(req); 
    etHelper.folder_retrieveAll("dataextension", function(err, response) {
        if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
    });
};

SQLHelper.prototype.CreateFolder  = function(req, callback) { 
	etHelper.init(req); 
    etHelper.folder_create("dataextension", req.body.FolderName, req.body.ParentID, function(err, response) {
        if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
    });
};


SQLHelper.prototype.deField_list = function(req, callback) { 
	etHelper.init(req); 
	etHelper.deField_list(req.body.customerKey, function(err, response){
		if (err) {
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response);
	});
};

SQLHelper.prototype.query_status = function(req, callback) { 
	etHelper.init(req); 
	etHelper.query_status(req.body.taskID, function(err, response){
		if (err) {
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response);
	});
};

SQLHelper.prototype.nameCheck = function(req, callback) { 

	etHelper.init(req); 
	etHelper.nameCheck (req.body.customerKey, req.body.objType, function(err, response){
		if (err) {
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response);
	});
};

SQLHelper.prototype.createQuery = function(req, callback) {

	etHelper.init(req); 
	var fields = parseSQL(req.body.queryText);
	var out = new Object();
	out.StatusMessage = "";
	
	etHelper.de_create(fields, function(err, response) {
		if(err){
			out.StatusCode = err.results[0].StatusCode;
			out.StatusMessage = err.results[0].StatusMessage;
			callback(null, out);
		}
		else{
			if(response.StatusCode == "OK")
			{
				out.StatusCode = "OK";
				out.StatusMessage += response.StatusMessage + "<br/>";
				
				etHelper.query_create(function(err, response) {	
					if(err){
						out.StatusCode = err.results[0].StatusCode;
						out.StatusMessage = err.results[0].StatusMessage;
						
						etHelper.de_delete(function(err, response){
							out.StatusMessage += "Cleanup Response: " + response.StatusMessage + "<br/>";
							callback(null, out);
						});
					}
					else{
						if(response.StatusCode == "OK")
						{
							out.StatusCode = "OK";
							out.StatusMessage += response.StatusMessage + "<br/>";
							
							etHelper.query_execute(response.NewObjectID, function(err, response){
								if(err){
									out.StatusCode = err.results[0].StatusCode;
									out.StatusMessage += err.results[0].StatusMessage;
									callback(null, out);
								}
								else{
									out.StatusCode = "OK";
									out.StatusMessage += response.StatusMessage + "<br/>";
									out.QueryResponse = response;
									callback(null, out);
								}
							});
						}
						else{
							out.StatusCode = "Warning";
							out.StatusMessage += response.StatusMessage + "<br/>";
							callback(null, out);
						}
					}
				});
			}
			else{
				out.StatusCode = "Warning";
				out.StatusMessage += response.StatusMessage + "<br/>";
				callback(null, out);
			}
		}
	});
};

function parseSQL(query) {

	query = query.replace("distinct", "").toLowerCase();
	var fields = query.substring(query.indexOf("Select") + 7, query.indexOf("from")).split(",");
	var outFields = [];


	for (var i = 0; i < fields.length; i++) {
		var f = {
			Description: "",
			IsRequired: false,
			IsPrimaryKeyField: false,
			FieldType: "Text",
			DeafultValue: "",
		};

		if (fields[i].indexOf("as") > 0) {
			f.Name = fields[i].substring(fields[i].indexOf("as") + 3).trim();
			outFields.push(f);
		}
		else if (fields[i].indexOf(".") > 0) {
			f.Name = fields[i].substring(fields[i].indexOf(".") + 1).trim();
			outFields.push(f);
		}
		else {
			f.Name = fields[i].trim();
			outFields.push(f);
		}

	}

	return outFields;
}

//Gets the Folder that the App should store it's assests in
function GetAppParentFolder(req, name, parentID, callback){
	etHelper.init(req); 
	etHelper.folder_findByNameParent(name, parentID, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
}

//Get the parent folder by type
function GetParentFolder(req, type, name, callback){
	etHelper.init(req); 
	etHelper.folder_findParentByType(type, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
}

function CheckFolder(req, name, parentName, type, callback) {
	async.waterfall([
    function GetDEParent(callback) { 
        GetParentFolder(req, type, parentName, function(err, response) {
            if (err) {
				callback(err, null);
			}
			else{
				callback(null, response);
			}
        });
    },
    function GetAppParent(resp, callback) { 
        GetAppParentFolder(req, name, resp.ID, function(err, response) {
            if (err) {
				callback(err, null);
			}
			else{
				callback(null, response, resp.ID);
			}
        });
    },
    function CreateFolder(resp, parentID, callback) { 
        if(!resp)
        {
        	etHelper.folder_create(type, name, parentID, function(err, response) {
				if (err) {
					callback(err, null);
				}
				else{
					callback(null, response, parentID);
				}
        	});	
       
    	}
    	else
    		callback(null, resp, parentID);
    }
	], 
	function(err, response, parentID) { //This is the final callback
	    if (err) {
			callback(err, null);
		}
		else{
			callback(null, response, parentID);
		}
	});
}

module.exports = SQLHelper;