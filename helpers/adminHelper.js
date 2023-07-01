const Order = require('../models/orderModel');
const { ObjectId } = require("mongodb");

const getAllOrder  = () => {
    try {
      return new Promise(async (resolve, reject) => {
        const Order = await Order.aggregate([
          { $unwind: "$orders" },
          { $sort: { createdAt: -1 } },
        ]).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  const findOrder  = (orderId) => {
    try {
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $match: {
              "orders._id": new ObjectId(orderId)
            },
          },
          { $unwind: "$orders" },
        ]).then((response) => {
          let orders = response
            .filter((element) => {
              if (element.orders._id == orderId) {
                return true;
              }
              return false;
            })
            .map((element) => element.orders);
  
          resolve(orders);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  module.exports = {
    getAllOrder,
    findOrder
  }