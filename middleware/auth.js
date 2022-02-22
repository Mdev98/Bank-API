const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../lib/errorResponse');
const User = require('../model/user');

// Protect Route

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    else if(req.cookies.token) {
        token = req.cookies.token;
    }

    if(!token){
        return next(new ErrorResponse('Not authorize, please authenticate', 401))
    }

    try{
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = await User.findOne({ _id : decoded.id, 'tokens.token' : token});

        next()
    }catch(e){
        next(new ErrorResponse(e.message , 401))
    }
})

