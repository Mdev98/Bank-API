const Account = require('../model/account');
const ErrorResponse = require('../lib/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get Account 
// @route     Get /api/v1/account/balance
// @access    Private
exports.getAccount = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const account = await Account.findOne({owner : user._id});


    res.status(200).json({
        success: true,
        data : account
    })
});


// @desc      Deposit 
// @route     POST /api/v1/account/deposit
// @access    Private
exports.makeDeposit = asyncHandler(async (req, res, next) => {
    const from = typeof(req.body.from) == 'string' ? req.body.from : false;
    const amount = typeof(req.body.amount) == 'number' && req.body.amount > 1 ? req.body.amount : false;
    const user = req.user;
    const account = await Account.findOne({owner : user._id});

    if(!amount){
        return next(new ErrorResponse("Please enter a correct amount", 400))
    }

    account.balance += amount;
    account.logLastOperation("Deposit", amount, from);

    res.status(200).json({
        success: true,
        data : account
    })
});

// @desc      withdrawl 
// @route     POST /api/v1/account/withdrawl
// @access    Private
exports.makeWithdrawl = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const account = await Account.findOne({owner : user._id});

    const from = typeof(req.body.from) == 'string' ? req.body.from : false;
    const amount = typeof(req.body.amount) == 'number' && req.body.amount < account.balance ? req.body.amount : false;

    if(!amount){
        return next(new ErrorResponse("Amount greater than account balance", 400))
    }


    account.balance -= amount;
    account.logLastOperation("Withdrawl", amount, from);

    res.status(200).json({
        success: true,
        data : account
    })
});

// @desc      Send Money 
// @route     POST /api/v1/account/send
// @access    Private
exports.sendMoney = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const senderAccount = await Account.findOne({owner : user._id});

    const receiverId = typeof(req.body.receiver) == 'string' ? req.body.receiver : false;
    const amount = typeof(req.body.amount) == 'number' && req.body.amount < senderAccount.balance ? req.body.amount : false;

    
    if(!receiverId) {
        return next(new ErrorResponse("Please fill correctly required field"))
    }

    if(!amount){
        return next(new ErrorResponse("Amount greater than account balance", 400))
    }

    const receiverAccount = await Account.findOne({owner : receiverId});

    if(!receiverAccount){
        return next(new ErrorResponse("Account not found", 404));
    }


    senderAccount.balance -= amount;
    receiverAccount.balance += amount;

    receiverAccount.logLastOperation("Receive", amount, user._id, undefined)
    senderAccount.logLastOperation("Send", amount, undefined, receiverId);

    res.status(200).json({
        success: true,
        data : senderAccount
    })
});

