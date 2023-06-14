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


const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const username = req.body.username
        const password = req.body.password
        
        const adminData =await Admin.findOne({userName:username})
        console.log(adminData.password)
        console.log(password)


        if(adminData.password === password){
            // const passwordMatch = await bcrypt.compare(password,userData.password)
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
const loadDashboard = async(req,res)=>{
    try {
        res.render('dashboard')
    } catch (error) {
        console.log(error)
    }
}





// Create a new category


const loadUsers = async(req,res)=>{
  try {
    var search = ''
    if(req.query.search){
        search = req.query.search
    }
    const usersData = await User.find({
        $or:[
            {fname:{$regex:'.*'+search+'.*'}},
            {lname:{$regex:'.*'+search+'.*'}},
            {email:{$regex:'.*'+search+'.*'}},
            {mobile:{$regex:'.*'+search+'.*'}},
        ]
    })
   
    res.render('users',{user:usersData})
} catch (error) {
    console.log(error.message);
}
}
const deleteUser = async(req,res)=>{
  try {
      const id = req.query.id;
      await User.deleteOne({_id:id})
      res.redirect('/admin/users')
      
  } catch (error) {
      console.log(error.message);
  }
}

const blockUser = async(req,res)=>{
  try {
    const id = req.query.id
    await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error)
  }
}



const loadEditUser = async(req,res)=>{
  try {
      const id = req.query.id
      const userData = await User.findById({_id:id})
      if(userData){
          res.render('editUser',{user:userData});            
      }else{
          res.redirect('/admin/users');
      }
     
      
  } catch (error) {
      console.log(error.message);
  }
}

const updateUser = async(req,res)=>{
  try {
      const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{fname:req.body.fname,lname:req.body.lname,email:req.body.email,mobile:req.body.mobile}})
      res.redirect('/admin/users')
      
  } catch (error) {
      console.log(error.message);
  }
}
const unBlockUser = async(req,res)=>{
  try {
    const id = req.query.id
    await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error)
  }
}



const logout = (req,res) =>{
  res.cookie('jwt', '' ,{maxAge : 1})
  res.redirect('/admin')
}




module.exports = {
    loadLogin,
    loadDashboard,
    verifyLogin,
    loadUsers,
    deleteUser,
    blockUser,
    loadEditUser,
    updateUser,
    unBlockUser,
    logout
}