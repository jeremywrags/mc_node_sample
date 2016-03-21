module.exports = {
	port: 5000,
	ui: {
		publicDir: '/public',
		staticBase: '/',
		bowerBase: '/bower_components'
	},
	redis: {
		useVCAP: true,
		host: '127.0.0.1',
		port: 6379
	},
	mongo: {
		useVCAP: true,
		host: '127.0.0.1',
		port: 27017,
		dbname: 'samplenodeapp-db' // this db will be created if it's not there already. Good thing? Depends on what you're doing
	},

	// Fuel configs, one per stack keyed on the FUEL.StackKey (found in ConfigSettings)
	fuelConfigs: {
		// there should be one entry per config file, except for production which should have all the stack keys
		// create other config files in this directory that have the same name as your NODE_ENV variable. They will overwrite these settings.
		// this is what you'll use for testing
		S1: {
			appId: '8eff56b4-7261-49bf-a80d-1efd74df9fe5',
			clientId: 'k4hrstu3e8johoj635dlibev',
			clientSecret: 'KeTxzk2ujF8hvdbySQo9IfFZ',
			appSignature: 'dxxqctyzftm1yaopcweq4wmugwj5saydhuevf5rqzeakf0e1yyueek5ns5hi4qyxh05ehhzbubhamlluti50ats3jzo21x3i5mxxm3cgoj05j3pqruguqeskqmonst23pazd2l4ubeofyi0mgocla4z0aczpva2saftad2cc2wbnzpfsldjklal0440i5tiroqcb4gr5yix0pdex0ytproyjq4dxeupvsh2xkvuai3tss1opswpxctxpxiofkff',
			authUrl: 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1',
			legacyRestHost: 'rest.exacttarget.com',
			fuelapiRestHost: 'www.exacttargetapis.com',
			baseUrl: 'mc.exacttarget.com/rest/',
			soapEndpoint: 'https://webservice.exacttarget.com/Service.asmx', 
		},
		S4: {
			appId: '08726dfa-e51f-421f-a46a-b19ad2d0069d',
			clientId: 'ft2gp2mpbbcq3je2756bdy7h',
			clientSecret: 'yBZCbqmGXxnuFQthaJMvawYa',
			appSignature: 'bttqjr4awqkc1oszlpmnpqoqz4vcfvlnmaw24ksdpsk0uytajuoeumyx4jvxhmsmlbm5tgor4aliecxqqg0voldntlb1zb33dg31rnl0hqja1xle2qr1rsrt0osokqmdbzmws0z24fqqd2q5hlbcx0kar1riys41tlaczj03ev001qzujrrf0z4gtzencgvuimp1oe1lcjycdx3dajqospesiklrkbus1q0ds1z5bm2nqie4dkbu5q4mcyphyyn',
			authUrl: 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1',
			legacyRestHost: 'rest.s4.exacttarget.com',
			fuelapiRestHost: 'www.exacttargetapis.com',
			baseUrl: 'mc.exacttarget.com/rest/',
			soapEndpoint: 'https://webservice.s4.exacttarget.com/Service.asmx', 
		}
	},
	appOptions: {
		folderName: "SQLHelper",
		appVersion: "PROD"
	},
	csrfFreeRoutes: {
		'/login': true
	},
	deepLinkWhitelist: [
	]
};
