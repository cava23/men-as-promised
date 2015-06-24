'use strict';

module.exports = {
    app: {
        title: 'My Enterprise App - Dev Environment'
    },
    db: process.env.DB_1_PORT_27017_TCP_ADDR,
    aws: {
        "files-bucket": "example-files-dev",
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
        sendOrgCreationNotice: true,
        exampleTeam: 'hello@example.io, hello1@example.io, hello2@example.io'
    }
};
