const router = require('express').Router()
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
	EMAIL_ERROR,
	USERNAME_ERROR,
	PASSWORD_ERROR
} = require('../errors/auth-error-codes')
const { GENERIC_ERROR_MESSAGE } = require('../errors/gen-errors-messages')
const { GENERIC_ERROR_CODE } = require('../errors/gen-error-codes')
const {
	handleValidationError
} = require('../error-handling/auth-error-handling')

const { registerValidation, loginValidation } = require('../validation')

router.post('/register', async (req, res) => {
	const { error } = registerValidation(req.body)
	if (error) {
		return handleValidationError(error, res)
	}

	try {
		const emailExist = await User.findOne({ email: req.body.email })
		if (emailExist)
			return res.status(400).send({
				code: EMAIL_ERROR,
				message: 'email already exists'
			})

		const userNameExist = await User.findOne({
			username: req.body.username
		})
		if (userNameExist)
			return res.status(400).send({
				code: USERNAME_ERROR,
				message: 'username already exist'
			})

		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(req.body.password, salt)

		const user = new User({
			username: req.body.username,
			email: req.body.email,
			password: hashedPassword
		})

		const savedUser = await user.save()
		const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET)

		return res.send({ username: user.username, authToken: token })
	} catch (err) {
		return res.status(400).send({
			message: GENERIC_ERROR_MESSAGE,
			code: err?.code ?? GENERIC_ERROR_CODE
		})
	}
})

router.post('/login', async (req, res) => {
	const { error } = loginValidation(req.body)
	if (error) {
		return handleValidationError(error, res)
	}

	try {
		const user = await User.findOne({ username: req.body.username })
		if (!user)
			return res.status(400).send({
				code: USERNAME_ERROR,
				message: 'username is incorrect'
			})

		const validPass = await bcrypt.compare(req.body.password, user.password)
		if (!validPass)
			return res.status(400).send({
				code: PASSWORD_ERROR,
				message: 'password is incorrect'
			})

		const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
		return res.send({ username: user.username, authToken: token })
	} catch (err) {
		return res.status(400).send({
			message: GENERIC_ERROR_MESSAGE,
			code: err?.code ?? GENERIC_ERROR_CODE
		})
	}
})

module.exports = router
