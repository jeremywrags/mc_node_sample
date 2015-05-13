requirejs.config({
	baseUrl: '.',
	paths: {
		// APP PATHS
		routing: 'js/routing',
		// VENDOR PATHS (just to show you exactly what we have set up)
		backbone: '../bower_components/backbone/backbone',
		underscore: '../bower_components/underscore/underscore',
		jquery: '../bower_components/jquery/jquery',
		json2: '../bower_components/json2/json2'
	},
	deps: [ 'js/app' ],
	shim: {
		'backbone': {
			deps: [ 'underscore', 'jquery', 'json2' ],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'jquery': {
			exports: '$'
		}
	}
});
