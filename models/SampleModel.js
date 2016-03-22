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

function SampleModel() {

}

SampleModel.prototype.Sample  = function(req, callback) { 
	etHelper.init(req); 
	
	async.parallel([
    function GetFolders(callback) { 
        etHelper.Folder_RetrieveByType("dataextension", function(err, response) {
            if (err) {
				callback(err, null);
			}
			else{
				callback(null, response);
			}
        });
    },
    function GetObjects(callback) { 
        etHelper.DataExtension_RetrieveAll(function(err, response) {
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

module.exports = SampleModel;