const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
    getAccount,
    makeDeposit,
    makeWithdrawl,
    sendMoney
} = require('../controller/transaction');

router.get('/info', protect, getAccount);
router.post('/deposit', protect, makeDeposit);
router.post('/withdrawl', protect, makeWithdrawl);
router.post('/send', protect, sendMoney);

module.exports = router;