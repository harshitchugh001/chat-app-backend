const User = require('../model/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const saltRounds = 10;

exports.signup = async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;
  console.log(req.body);

  try {
   
    const existingUser = await User.findOne({ email: userEmail });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

    const newUser = new User({
      username: userName,
      email: userEmail,
      password: hashedPassword,
      userid: Math.floor(10000000 + Math.random() * 90000000),
    });
    await newUser.save();

    return res.status(201).json({ message: 'Signup successful.' });
  } catch (error) {
    console.error('SIGNUP ERROR:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res.status(400).json({ error: 'User with that email does not exist. Please sign up.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Email and password do not match.' });
    }

    const payload = {
      _id: user._id,
      userId: user.userid,
      name: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      token,
      user: payload,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};