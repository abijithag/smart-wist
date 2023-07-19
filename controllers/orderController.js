const Address = require("../models/AddressModel");
const Cart = require('../models/cartModel');
const orderHelper = require('../helpers/orderHelper')
const Order = require('../models/orderModel');
const { ObjectId } = require("mongodb");
const couponHelper = require('../helpers/couponHelper')


const checkOut = async (req,res)=>{
    try {
        const user = res.locals.user
        const total = await Cart.findOne({ user: user.id });
        const address = await Address.findOne({user:user._id}).lean().exec()
        
        const cart = await Cart.aggregate([
            {
              $match: { user: user.id }
            },
            {
              $unwind: "$cartItems"
            },
            {
              $lookup: {
                from: "products",
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "carted"
              }
            },
            {
              $project: {
                item: "$cartItems.productId",
                quantity: "$cartItems.quantity",
                total: "$cartItems.total",
                carted: { $arrayElemAt: ["$carted", 0] }
              }
            }
          ]);
      if(address){
        res.render('checkOut',{address:address.addresses,cart,total}) 
      }else{
        res.render('checkOut',{address:[],cart,total})
      }
    } catch (error) {
        console.log(error.message)
        
    }
}
const changePrimary = async (req, res) => {
  try {
    const userId = res.locals.user._id
    const result = req.body.addressRadio;
    const user = await Address.find({ user: userId.toString() });

    const addressIndex = user[0].addresses.findIndex((address) =>
      address._id.equals(result)
    );
    if (addressIndex === -1) {
      throw new Error("Address not found");
    }

    const removedAddress = user[0].addresses.splice(addressIndex, 1)[0];
    user[0].addresses.unshift(removedAddress);

    const final = await Address.updateOne(
      { user: userId },
      { $set: { addresses: user[0].addresses } }
    );

    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

const postCheckOut  = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const data = req.body;
    const couponCode = data.couponCode
    // await couponHelper.addCouponToUser(couponCode, userId);


    try { 
      const response = await orderHelper.placeOrder(data,userId);
      if (data.paymentOption === "cod") { 
        res.json({ codStatus: true });
        await Cart.deleteOne({ user:userId  })
      } 
        else if (data.paymentOption === "wallet") {
          res.json({ orderStatus: true, message: "order placed successfully" });
          await Cart.deleteOne({ user:userId  })
      }else if (data.paymentOption === "razorpay") {
        const order = await orderHelper.generateRazorpay(userId,data.total);
        res.json(order);
      }

    } catch (error) {
      console.log("got here ----");
      console.log({ error: error.message }, "22");
      res.json({ status: false, error: error.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

const orderDetails = async (req,res)=>{
  try {
    const user = res.locals.user
    const id = req.query.id
    orderHelper.findOrder(id, user._id).then((orders) => {
      const address = orders[0].shippingAddress
      const products = orders[0].productDetails 
      res.render('orderDetails',{orders,address,products})
    });      
  } catch (error) {
    console.log(error.message);
  }

}

const paymentFailed = async(req,res)=>{
  try {
    const order = req.body
    console.log(order.order.receipt);
    const deleted = await Order.updateOne(
      { "orders._id": new ObjectId(order.order.receipt) },
      { $pull: { orders: { _id:new ObjectId(order.order.receipt) } } }

    )
    console.log(deleted);
    res.send({status:true})
  } catch (error) {
    
  }
  
}
const orderList  = async(req,res)=>{
  try {
    const user  = res.locals.user
    // const order = await Order.findOne({user:user._id})
    const orders = await Order.aggregate([
      {$match:{user:user._id}},
      { $unwind: "$orders" },
      { $sort: { "orders.createdAt": -1 } },
    ])
    res.render('profileOrder',{orders})

    
   
  } catch (error) {
    console.log(error.message);
    
  }


}

const cancelOrder = async(req,res)=>{

  const orderId = req.body.orderId
  const status = req.body.status
  orderHelper.cancelOrder(orderId, status).then((response) => {
    res.send(response);
  });


}

const verifyCoupon = (req, res) => {
  const couponCode = req.params.id
  const userId = res.locals.user._id
  couponHelper.verifyCoupon(userId, couponCode).then((response) => {
      res.send(response)
  })
}

const applyCoupon =  async (req, res) => {
  const couponCode = req.params.id 
  const userId = res.locals.user._id
  const total = await orderHelper.totalCheckOutAmount(userId) 
  console.log("totalhelper :"+total);
  couponHelper.applyCoupon(couponCode, total).then((response) => {
      res.send(response)
  }) 
}


const verifyPayment =  (req, res) => {
  const orderId = req.body.order.receipt

  orderHelper.verifyPayment(req.body).then(() => {
    orderHelper
      .changePaymentStatus(res.locals.user._id, req.body.order.receipt,req.body.payment.razorpay_payment_id)
      .then(() => {
        res.json({ status: true });
      })
      .catch((err) => {
        res.json({ status: false });
        console.log("faileeeeeeeeeeeeeeeeeeeeed");
      });
  }).catch(async(err)=>{
    // const deleted = await Order.deleteOne({"orders._id":new ObjectId(orderId)})
    // console.log(deleted);
    
    console.log(err);

  });
}



module.exports = {
    checkOut,
    changePrimary,
    postCheckOut,
    orderDetails,
    orderList,
    cancelOrder,
    verifyCoupon,
    applyCoupon,
    verifyPayment,
    paymentFailed

}