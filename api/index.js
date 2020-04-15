'use strict';

module.exports = (app) => {


	// Api Routes
	let login = require('./components/login/index');
	let register = require('./components/register/index');
	let logout = require('./components/logout/index');
	let dashboard = require('./components/dashboard/index');
	let verify = require('./components/session/index');
	let countyData = require('./components/countyData/index');
	//let settings = require('./components/settings/index');
	//let support = require('./components/support/index');

	// Edit Routes

	let editData = require('./components/edit/editData');


	// Add Routes
	let routes = [register, logout, login, verify, dashboard, editData/*,countyData, settings, support*/];

	app.use('/api', routes);
}
