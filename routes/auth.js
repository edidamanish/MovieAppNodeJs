const router = require('express').Router()
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
	EMAIL_ALREADY_EXISTS,
	USERNAME_ALREADY_EXISTS,
	INCORRECT_USERNAME,
	INCORRECT_PASSWORD,
	GENERIC_ERROR_MESSAGE,
	GENERIC_ERROR_CODE
} = require('../errors/authErrors')
const { registerValidation, loginValidation } = require('../validation')

router.post('/register', async (req, res) => {
	const { error } = registerValidation(req.body)
	if (error) return res.status(400).send(error.details[0].message)

	try {
		const emailExist = await User.findOne({ email: req.body.email })
		if (emailExist) return res.status(400).send(EMAIL_ALREADY_EXISTS)

		const userNameExist = await User.findOne({
			username: req.body.username
		})
		if (userNameExist) return res.status(400).send(USERNAME_ALREADY_EXISTS)

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
	if (error) return res.status(400).send(error.details[0].message)

	try {
		const user = await User.findOne({ username: req.body.username })
		if (!user) return res.status(400).send(INCORRECT_USERNAME)

		const validPass = await bcrypt.compare(req.body.password, user.password)
		if (!validPass) return res.status(400).send(INCORRECT_PASSWORD)

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
