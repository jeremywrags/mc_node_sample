'use strict';

var config = require('config');
var async = require('async');

var _ = require('underscore');

var FuelSoap = require('fuel-soap');
var SoapClient;
var etHelper = require(__dirname + '/../models/ETHelper.js');



var errorHandler = require('et-express-error-handlers');

module.exports = {
	setAuthOptions: function(req) {
		SoapClient = new FuelSoap(getAuthOptions(req));
	},
	test: function(name, req, callback) {
		
		var out = new Object();
		out.Status = "Test Worked";
		out.DEFolderID = 123456;
		out.QueryFolderID = 654321;
		
		async.series([
		    function(next){
		    	findFolder("dataextension", name + "_Test", next);	
		    },function(next){
		    	findFolder("queryactivity", name, next);	
		    }
		],
		// optional callback
		function(err, results){
		    // the results array will equal ['one','two'] even though
		    console.log(results)
		});
		
		
	},
	checkInstall: function(name, req, callback) {
		
		var response = new Object();
		var deDone =  false;
		var qDone = false;
		/*
		 *********************************************************************************************************
		 * 
		 * This function will look for the SQLHelper folders. If they are not found they will be added
		 *
		 *********************************************************************************************************
		*/

		//Setup the DEFolder Lookup Filter
		var deFolderParms = {
			objectType: "DataFolder",
			props: ["Name", "ID", "ContentType"],
			filter: {
				leftOperand: {
					leftOperand: 'Name',
					operator: 'equals',
					rightOperand: name
				},
				operator: 'AND',
				rightOperand: 
				{
					leftOperand: 'ContentType',
					operator: 'equals',
					rightOperand: "dataextension"
				}
			}
		};

		//Look for the Folder
		etHelper.getByName(deFolderParms, SoapClient, function(err, deFolderResponse){
			//console.log(deFolderResponse);
			if(deFolderResponse.length <=0)
			{
				//Folder Does not exist so create it
				//But first we need the Parent Folder
				
				
				var deParentFolderParms = {
					objectType: "DataFolder",
					props: ["Name", "ID", "ContentType"],
					filter: {
						leftOperand: {
							leftOperand: 'Name',
							operator: 'equals',
							rightOperand: "Data Extensions"
						},
						operator: 'AND',
						rightOperand: 
						{
							leftOperand: 'ContentType',
							operator: 'equals',
							rightOperand: "dataextension"
						}
					}
				};
				etHelper.getByName(deParentFolderParms, SoapClient, function(err, deParentFolderResponse){
					//console.log(deParentFolderResponse);
					if(deParentFolderResponse.length > 0){
						var newFolderParms = {
							objectType: "DataFolder", 
							props: {
								Name: name,
								CustomerKey: name,
								Description: "This folder is only to be used by the SQL Helper Application", 
								ContentType: "dataextension", 
								IsActive: true, 
								IsEditable: true,
								AllowChildren: false,
								ParentFolder:{
									ID: deParentFolderResponse[0].ID	
								},
								Client:{
									ID: req.session.fuel.mid
								}
							},
							options: {}
						};
				
						etHelper.create(newFolderParms, SoapClient, function(err, newFolderResponse){
							//console.log(newFolderResponse);
							if(newFolderResponse.length > 0){
								deDone = true;
								response.DEFolderID = newFolderResponse[0].NewID;
								response.Status = true;
								if(qDone)
								{
									callback(response);
								}
							}
							else{
								response.Status = false;
								callback(response);
							}
							
						});
					}
					else
					{
						response.Status = false;
						callback(response);
					}
				});
			}	
			else
			{
				deDone = true;
				response.DEFolderID = deFolderResponse[0].ID;
				response.Status = true;
				if(qDone)
				{
					callback(response);
				}
			}
		});
						
		
		//Setup the DEFolder Lookup Filter
		var qFolderParms = {
			objectType: "DataFolder",
			props: ["Name", "ID", "ContentType"],
			filter: {
				leftOperand: {
					leftOperand: 'Name',
					operator: 'equals',
					rightOperand: name
				},
				operator: 'AND',
				rightOperand: 
				{
					leftOperand: 'ContentType',
					operator: 'equals',
					rightOperand: "queryactivity"
				}
			}
		};

		//Look for the Folder
		etHelper.getByName(qFolderParms, SoapClient, function(err, qFolderResponse){
			//console.log(qFolderResponse);
			if(qFolderResponse.length <=0)
			{
				//Folder Does not exist so create it
				//But first we need the Parent Folder
				
				
				var qParentFolderParms = {
					objectType: "DataFolder",
					props: ["Name", "ID", "ContentType"],
					filter: {
						leftOperand: {
							leftOperand: 'Name',
							operator: 'equals',
							rightOperand: "Query"
						},
						operator: 'AND',
						rightOperand: 
						{
							leftOperand: 'ContentType',
							operator: 'equals',
							rightOperand: "queryactivity"
						}
					}
				};
				etHelper.getByName(qParentFolderParms, SoapClient, function(err, qParentFolderResponse){
					//console.log(qParentFolderResponse);
					if(qParentFolderResponse.length > 0){
						var qnewFolderParms = {
							objectType: "DataFolder", 
							props: {
								Name: name,
								CustomerKey: name,
								Description: "This folder is only to be used by the SQL Helper Application", 
								ContentType: "queryactivity", 
								IsActive: true, 
								IsEditable: true,
								AllowChildren: false,
								ParentFolder:{
									ID: qParentFolderResponse[0].ID	
								},
								Client:{
									ID: req.session.fuel.mid
								}
							},
							options: {}
						};
				
						etHelper.create(qnewFolderParms, SoapClient, function(err, qnewFolderResponse){
							//console.log(qnewFolderResponse);
							if(qnewFolderResponse.length > 0){
								qDone = true;
								response.QueryFolderID = qnewFolderResponse[0].NewID;
								response.Status = true;
								if(deDone)
								{
									callback(response);
								}
							}
							else{
								response.Status = false;
								callback(response);
							}
							
						});
					}
					else
					{
						response.Status = false;
						callback(response);
					}
				});
			}	
			else
			{
				qDone = true;
				response.QueryFolderID = qFolderResponse[0].ID;
				response.Status = true;
				if(deDone)
				{
					callback(response);
				}
			}
		});
	}, 
	createQuery: function(req, callback){

		var resp;

		//req.body.emailName
		
		//1. Assume the Folders are in place
		//2. Parse the SQL to get the list of fields 
		//3. Build the De that will hold the results
		//4. Create the query
		//5. Execute the query
		//6. Poll the DE for the final row
		//7. Retrieve the results

		var fields = parseSQL(req.body.queryText)

		var deParms = {
			objectType: "DataExtension", 
			props: {
				Name: req.body.nameCustKey,
				CustomerKey: req.body.nameCustKey,
				Description: req.body.description, 
				IsSendable: false, 
				IsTestable: false, 
				Fields: { Field: fields },
				Client:{
					ID: req.session.fuel.mid
				}
			},
			options: {}
		};

		etHelper.create(deParms, SoapClient, function(err, deResponse)
		{
			resp = resp + "DE Create Response" + JSON.stringify(deResponse);
			//console.log("DE Create Result: " + deResponse);
			if(deResponse[0].StatusCode == "OK")
			{
				var queryParms = 
				{
					objectType: "QueryDefinition", 
					props: 
					{
						Name: req.body.nameCustKey,
						CustomerKey: req.body.nameCustKey,
						Description: req.body.description, 
						QueryText: req.body.queryText, 
						TargetType: "DE",
						DataExtensionTarget: 
						{
							Name: req.body.nameCustKey,
							CustomerKey: req.body.nameCustKey,
						},
						TargetUpdateType: "Overwrite",						
						Client:
						{
							ID: req.session.fuel.mid
						}
					},
					options: {}
				};


				etHelper.create(queryParms, SoapClient, function(err, qResponse)
				{
					resp = resp + "Query Create Response" + JSON.stringify(qResponse);
					//console.log("Query Create Result: " + qResponse);
					if(qResponse[0].StatusCode == "OK")
					{
						var performParms = 
						{
							objectType: "QueryDefinition", 
							props: {
								Action: "Start", 
								Definitions: 
								{
									Definition :
									{
										ObjectID: qResponse[0].NewObjectID
									}
								}
							},
							options: { }
						};

						etHelper.perform(performParms, SoapClient, function(err, pResponse)
						{
							resp = resp + "Perform Create Response" + JSON.stringify(qResponse);							
						});
					}		
					else
					{
						//Write Code to delete the Data Extension
						//etHelper.delete(del, SoapClient, function(err, qResponse){
						//});
						
					}
				});		

			}					
		});		
		callback(resp);				
	}
};

function parseSQL(query){

	query = query.replace("distinct", "").toLowerCase();
    var fields = query.substring(query.indexOf("Select") + 7, query.indexOf("from")).split(",");    
    var outFields = [];
   
    
    for(var i = 0; i < fields.length; i++)
    {
        var f =  
       	{ 
            Description: "", 
            IsRequired: false, 
            IsPrimaryKeyField: false, 
            FieldType: "Text", 
            DeafultValue: "",         
       	};        
        
        if(fields[i].indexOf("as") > 0 )
        {
            f.Name = fields[i].substring(fields[i].indexOf("as") + 3).trim();
            outFields.push(f);
        }
        else if(fields[i].indexOf(".") > 0)
        {
            f.Name = fields[i].substring(fields[i].indexOf(".") + 1).trim();
            outFields.push(f);
        }
        else
        {
            f.Name = fields[i].trim();
            outFields.push(f);
        }                              
        
    }

    return outFields;
}

function getAuthOptions(req) {
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
	return options;
};

