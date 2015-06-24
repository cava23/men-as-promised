'use strict';

module.exports = {
	app: {
		title: 'My Enterprise App - Local Environment'
	},
	db: 'mongodb://localhost/example-dev',
	aws: {
		"files-bucket": "example-files-local",
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
