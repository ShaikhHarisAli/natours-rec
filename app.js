const path = require('path');
const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression')

const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security 
// Set security headers with custom CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://127.0.0.1:3000"], // Replace with your API domain
        scriptSrc: ["'self'", "'unsafe-inline'", "http://127.0.0.1:3000","https://js.stripe.com"], // Replace as needed
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        frameSrc: ["'self'", "https://js.stripe.com"],
      },
    },
  })
);

// Enable CORS for frontend domain
app.use(
  cors({
    origin: 'http://127.0.0.1:3000', // Replace with your frontend domain
    credentials: true,
  })
);


app.options('*',cors())

// Development Logging
console.log("NODE ENV ==>", process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){   
    app.use(morgan('dev'))
}

// Limit request for same API
const limiter = rateLimit({
    max:100,
    windowMS:60*60*1000,
    message:"To many request from this IP,please try again in an hour"    
})

app.use('/api',limiter)

// Body Parser,reading data from the body into req.body
app.use(express.json({limit: '10kb'}))

app.use(cookieParser());


// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
      whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
      ]
    })
  );

app.use(compression())
// app.use((req,res,next) =>{
//     log("Hellow from the Middleware")
//     next();
// })


// Test Middleware
app.use((req,res,next) =>{
    req.requestTime = new Date().toISOString();
    console.log("Req URL ==>",req.url);
    next();
})
/// 2) Route Hanlders 
/// 3) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/bookings',bookingRouter)

app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`Can't find ${req.originalUrl} on this server`
    // })
    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail';
    // err.statusCode = 404;
    // next(err)

    next(new AppError(`Can't find ${req.originalUrl} on this server`,404))

})

app.use(globalErrorHandler)

/// 4) Start The Server
module.exports = app; 




