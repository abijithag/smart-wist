const Address = require("../models/AddressModel");
const Cart = require('../models/cartModel');




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

module.exports = {
    checkOut
}