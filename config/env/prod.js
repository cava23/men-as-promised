'use strict';

module.exports = {
	app: {
		title: 'My Enterprise App - Prod Environment'
	},
	db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/example',
	aws: {
		"files-bucket": "example-files-prod",
		"access-key-id": "YOUR ACCESS KEY ID",
		"secret-access-key": "YOUR SECRET ACCESS KEY",
		"region": "us-east-1",
		"timeout": 60000
	},
	mailer: {
		from: process.env.MAILER_FROM || 'no-reply@example.io',
		options: {
			auth: {
				accessKeyId: process.env.MAILER_EMAIL_ID || 'YOUR SES ID',
				secretAccessKey: process.env.MAILER_PASSWORD || 'YOUR SES PASSWORD'
			}
		},
		sendOrgCreationNotice: false,
		exampleTeam: 'hello@example.io, hello1@example.io, hello2@example.io'
	}
};
