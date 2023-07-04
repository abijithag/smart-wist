const Admin = require('../models/adminModel')
const User = require('../models/userModel')
// const path = require('path');
// const Product = require('../models/productModel')
// const Category = require('../models/categoryModel')
const jwt = require('jsonwebtoken');
// const multer = require('multer');
const adminHelper = require('../helpers/adminHelper');
const { response } = require('../routes/userRoute');
const Order = require('../models/orderModel');
const orderHelper = require('../helpers/orderHelper')


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
const page = parseInt(req.query.page) || 1; // Current page number
const pageSize = parseInt(req.query.pageSize) || 5; // Number of items per page
const skip = (page - 1) * pageSize;
const totalCount = await User.countDocuments({});
const totalPages = Math.ceil(totalCount / pageSize);




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
    }).skip(skip)
    .limit(pageSize)
   
    res.render('users',{user:usersData,page,
        pageSize,
        totalPages})
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
    console.log(error.message)
  }
}

// const orderList = async(req,res)=>{
//     try {
//         const orders = await Order.aggregate([
//             { $unwind: "$orders" },
//             { $sort: { 'orders.createdAt' : -1 } },
//           ])
//         res.render('orderList',{orders})          
//     } catch (error) {
//         console.log(error.message)
        
//     }
// }



const orderList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number, default is 1
    const limit = parseInt(req.query.limit) || 5; // Number of items per page, default is 10

    const totalOrders = await Order.aggregate([
      { $unwind: "$orders" },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const count = totalOrders.length > 0 ? totalOrders[0].count : 0;
    const totalPages = Math.ceil(count / limit);
    console.log(totalPages);

    const skip = (page - 1) * limit;

    const orders = await Order.aggregate([
      { $unwind: "$orders" },
      { $sort: { "orders.createdAt": -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.render("orderList", { orders, totalPages, page,limit });
  } catch (error) {
    console.log(error.message);
  }
};






const orderDetails = async (req,res)=>{
    try {
      const id = req.query.id
      console.log(id);
      adminHelper.findOrder(id).then((orders) => {
        const address = orders[0].shippingAddress
        const products = orders[0].productDetails 
        res.render('orderDetails',{orders,address,products}) 
      });
        
    } catch (error) {
      console.log(error.message);
    }
  
  }


const logout = (req,res) =>{
  res.cookie('jwtAdmin', '' ,{maxAge : 1})
  res.redirect('/admin')
}


const changeStatus = async(req,res)=>{
  const orderId = req.body.orderId
  const status = req.body.status
  console.log(orderId)
  adminHelper.changeOrderStatus(orderId, status).then((response) => {
    console.log(response);
    res.json(response);
  });

}

const cancelOrder = async(req,res)=>{
  const orderId = req.body.orderId
  const status = req.body.status

  adminHelper.cancelOrder(orderId,status).then((response) => {
    res.send(response);
  });

}
const returnOrder = async(req,res)=>{
  const orderId = req.body.orderId
  const status = req.body.status

  adminHelper.returnOrder(orderId,status).then((response) => {
    res.send(response);
  });

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
    logout,
    orderList,
    orderDetails,
    changeStatus,
    cancelOrder,
    returnOrder
}