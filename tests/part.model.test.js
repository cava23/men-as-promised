'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose-q')(),
	User = mongoose.model('User'),
	Part = mongoose.model('Part');

/**
 * Globals
 */
var user, part;

/**
 * Unit tests
 */
describe('Part Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
            provider: 'local'
		});

		user.save(function() {
			part = new Part({
				title: 'My Widget',
				description: 'This Widget will have the highest quality yet!',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return part.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without title', function(done) {
			part.title = '';

			return part.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) {
		Part.remove().exec();
		User.remove().exec();
		done();
	});
});