const express = require('express')
const adminRoute = express()
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')

const multer = require("../multer/multer");

const validate = require('../middleware/adminAuth');
const session = require('express-session');
const cookieparser = require('cookie-parser')
const nocache = require('nocache')
adminRoute.use(nocache())
adminRoute.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

//view engine
adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

//Parsing

adminRoute.use(express.json())
adminRoute.use(express.urlencoded({extended:true}))
adminRoute.use(cookieparser())
adminRoute.get('*',validate.checkUser)

//home page
adminRoute.get('/',adminController.loadLogin)
adminRoute.post('/login',adminController.verifyLogin)
adminRoute.get('/dashboard',validate.requireAuth,adminController.loadDashboard)



adminRoute.get('/category',validate.requireAuth,categoryController.loadCategory)
adminRoute.get('/addCategory',validate.requireAuth,categoryController.loadAddCategory)

adminRoute.post('/addCategory',validate.requireAuth,categoryController.createCategory)
adminRoute.get('/unListCategory',validate.requireAuth,categoryController.unListCategory)
adminRoute.get('/reListCategory',validate.requireAuth,categoryController.reListCategory)
adminRoute.get('/editCategory',validate.requireAuth,categoryController.loadUpdateCategory)
adminRoute.post('/editCategory',validate.requireAuth,categoryController.updateCategory)


adminRoute.get('/users',validate.requireAuth,adminController.loadUsers)
adminRoute.get('/deleteUser',validate.requireAuth,adminController.deleteUser)
adminRoute.get('/blockUser',validate.requireAuth,adminController.blockUser)
adminRoute.get('/unBlockUser',validate.requireAuth,adminController.unBlockUser)


adminRoute.get('/editUser',validate.requireAuth,adminController.loadEditUser)
adminRoute.post('/editUser',adminController.updateUser)

adminRoute.get('/product',validate.requireAuth,productController.loadProducts) 
adminRoute.post('/addProduct',multer.upload,productController.createProduct)
adminRoute.get('/displayProduct',validate.requireAuth,productController.displayProduct)
adminRoute.get('/unListProduct',productController.unListProduct)
adminRoute.get('/reListProduct',productController.reListProduct)


adminRoute.get('/updateProduct',validate.requireAuth,productController.loadUpdateProduct)
adminRoute.post('/updateProduct',multer.upload,productController.updateProduct)


//order
adminRoute.get('/orderList',validate.requireAuth,adminController.orderList)

adminRoute.get('/orderDetails',validate.requireAuth,adminController.orderDetails)
adminRoute.put('/orderStatus',adminController.changeStatus)
adminRoute.put('/cancelOrder',adminController.cancelOrder)
adminRoute.put('/returnOrder',adminController.returnOrder)


adminRoute.get('/logout',adminController.logout)
module.exports = adminRoute