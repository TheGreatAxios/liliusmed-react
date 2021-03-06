'use strict';

const mongoose = require('mongoose');
const config = require('../config/api_config');

let db;

if (config.app.type == 'production') {
	db = config.mongoTicket.productionUri;
} else {
	db = config.mongoTicket.devUri;
}
mongoose.connect(db, { useCreateIndex: true, useNewUrlParser: true }, (err, database) => {
	if (err) {
		throw {
			status: 500,
			message: `Mongoose Connect Err: ${err}`
		}
	} else {
		let tickets = database.collection.tickets;
	}
});

module.exports = mongoose;