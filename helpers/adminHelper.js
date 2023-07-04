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

  const changeOrderStatus = (orderId, status) => {
    try {
      return new Promise((resolve, reject) => {
        Order.updateOne(
          { "orders._id": new ObjectId(orderId) },
          {
            $set: { "orders.$.orderStatus": status },
          }
        ).then((response) => {
          console.log(response, "$$$$$$$$$$$$$$");
          resolve({status:true,orderStatus:status});
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  // const cancelOrder = (orderId,status) => {
  //   try {
  //     return new Promise(async(resolve, reject) => {
  //       Order.findOne({ "orders._id": new ObjectId(orderId) }).then((orders) => {
  //       const order = orders.orders.find((order) => order._id == orderId)

  //       if(status=='Cancel Accepted'||status=='Cancel Declined')
  //       Order.updateOne(
  //         { "orders._id": new ObjectId(orderId) },
  //         {
  //           $set: { "orders.$.cancelStatus": status, 
  //                   "orders.$.orderStatus":status,
  //                   "orders.$.paymentStatus":"No Refund"
  //                  }
  //         }
        
          
  
  //       ).then((response) => {
  //         resolve(response);
  //       });
  //     });

  //     });
    
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // }
  const cancelOrder = (orderId, status) => {
    try {
      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
  
          if (status == 'Cancel Accepted' || status == 'Cancel Declined') {
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then((response) => {
              resolve(response);
            });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const returnOrder = (orderId, status) => {
    try {
      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
  
          if (status == 'Return Declined') {
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then((response) => {
              resolve(response);
            });
          }else if(status == 'Return Accepted'){
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet"
                }
              }
            ).then((response) => {
              resolve(response);
            });

          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  

  module.exports = {
    getAllOrder,
    findOrder,
    changeOrderStatus,
    cancelOrder,
    returnOrder
  }