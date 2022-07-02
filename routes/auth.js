const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send("Email already exists");

    const userNameExist = await User.findOne({ username: req.body.username });
    if (userNameExist) return res.status(400).send("Username already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    res.send({ user: savedUser._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send("Username or password is wrong");

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
      return res.status(400).send("Username or password is wrong");

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    return res.header("auth-token", token).send(token);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
