# men-as-promised
A fork of MEAN.JS, but without any AngularJS front-end and a lean towards using promises

MEN (mongodb, expressjs, nodejs) as-promised is designed to be a good starting point for an enterprise-focused API. It's enterprise focused because the OAUTH stuff hasn't been tested and there is a concept of orgs with users who have access roles. It's "as-promised" because promises are used just about everywhere.

The /signup route creates an org and an admin user. That admin can then create other users with various roles to control API access.

Other features:
 - Automatically generated swagger-docs
 - Design of service layer easily allows mocking of behavior even in integration tests
 - Winston for logging
 - Abstraction layer around mongoose to decouple it
 - Some simple services for talking to S3, SES, and CloudWatch
