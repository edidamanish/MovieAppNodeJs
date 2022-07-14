const {
	USERNAME_ERROR,
	EMAIL_ERROR,
	PASSWORD_ERROR
} = require('../errors/auth-error-codes')
const { GENERIC_ERROR_CODE } = require('../errors/gen-error-codes')

const replaceKeyOfValidation = (message, newKey) => {
	const brokenArray = message.split('"')
	if (brokenArray?.length === 3) {
		return [newKey, brokenArray[2]].join('')
	}
	return message
}

const handleValidationError = (error, res) => {
	const errorData = {
		message: error.details[0].message
	}
	replaceKeyOfValidation(error.details[0].message)
	switch (error?.details[0]?.context?.key) {
		case 'username':
			return res.status(400).send({
				...errorData,
				code: USERNAME_ERROR,
				message: replaceKeyOfValidation(errorData.message, 'user name')
			})
		case 'email':
			return res.status(400).send({
				...errorData,
				code: EMAIL_ERROR,
				message: replaceKeyOfValidation(errorData.message, 'email id')
			})
		case 'password':
			return res.status(400).send({
				...errorData,
				code: PASSWORD_ERROR,
				message: replaceKeyOfValidation(errorData.message, 'password')
			})
		default:
			return res.status(400).send({
				...errorData,
				code: GENERIC_ERROR_CODE
			})
	}
}

module.exports.handleValidationError = handleValidationError
