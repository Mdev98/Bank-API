const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    balance : {
        type : Number,
        default : 0
    },
    lastOperation : [{
        operationName : {
            type: String,
        },
        transactionAmount : {
            type: Number,
        },
        from : {
            type:mongoose.Schema.ObjectId,
            ref: 'User',
        },
        to : {
            type:mongoose.Schema.ObjectId,
            ref: 'User',
        },
        date : {
            type: Date,
            default: Date.now,
        }
    }],
    owner : {
        type : mongoose.Schema.ObjectId,
        ref: 'User',
        required : true
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
});

AccountSchema.methods.logLastOperation = async function (operationName, transactionAmount, from, to) {
    const account = this;

    const operation = {
        operationName,
        transactionAmount,
        from : from ? from : undefined,
        to : to ? to : undefined
    }
    account.lastOperation = account.lastOperation.concat({ ...operation });

    await account.save();

    return operation;
};


module.exports = mongoose.model('Account', AccountSchema)