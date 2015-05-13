define( function( require ) {
	'use strict';

	var Backbone = require( 'backbone' );

	var controller = require( 'routing/controller' ); // fake controller
	var router = require( 'routing/router' ); // fake router

	var TestView = Backbone.View.extend({
		initialize: function() {
			// putting this here because I have to use them for jshint to pass, and this is a example thing
			// they serve no other purpose
			this.controller = controller;
			this.router = router;
		},
		render: function() {
			this.$el.html( 'Boom Backbone Rendered Hello World' );
		}
	});

	var displayView = new TestView({ 'el': '#index-entry' });

	displayView.render();
});