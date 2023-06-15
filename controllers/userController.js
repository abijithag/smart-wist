const User = require('../models/userModel')
const Product = require('../models/productModel')
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')

const accountSid = 'ACed4175b83602429cfcf29f2f468ac634';
const authToken = '925574a176805ef8a83915ecc15cada4';
const client = require('twilio')(accountSid, authToken);



const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'my-secret', {
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
    const existingUser = await User.findOne({email:email})
    if(existingUser){
      return res.render("register",{message:"Email already exists"})
    }
    if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
        return res.render("register", { message: "Name should not contain numbers" });
      }
  
    let mobileNumber = req.body.mno
    const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false
      });
    //   await client.messages.create({
    //     body: `Your OTP for Smart Wrist Sign Up is: ${otp}`,
    //     from: '+18312822941',
    //     to: `+91${mobileNumber}`,
    //   })
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
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        
        const userData =await User.findOne({email:email})

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            console.log(passwordMatch)
            if(passwordMatch){
                if(userData.is_blocked==true){
                    res.render('login',{message:"Your Account is Blocked"});
                }else{
                    const token = createToken(userData._id);
                    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                    res.redirect('/')
                }
                
            }else{
                res.render('login',{message:"Email and Password are Incorrect"});
            }
            
        }else{
            res.render('login',{message:"Email and Password are Incorrect"});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}



const resendOTP = async (req, res) => {
    let mobileNumber = req.session.mobile
    try {
      // Retrieve user data from session storage
      const userData = req.session.userData;
  
      if (!userData) {
        res.status(400).json({ message: 'Invalid or expired session' });
      }
  
      // Generate and send new OTP using Twilio
      const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false
      });

      req.session.otp = otp

    //   await client.messages.create({
    //     body: `Your OTP for Smart Wrist Sign Up is: ${otp}`,
    //     from: '+18312822941',
    //     to:`+91${mobileNumber}`,
    //   })
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
        const OTP = otpGenerator.generate(6,{
            lowerCaseAlphabets: false, 
            upperCaseAlphabets: false, 
            specialChars: false
        })
        // await client.messages.create({
        //     body: `Your OTP for Smart Wrist Sign Up is: ${OTP}`,
        //     from: '+18312822941',
        //     to:`+91${user.mobile}`,
        //   })
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
        console.log('session otp',otp);
        // res.send('welcome',)
        const reqOtp = req.body.otp

        const otpHolder = await User.find({ mobile : req.body.mobile })
        if(otp==reqOtp){
            //sending token as a cookie
            const token = createToken(User._id)
            res.cookie('jwt',token, {httpOnly: true, maxAge : maxAge*1000 })
            res.render('resetPassword')
        }
        else{
            return console.log("Your OTP was Wrong")
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
    

    if(newpw === confpw){
        const spassword =await securePassword(newpw)
        const newUser = await User.updateOne({ email:email }, { $set: { password: spassword } });
        console.log(newUser)

        res.redirect('/login')
        console.log('Password updated successfully');
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
      const product = await Product.find({isListed:true})
      res.render('shop',{product:product})    
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
    displayProduct

}