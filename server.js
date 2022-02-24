const express      = require('express');
const dotenv       = require('dotenv');
const connectDB    = require('./config/database');
const cookieParser = require('cookie-parser');
const morgan       = require('morgan');
const errorHandler = require('./middleware/error');
const url = require('url')

// Loads env variables 
dotenv.config({ path : './config/config.env' });

// Load database
connectDB()

// Add Queue

const addToQueue = (req, res, next) => {
    console.log(req.url);

    const action = req.url.split("/")[4]

    const reqArr = [];

    const filter = ['deposit', 'withdrawl', 'send'];
    if(filter.indexOf(action) > -1) {
        console.log("New One comming")
        reqArr.push(req);
    }

    req.queue = reqArr;
    next();
}

// Routes files
const authRoute = require('./route/auth');
const transactionRoute = require('./route/transaction');

// Initializing express app
const app = express();

app.use(express.json());

app.use(cookieParser());

if(process.env.NODE_ENV === 'developpement'){
    app.use(morgan('dev'));
};

// Mounting Route
app.use(addToQueue);

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/account', transactionRoute);

// Using middleware
app.use(errorHandler);

// Listening server
app.listen(process.env.PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`);
});
