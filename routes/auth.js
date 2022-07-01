const router = require("express").Router();
const User = require("../model/User");

router.post("/register", async (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.send(400).send(err);
  }
});

router.post("/login");

module.exports = router;
