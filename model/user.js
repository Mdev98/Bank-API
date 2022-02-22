const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required : [true, 'required field']
    },

    lastName : {
        type: String,
        required : [true, 'required field']
    },

    email: {
        type: String,
        required: [true, 'required field'],
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email',
        ],
    },

    password : {
        type: String,
        required : [true, 'Please add a password'],
        minlength : 6,
        select: false
    },

    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],

    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
  
// Sign JWT and return
UserSchema.methods.generateToken = async function () {
    const user = this;

    const token =  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });

    user.tokens = user.tokens.concat({ token });

    await user.save();

    return token;
};
  
// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);