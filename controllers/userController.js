const User = require('../models/userModel')
const Product = require('../models/productModel')
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Module to Load environment variables from .env file
const userHelper = require('../helpers/userHelper')
const otpHelper = require('../helpers/otpHelper')


const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: maxAge
  });
};




const bcrypt = require('bcrypt')

const securePassword = async(password)=>{
    try {
        
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}
const homeLoad = async(req,res)=>{
    try {        
        res.render("home",{user:res.locals.user})
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message)
    }
}
const insertUser = async(req,res)=>{
    const email = req.body.email;
    const mobileNumber = req.body.mno
    const existingUser = await User.findOne({email:email})
    if (!req.body.fname || req.body.fname.trim().length === 0) {
        return res.render("register", { message: "Name is required" });
    }
    if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
        return res.render("register", { message: "Name should not contain numbers" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
        return res.render("register", { message: "Email Not Valid" });
    }
    if(existingUser){
      return res.render("register",{message:"Email already exists"})
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mobileNumber)) {
        return res.render("register", { message: "Mobile Number should have 10 digit" });

    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(req.body.password)){
        return res.render("register", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
    }

    if(req.body.password!=req.body.confpassword){
        return res.render("register", { message: "Password and Confirm Password must be same" });
    }

    const otp = otpHelper.generateOtp()
    // await otpHelper.sendOtp(mobileNumber,otp)
      console.log(`Otp is ${otp}`)
    try {
        req.session.otp = otp;
        req.session.userData = req.body;
        req.session.mobile = mobileNumber 
        res.render('verifyOtp')     
    } catch (error) {
        console.log(error.message); 
    }
}
const loginLoad = async(req,res)=>{
    try {
        if(res.locals.user!=null){
            res.redirect('/')
        }else{
            res.render('login')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    const data = req.body; // Assuming the request body contains the login data
  
    const result = await userHelper.verifyLogin(data);
    if (result.error) {
      res.render('login', { message: result.error });
    } else {
      const token = result.token;
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.redirect('/');
    }
  };



const resendOTP = async (req, res) => {
    const mobileNumber = req.session.mobile
    try {
      // Retrieve user data from session storage
      const userData = req.session.userData;
  
      if (!userData) {
        res.status(400).json({ message: 'Invalid or expired session' });
      }
  
      // Generate and send new OTP using Twilio
      const otp = otpHelper.generateOtp()

      req.session.otp = otp

    //   await otpHelper.sendOtp(mobileNumber,otp)
      console.log(`Resend Otp is ${otp}`)
  
      res.render('verifyOtp',{ message: 'OTP resent successfully' });
    } catch (error) {
      console.error('Error: ', error);
      res.render('verifyOtp',{ message: 'Failed to send otp' });
    }
  };
  

const verifyOtp = async(req,res)=>{
    const otp = req.body.otp
    try {
    const sessionOTP = req.session.otp;
    const userData = req.session.userData;

    if (!sessionOTP || !userData) {
        res.render('verifyOtp',{ message: 'Invalid Session' });
    }else if (sessionOTP !== otp) {
        res.render('verifyOtp',{ message: 'Invalid OTP' });
    }else{
    const spassword =await securePassword(userData.password)
        const user = new User({
            fname:userData.fname,
            lname:userData.lname,
            email:userData.email,
            mobile:userData.mno,
            password:spassword,
            is_admin:0
        })
        const userDataSave = await user.save()
        if(userDataSave){
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect('/')
        }else{
            res.render('register',{message:"Registration Failed"})
        }
    }


    } catch (error) {
        console.log(error.message);     
    }
}

const profile = async(req,res)=>{
    try {
        res.render('profile',{user:res.locals.user})
    } catch (error) {
        console.log(error.message)   
    }
}


const forgotPasswordOtp = async(req, res)=>{       
    const user = await User.findOne({mobile : req.body.mobile})                                     
    // req.session.number = number
    if(!user){
        res.render('forgotPassword',{message:"User Not Registered"})
    }else{
        const OTP = otpHelper.generateOtp()
        // await otpHelper.sendOtp(user.mobile,OTP)
        console.log(`Forgot Password otp is --- ${OTP}`) 
        req.session.otp = OTP
        req.session.email = user.email
        res.render('forgotPasswordOtp')
    }
     
}

const loadForgotPassword = async(req,res)=>{
    try {
        res.render('forgotPassword')
    } catch (error) { 
        console.log(error.message)
    }
}

const resetPasswordOtpVerify = async (req,res)  => {
    try{
        const mobile = req.session.mobile
        const otp = req.session.otp
        const reqOtp = req.body.otp

        const otpHolder = await User.find({ mobile : req.body.mobile })
        if(otp==reqOtp){
            res.render('resetPassword')
        }
        else{
            res.render('forgotPasswordOtp',{message:"Your OTP was Wrong"})
        }
    }catch(error){
        console.log(error);
        return console.log("an error occured");
    }
}

const setNewPassword = async (req ,res) => {
    const newpw = req.body.newpassword
    const confpw = req.body.confpassword

    const mobile = req.session.mobile
    const email = req.session.email

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(req.body.newpassword)){
        return res.render("resetPassword", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
    }

    if(newpw === confpw){

        const spassword =await securePassword(newpw)
        const newUser = await User.updateOne({ email:email }, { $set: { password: spassword } });

        res.redirect('/login')
    }else{
        res.render('resetPassword',{message:'Password and Confirm Password is not matching'})
    }
}

const logout = (req,res) =>{
    res.cookie('jwt', '' ,{maxAge : 1})
    res.redirect('/')
}

const displayProduct = async(req,res)=>{
    try {
        const product = await Product.find({ $and: [{ isListed: true }, { isProductListed: true }] }).populate('category');
        res.render('shop',{product:product})    
    } catch (error) {
      console.log(error.message)
    }
  }

const checkOut = (req,res)=>{
    try {
        res.render('checkOut')
    } catch (error) {
        console.log(error.message)
        
    }
}

module.exports = {
    homeLoad,
    loadRegister,
    insertUser,
    verifyOtp,
    loginLoad,
    verifyLogin,
    resendOTP,
    forgotPasswordOtp,
    loadForgotPassword,
    resetPasswordOtpVerify,
    setNewPassword,
    profile,
    logout,
    displayProduct,
    checkOut

}