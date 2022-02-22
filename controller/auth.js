const ErrorResponse = require('../lib/errorResponse');
const asyncHandler = require('../middleware/async');
const Account = require('../model/account');
const User = require('../model/user');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password, 
  });

  linkAccountToUser(user.id);

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {

  // const user = req.user;
  // const userToken = req.headers.authorization.split(' ')[1];

  // user.tokens = user.tokens.filter((token)=>{
  //   return token.token !== userToken
  // });

  // await user.save();

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "You logout successfully"
  });
});

// @desc      Log user from all devise
// @route     GET /api/v1/auth/logoutall
// @access    Private
exports.logoutAll = asyncHandler(async (req, res, next) => {
  const user = req.user;

  user.tokens = [];

  user.save();

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message : "You logout from all devise"
  });
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // user is already available in req due to the protect middleware
  const user = req.user;
  const account = await Account.findOne({owner : user._id});

  const userObj = user.toObject();
  userObj.account = account;

  res.status(200).json({
    success: true,
    data: userObj,
  });
});

// Get the user ID create a account and link the user to the account

const linkAccountToUser = async (userId) => {
  const account = await Account.create({owner : userId});
  return account;
}

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Generate a token
  const token = await user.generateToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};