# men-as-promised
A fork of MEAN.JS, but with the AngularJS front-end ripped out and promises instead of callbacks.

MEN (mongodb, expressjs, nodejs) as-promised is designed to be a good starting point for an enterprise-focused API. It's enterprise focused because the OAUTH stuff is gone and there is a concept of orgs with users who have access roles. It's "as-promised" because promises are used just about everywhere.

The /signup route creates an org and an admin user. That admin can then create other users with various roles to control API access.

Other features:
 - Automatically generated swagger-docs including hosting the ui at /api-docs
 - Design of service layer easily allows mocking of behavior even in integration tests, just override app.getServiceManager()
 - Abstraction layer around mongoose to decouple it
 - Some simple services for talking to S3, SES, and CloudWatch
 - Winston for logging

FYI, this uses my own forked version of Express. I made a change to better support promises, but my pull request was rejected because the feature was already planned for a later version of Express. I'll update this when that is released.
