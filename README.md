# men-as-promised
A fork of MEAN.JS, but with the AngularJS front-end ripped out and promises instead of callbacks.

MEN (mongodb, expressjs, nodejs) as-promised is designed to be a good starting point for an enterprise-focused API. It's enterprise focused because the OAUTH stuff is gone and there is a concept of orgs with users who have access roles. It's "as-promised" because promises are used just about everywhere.

The /signup route creates an org and an admin user. That admin can then create other users with various roles to control API access.

Other features:
 - Automatically generated swagger-docs including hosting the ui at /api-docs
 - Design of service layer provides more testing flexibility. You can unit test services that don't have public API routes and, even in integration tests, mock other services.
 - Abstraction layer around mongoose to decouple it
 - General error classes for common API failures
 - Some simple services for talking to S3, SES, and CloudWatch
 - Winston for logging

Planned improvements:
 - Better use of inheritance such as a BaseService and BaseController class
 - Further decouple from mongoose part 1. A couple methods in the db.service are shortcuts that should be replaced by a more general method.
 - Further decouple from mongoose part 2. I’m considering rolling my own JSON validation using “standard” JSON-Schema instead of mongoose’s.
 - Don’t glob route files. Adding routes before the core route file is loaded can have unintended results and that’s dumb.
 - I’d kind of like to move to TypeScript so that contracts are a bit more clear
 - Add models to the generated swagger-docs
 - Improve logger using continuation-passing style

FYI, this uses my own forked version of Express. I made a change to better support promises, but my pull request was rejected because the feature was already planned for a later version of Express. I'll update this when that is released.
