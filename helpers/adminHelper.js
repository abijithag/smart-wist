const Order = require('../models/orderModel');
const { ObjectId } = require("mongodb");
const User = require('../models/userModel');


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

  const cancelOrder = (orderId,userId, status) => {
    try {
      console.log(status);

      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
          if(order.paymentMethod=='cod'){
  
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
        }else if(order.paymentMethod=='wallet'){
                    console.log(status);

          if(status == 'Cancel Accepted'){
            console.log('waaalet');
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet"
                }
              }
            ).then(async (response) => {
              const user = await User.findOne({ _id: userId});
              user.wallet += parseInt(order.totalPrice);
              await user.save();
              resolve(response);
            });

          }else if(status == 'Cancel Declined'){
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

        }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const returnOrder = async (orderId,userId,status) => {
    try {
      return new Promise(async (resolve, reject) => {
        Order.findOne({ "orders._id": new ObjectId(orderId) }).then((orders) => {
          const order = orders.orders.find((order) => order._id == orderId);
       
          if(order.paymentMethod == 'cod'){
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
            ).then(async (response) => {
              const user = await User.findOne({ _id: userId});
              user.wallet += parseInt(order.totalPrice);
              await user.save();
              resolve(response);
            });

          }
        }else if(order.paymentMethod=='wallet'){
          if(status == 'Return Accepted'){
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Refund Credited to Wallet"
                }
              }
            ).then(async (response) => {
              const user = await User.findOne({ _id: userId});
              user.wallet += parseInt(order.totalPrice);
              await user.save();
              resolve(response);
            });

          }else if(status == 'Return Declined'){
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
        }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const getSalesReport =  () => {
    try {
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $unwind: "$orders",
          },
          // {
          //   $match: {
          //     "orders.orderConfirm": "delivered",
          //   },
          // },
        ]).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }


  const postReport = (date) => {
    console.log(date, "date+++++");
    try {
      let start = new Date(date.startdate);
      let end = new Date(date.enddate);
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $match: {
              $and: [
                { "orders.orderStatus": "Delivered" },
                {
                  "orders.createdAt": {
                    $gte: start,
                    $lte: new Date(end.getTime() + 86400000),
                  },
                },
              ],
            },
          },
        ])
          .exec()
          .then((response) => {
            console.log(response, "response---");
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  }
  

  module.exports = {
    getAllOrder,
    findOrder,
    changeOrderStatus,
    cancelOrder,
    returnOrder,
    getSalesReport,
    postReport
  }