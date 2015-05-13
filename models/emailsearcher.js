'use strict';

var config = require( 'config' ); 
var _      = require( 'underscore' );

var FuelSoap = require( 'fuel-soap' );
var SoapClient;


var errorHandler = require( 'et-express-error-handlers' );

module.exports = {
  setAuthOptions:  function(options) {
	SoapClient = new FuelSoap( options );
  },
  getEmailFolderID: function(name,callback) {
    var filter = {
			leftOperand: 'Name',
			operator: 'equals',
			rightOperand:  name
		};

		SoapClient.retrieve(
			'Email',
			["CategoryID"],
			filter,
			function( err, response ) {
				if ( err ) {
					// error here
					console.log(err);
					return;
				}
				// response.body === parsed soap response (JSON)
				// response.res === full response from request client
				callback(response.body.Results);
			}
		);
  },getFolderName: function(ID,callback) {
    var filter = {
			leftOperand: 'ID',
			operator: 'equals',
			rightOperand:  ID
		};

		SoapClient.retrieve(
			'DataFolder',
			["Name"],
			filter,
			function( err, response ) {
				if ( err ) {
					// error here
					console.log(err);
					return;
				}
				// response.body === parsed soap response (JSON)
				// response.res === full response from request client
				callback(response.body.Results[0].Name);
			}
		);
  }


};
