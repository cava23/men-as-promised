'use strict';

module.exports = {
	app: {
		title: 'My Enterprise App - Test Environment'
	},
	db: 'mongodb://localhost/example-test',
	port: 3001,
	aws: {
		"files-bucket": "example-files-test",
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
		exampleTeam: 'success@simulator.amazonses.com'
	}
};