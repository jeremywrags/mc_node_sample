'use strict';


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

//********************************** Folder Helper Functions *******************************//
ETHelper.prototype.folder_retrieve = function(type, name, callback) {

	//Setup the DEFolder Lookup Filter
	var parms = {
		objectType: "DataFolder",
		props: ["Name", "ID", "ContentType", "ParentFolder.ID"],
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
	};

	//Look for the Folder
	this.retrieve(parms, SoapClient, function(err, response) {
		if (err) {
				console.log("ERROR: " + err.code + " (" + err.message + ")");
				return;
			}
			callback(null, response);
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
			AllowChildren: false,
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
				console.log("ERROR: " + err.code + " (" + err.message + ")");
				return;
			}
			callback(null, response);
	});
};

//**************************** Data Extension Helper Functions *****************************//

ETHelper.prototype.dataextension_create = function(fields, callback) {

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
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response[0]);
	});
};

ETHelper.prototype.dataextension_retrieveAll = function(callback) {
	
	var parms = {
		objectType: "dataextension",
		props: ["Name", "CustomerKey"],
		filter: "",
		options: {}
	};
	
	this.retrieve(parms, SoapClient, function(err, response) {
			if (err) {
				console.log("ERROR: " + err.code + " (" + err.message + ")");
				return;
			}
			callback(null, response);
	});
};

//**************************** Other Helper Functions *****************************//

ETHelper.prototype.field_retrieve = function(customerKey, callback) {
	var parms = {
		objectType: "DataExtensionField",
		props: ["Name", "CustomerKey"],
		filter: {
			leftOperand: 'DataExtension.CustomerKey',
			operator: 'equals',
			rightOperand:  customerKey
		}
	};	
		
	this.retrieve(parms, SoapClient, function(err, response) {
		if (err) {
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response);
	});
};

ETHelper.prototype.obj_exists = function(name, objType, callback) {
	var parms = {
		objectType: objType,
		props: ["Name"],
		filter: {
			leftOperand: {
				leftOperand: 'Name',
				operator: 'equals',
				rightOperand: name
			},
			operator: 'OR',
			rightOperand: {
				leftOperand: 'CustomerKey',
				operator: 'equals',
				rightOperand: name
			}
		},
		options: {}
	};	
		
	this.retrieve(parms, SoapClient, function(err, response) {
		if (err) {
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response);
	});
};

//**************************** Query Helper Functions *****************************//

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
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response[0]);
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
			console.log("ERROR: " + err.code + " (" + err.message + ")");
			return;
		}
		callback(null, response[0].Result);
	});
};

//******************************* Private Helper Functions *******************************//

ETHelper.prototype.retrieve = function(parms, SoapClient, callback) {

	SoapClient.retrieve(
		parms.objectType,
		parms.props,
		parms.filter,
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

ETHelper.prototype.create = function (parms, SoapClient, callback) {
	SoapClient.create(
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

ETHelper.prototype.perform = function (parms, SoapClient, callback) {
	SoapClient.perform(
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

module.exports = ETHelper;
