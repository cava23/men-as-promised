'use strict';

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	var output;

	try {
		var fieldName = err.message.substring(err.message.lastIndexOf('.$') + 2, err.message.lastIndexOf('_1'));
		output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch (ex) {
		output = 'Unique field already exists';
	}

	return output;
};

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = getUniqueErrorMessage(err);
				break;
			default:
				message = 'Something went wrong';
		}
	} else if (err.errors) {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	} else if (err.message) {
        message = err.message;
    }

	return message;
};

exports.returnError = function(res, err) {
    if (err.statusCode) {
        res.status(err.statusCode).json(err);
    } else if (err.status) {
        res.status(err.status).json(err);
    } else {
        res.status(500).json({
            ok: false,
            statusCode:500,
            message: "Internal Server Error"
        });
    }
};

/* jshint ignore:start */

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var ServiceError = (function (_super) {
    __extends(ServiceError, _super);
    function ServiceError(statusCode, message, data) {
        _super.call(this, message);
        this.name = 'ServiceError';
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
    }
    return ServiceError;
})(Error);
exports.ServiceError = ServiceError;

exports.NotFoundError = (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message, data) {
        _super.call(this, 404, message, data);
        this.name = 'NotFoundError';
    }
    return NotFoundError;
})(ServiceError);

exports.BadRequestError = (function (_super) {
    __extends(BadRequestError, _super);
    function BadRequestError(message, data) {
        _super.call(this, 400, message, data);
        this.name = 'BadRequestError';
    }
    return BadRequestError;
})(ServiceError);

exports.RequestTimeoutError = (function (_super) {
    __extends(RequestTimeoutError, _super);
    function RequestTimeoutError(message, data) {
        _super.call(this, 408, message, data);
        this.name = 'RequestTimeoutError';
    }
    return RequestTimeoutError;
})(ServiceError);

exports.NotAuthorizedError = (function (_super) {
    __extends(NotAuthorizedError, _super);
    function NotAuthorizedError(message, data) {
        _super.call(this, 403, message, data);
        this.name = 'NotAuthorizedError';
    }
    return NotAuthorizedError;
})(ServiceError);

exports.NotLoggedInError = (function (_super) {
    __extends(NotLoggedInError, _super);
    function NotLoggedInError(message, data) {
        _super.call(this, 401, message, data);
        this.name = 'NotLoggedInError';
    }
    return NotLoggedInError;
})(ServiceError);

/* jshint ignore:end */
