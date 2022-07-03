const Joi = require('joi')

const registerValidation = data => {
	const schema = Joi.object({
		username: Joi.string().min(6).max(40).required(),
		email: Joi.string().max(255).min(1).required(),
		password: Joi.string().min(6).max(40).required()
	})
	return schema.validate(data)
}

const loginValidation = data => {
	const schema = Joi.object({
		username: Joi.string().min(6).max(40).required(),
		password: Joi.string().min(6).max(40).required()
	})
	return schema.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
