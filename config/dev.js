module.exports = {
	ui: {
		publicDir: '/public'
	},
	fuelConfigs: {
		// there should be one entry per config file, except for production which should have all the stack keys
		// create other config files in this directory that have the same name as your NODE_ENV variable. They will overwrite these settings.
		// this is what you'll use for testing
		/*S1: {
			appId: '156d90b9-2ced-475e-9591-00a49ab87e48',
			clientId: 'vzb9v4vvzwxk8ua367f9m6xp',
			clientSecret: 'qABDESGcyQ6yk3p9SakVytQW',
			appSignature: 'z1kqnt1in1boeedyqhfo0erpbdugp00bbsry4uotu5gfhy1rwbq0lhyygntytup45t0iosfe04uqm0vnvk5nyp15040350wj0wwjxqjetvc320sxiox4r1ovauwypxlnxpnq52kclbngpm0zgvgheiu1amw0rm4nh4oehfqjn4uamlwlxwtuurkww1ext5xckuiabxwqm3nd1htfxw0qh3p0u3cemos3r0sr5l4eumrp4l4emsoxsskk1cbi5ft',
			authUrl: 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1',
			legacyRestHost: 'rest.exacttarget.com',
			fuelapiRestHost: 'www.exacttargetapis.com',
			baseUrl: 'mc.exacttarget.com/rest/',
			soapEndpoint: 'https://webservice.exacttarget.com/Service.asmx', 
		}*/
		S1: {
			appId: '156d90b9-2ced-475e-9591-00a49ab87e48',
			clientId: 'vzb9v4vvzwxk8ua367f9m6xp',
			clientSecret: 'qABDESGcyQ6yk3p9SakVytQW',
			appSignature: 'z1kqnt1in1boeedyqhfo0erpbdugp00bbsry4uotu5gfhy1rwbq0lhyygntytup45t0iosfe04uqm0vnvk5nyp15040350wj0wwjxqjetvc320sxiox4r1ovauwypxlnxpnq52kclbngpm0zgvgheiu1amw0rm4nh4oehfqjn4uamlwlxwtuurkww1ext5xckuiabxwqm3nd1htfxw0qh3p0u3cemos3r0sr5l4eumrp4l4emsoxsskk1cbi5ft',
			authUrl: 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1',
			legacyRestHost: 'rest.exacttarget.com',
			fuelapiRestHost: 'www.exacttargetapis.com',
			baseUrl: 'mc.exacttarget.com/rest/',
			soapEndpoint: 'https://webservice.exacttarget.com/Service.asmx', 
		}
	},
	/*
	Uncomment this if you are working locally
	sslOptions: {
		port: 5000,
		key_file: "config/ssl/mc-local.key",
		cert_file: "config/ssl/mc-local.crt"
	},*/ 
	appOptions: {
		folderName: "SQLHelper",
		appVersion: "DEV"
	}
};
