const Address = require("../models/AddressModel");
const Cart = require('../models/cartModel');
const orderHelper = require('../helpers/orderHelper')
const Order = require('../models/orderModel');
const { ObjectId } = require("mongodb");


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
        res.render('checkOut',{address:address.addresses,cart,total})
    } catch (error) {
        console.log(error.message)
        
    }
}
const changePrimary = async (req, res) => {
  try {
    const userId = res.locals.user._id
    const result = req.body.addressRadio;
    console.log(result)
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
  console.log(req.body, "body");
  try {
    let userId = res.locals.user;
    let data = req.body;
    let total = data.total;
    // let couponCode = data.couponCode;
    // console.log(total, couponCode, "---------");
    // await couponHelpers.addCouponToUser(couponCode, userId);
    try {
      const response = await orderHelper.placeOrder(data,userId);
      // console.log(response, "response");
      if (data.paymentOption === "cod") {
        res.json({ codStatus: true });}
      // } else if (data.payment_option === "razorpay") {
      //   const order = await orderHelpers.generateRazorpay(
      //     req.session.user._id,
      //     total
      //   );
      //   console.log(order, ";;");
      //   res.json(order);
      // } else if (data.payment_option === "wallet") {
      //   res.json({ orderStatus: true, message: "order placed successfully" });
      // }
      // res.redirect("/orderDetails")
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
    console.log(id);
    orderHelper.findOrder(id, user._id).then((orders) => {
      const address = orders[0].shippingAddress
      const products = orders[0].productDetails 
      console.log(products[0].productName)
      res.render('orderDetails',{orders,address,products})
    });



    
    
    
     
        
  } catch (error) {
    console.log(error.message);
  }

}
const orderList  = async(req,res)=>{
  try {
    const user  = res.locals.user
    const order = await Order.findOne({user:user._id})
    res.render('orderList',{order:order.orders})
  } catch (error) {
    
  }


}

module.exports = {
    checkOut,
    changePrimary,
    postCheckOut,
    orderDetails,
    orderList
}