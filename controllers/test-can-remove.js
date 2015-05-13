'use strict';

module.exports = function( server ) {
	server.get( '/throw-err', function() {
		throw new Error();
	});
};