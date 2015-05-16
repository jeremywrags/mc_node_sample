'use strict';

var config = require('config');
var _ = require('underscore');
var errorHandler = require('et-express-error-handlers');
var FuelSoap = require('fuel-soap');
var SoapClient;
var req;

function ETHelper() {
}
ETHelper.prototype.init = function(request) {
	
	req = request;
	
	var options = {
		auth: {
			clientId: config.fuelConfigs[req.session.fuel.stackKey].clientId,
			clientSecret: config.fuelConfigs[req.session.fuel.stackKey].clientSecret,
			authUrl: config.fuelConfigs[req.session.fuel.stackKey].authUrl,
			refreshToken: req.session.fuel.refreshToken,
			accessToken: req.session.fuel.token
		},
		soapEndpoint: config.fuelConfigs[req.session.fuel.stackKey].soapEndpoint
	};
	SoapClient = new FuelSoap(options);
}

ETHelper.prototype.folder_findByParent = function(parentID, callback) { 

	var parms = {
		objectType: "DataFolder",
		props: ["Name", "ID", "ContentType", "ParentFolder.ID"],
		options: {
			filter:{
				leftOperand: 'ParentFolder.ID',
				operator: 'equals',
				rightOperand: parentID
			}
		}
	};
	
	this.retrieve(parms, function(err, response){
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
};
ETHelper.prototype.folder_retrieve = function(type, callback){

	var parms = {
		objectType: "DataFolder",
		props: ["Name", "ID", "ContentType", "ParentFolder.ID"],
		options: {
			filter:{
				leftOperand: 'ContentType',
				operator: 'equals',
				rightOperand: type
			}
		}
	};
	
	this.retrieve(parms, function(err, response){
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
};
ETHelper.prototype.folder_findByNameType = function(type, name, callback) {

	//Setup the DEFolder Lookup Filter
	var parms = {
		objectType: "DataFolder",
		props: ["Name", "ID", "ContentType", "ParentFolder.ID"],
		options: {
			filter: {
				leftOperand: {
					leftOperand: 'Name',
					operator: 'equals',
					rightOperand: name
				},
				operator: 'AND',
				rightOperand: {
					leftOperand: 'ContentType',
					operator: 'equals',
					rightOperand: type
				}
			}
		}
	};

	//Look for the Folder
	this.retrieve(parms, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0]);
		}
	});
};
ETHelper.prototype.folder_findParentByType = function(type, callback) {

	//Setup the DEFolder Lookup Filter
	var parms = {
		objectType: "DataFolder",
		props: ["Name", "ID", "ContentType", "ParentFolder.ID"],
		options: {
			filter: {
				leftOperand: {
					leftOperand: 'ContentType',
					operator: 'equals',
					rightOperand: type
				},
				operator: 'AND',
				rightOperand: {
					leftOperand: 'ParentFolder.ID',
					operator: 'equals',
					rightOperand: "0"
				}
			}
		}
	};

	//Look for the Folder
	this.retrieve(parms, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0]);
		}
	});
};
ETHelper.prototype.folder_findByNameParent = function(name, parentID, callback) {

	//Setup the DEFolder Lookup Filter
	var parms = {
		objectType: "DataFolder",
		props: ["Name", "ID", "ContentType", "ParentFolder.ID"],
		options: {
			filter: {
				leftOperand: {
					leftOperand: 'Name',
					operator: 'equals',
					rightOperand: name
				},
				operator: 'AND',
				rightOperand: {
					leftOperand: 'ParentFolder.ID',
					operator: 'equals',
					rightOperand: parentID
				}
			}
		}
	};

	//Look for the Folder
	this.retrieve(parms, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0]);
		}
	});
};
ETHelper.prototype.folder_create = function(type, name, parentFolderID, callback) {

	var newFolderParms = {
		objectType: "DataFolder",
		props: {
			Name: name,
			CustomerKey: name,
			Description: "This folder is only to be used by the SQL Helper Application",
			ContentType: type,
			IsActive: true,
			IsEditable: true,
			AllowChildren: true,
			ParentFolder: {
				ID: parentFolderID
			},
			Client: {
				ID: req.session.fuel.mid
			}
		},
		options: {}
	};

	this.create(newFolderParms, SoapClient, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
};
ETHelper.prototype.de_create = function(fields, callback) {

	var parms = {
		objectType: "DataExtension",
		props: {
			Name: req.body.nameCustKey,
			CustomerKey: req.body.nameCustKey,
			Description: req.body.description,
			IsSendable: false,
			IsTestable: false,
			Fields: {
				Field: fields
			},
			Client: {
				ID: req.session.fuel.mid
			},
			CategoryID: req.session.DEFolderID
		},
		options: {}
	};

	this.create(parms, SoapClient, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0]);
		}
	});
};
ETHelper.prototype.de_delete = function(callback) {

	var parms = {
		objectType: "DataExtension",
		props: {
			CustomerKey: req.body.nameCustKey,
			Client: {
				ID: req.session.fuel.mid
			}
		},
		options: {}
	};

	this.delete(parms, SoapClient, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0]);
		}
	});
};
ETHelper.prototype.de_findByParent = function(parentID, callback) { 

	var parms = {
		objectType: "dataextension",
		props: ["Name", "CustomerKey"],
		options: {
			filter:{
				leftOperand: 'CategoryID',
				operator: 'equals',
				rightOperand: parentID
			}
		}
	};
	
	this.retrieve(parms, function(err, response){
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
};
ETHelper.prototype.deField_list = function(customerKey, callback) {
	var parms = {
		objectType: "DataExtensionField",
		props: ["Name", "CustomerKey"],
		options: {
			filter: {
				leftOperand: 'DataExtension.CustomerKey',
				operator: 'equals',
				rightOperand:  customerKey
			}
		}
	};	
		
	this.retrieve(parms, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
};
ETHelper.prototype.de_retrieveAll = function(callback) {
	
	var parms = {
		objectType: "dataextension",
		props: ["Name", "CustomerKey", "CategoryID"],
		filter: "",
		options: {}
	};
	
	this.retrieve(parms, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0]);
		}
	});
};
ETHelper.prototype.nameCheck = function(customerKey, objType, callback) {
	var parms = {
		objectType: objType,
		props: ["Name"],
		options:{
			filter: {
				leftOperand: 'CustomerKey',
				operator: 'equals',
				rightOperand:  customerKey
			}
		}
	};	
		
	this.retrieve(parms, function(err, response){
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response);
		}
	});
};
ETHelper.prototype.query_status = function(taskID, callback) {
	
	var parms = {
		objectType: "AsyncActivityStatus",
		props: ["Status", "StartTime", "EndTime", "StatusMessage"],
		options: {
			filter: {
				leftOperand: 'TaskID',
				operator: 'equals',
				rightOperand:  taskID
			}
		}
	};
	
	this.retrieve(parms, SoapClient, function(err, response) {
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0]);
		}
	});
};
ETHelper.prototype.query_create = function(callback) {

	var parms = {
		objectType: "QueryDefinition",
		props: {
			Name: req.body.nameCustKey,
			CustomerKey: req.body.nameCustKey,
			Description: req.body.description,
			QueryText: req.body.queryText,
			TargetType: "DE",
			DataExtensionTarget: {
				Name: req.body.nameCustKey,
				CustomerKey: req.body.nameCustKey,
			},
			TargetUpdateType: "Overwrite",
			Client: {
				ID: req.session.fuel.mid
			},
			CategoryID: req.session.QueryFolderID
		},
		options: {}
	};

	this.create(parms, SoapClient, function(err, response) {
		
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0]);
		}
	});
};
ETHelper.prototype.query_execute = function(queryObjectID, callback) {

	var parms = {
		objectType: "QueryDefinition",
		props: {
			Action: "Start",
			Definitions: {
				Definition: {
					ObjectID: queryObjectID
				}
			}
		},
		options: {}
	};

	this.perform(parms, SoapClient, function(err, response){
		if (err) {
			callback(err, null);
		}
		else{
			callback(null, response[0].Result);
		}
	});
};
ETHelper.prototype.getByName = function(parms, SoapClient, callback) {
	SoapClient.retrieve(
		parms.objectType,
		parms.props,
		parms.options,
		function(err, response) {
			if (err) {
				// error here
				console.log(err);
				return;
			}
			callback(err, response.body.Results);
		}
	);
};
ETHelper.prototype.getByCustomerKey = function(parms, SoapClient, callback) {

	SoapClient.retrieve(
		parms.objectType,
		parms.props,
		parms.options,
		function(err, response) {
			if (err) {
				// error here
				console.log(err);
				return;
			}
			//console.log(JSON.stringify(response.body.Results)); 
			callback(err, response.body.Results);
		}
	);
};

//*********************** Iterface to standard ET SOAP Methods ****************************//

ETHelper.prototype.retrieve = function(parms, callback) {

	SoapClient.retrieve(parms.objectType,parms.props,parms.options,function(err, response) {
			if (err) {
				callback(err, null);
			}
			else{
				callback(null, response.body.Results);
			}
		}
	);
};
ETHelper.prototype.create = function(parms, SoapClient, callback) {
	SoapClient.create(parms.objectType,	parms.props, parms.options, function(err, response) {
			if (err) {
				callback(err, null);
			}
			else{
				callback(null, response.body.Results);
			}
		}
	);
};
ETHelper.prototype.delete = function(parms, SoapClient, callback) {
	SoapClient.delete(parms.objectType,	parms.props, parms.options, function(err, response) {
			if (err) {
				callback(err, null);
			}
			else{
				callback(null, response.body.Results);
			}
		}
	);
};
ETHelper.prototype.perform = function(parms, SoapClient, callback) {
	SoapClient.perform(
		parms.objectType,
		parms.props,
		parms.options,
		function(err, response) {
			if (err) {
				callback(err, null);
			}
			else{
				callback(null, response.body.Results);
			}
		}
	);
};

//******************** End Iterface to standard ET SOAP Methods ****************************//


module.exports = ETHelper;
