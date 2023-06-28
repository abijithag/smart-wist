const express = require('express')
const userRoute = express()
const userController = require('../controllers/userController')
const validate = require('../middleware/authMiddleware');
const block = require('../middleware/blockMiddleware');
const productController = require('../controllers/productController')
const profileController = require('../controllers/profileController')
const orderController = require('../controllers/orderController')

const cartController = require('../controllers/cartController')
const cookieparser = require('cookie-parser')
const nocache = require('nocache')
userRoute.use(nocache())
const session = require('express-session');

userRoute.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

//view engine
userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')

//Parsing

userRoute.use(express.json())
userRoute.use(express.urlencoded({extended:true}))
userRoute.use(cookieparser())

//home page
userRoute.all('*',validate.checkUser)

userRoute.get('/',userController.homeLoad)

//register
userRoute.get('/register',userController.loadRegister)
userRoute.post('/register',userController.insertUser)
userRoute.post('/verifyOtp',userController.verifyOtp)

//Login
userRoute.get('/login',userController.loginLoad)
userRoute.post('/login',userController.verifyLogin) 
userRoute.get('/logout',userController.logout)


//Resend OTP
userRoute.get('/resendOtp',userController.resendOTP)

//forgot Password

userRoute.get('/forgotPassword',userController.loadForgotPassword)
userRoute.post('/forgotPassword',userController.resetPasswordOtpVerify)
userRoute.post('/forgotPasswordOtp',userController.forgotPasswordOtp)

 
//SET New password in forgot password
userRoute.post('/setNewPassword',userController.setNewPassword)




userRoute.get('/shop',userController.displayProduct)
userRoute.get('/productPage',productController.productPage)


//cart
userRoute.get('/cart',validate.requireAuth,cartController.loadCart)
userRoute.post('/addToCart/:id',cartController.addToCart)

userRoute.put('/change-product-quantity',cartController.updateQuantity)
userRoute.delete(
  "/delete-product-cart",
  cartController.deleteProduct
);


//profile

userRoute.get('/profile',block.checkBlocked,validate.requireAuth,profileController.profile)
userRoute.post('/submitAddress',profileController.submitAddress)
userRoute.post('/updateAddress',profileController.editAddress)

//checkout
userRoute.get('/checkOut',orderController.checkOut)




module.exports = userRoute