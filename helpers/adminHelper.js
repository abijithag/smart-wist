const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const path = require('path');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const jwt = require('jsonwebtoken');
const multer = require('multer');

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'my-secret', {
    expiresIn: maxAge
  });
};

const verifyLogin = async(data)=>{
    try {
        const username = data.username
        const password = data.password
        
        const adminData =await Admin.findOne({userName:username})


        if(adminData.password === password){
            if(adminData){
                const token = createToken(adminData._id);
                res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.redirect('/admin/category')
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