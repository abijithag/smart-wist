const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/AddressModel");
const profiletHelper = require("../helpers/profileHelper");
const Order = require('../models/orderModel');


const loadDashboard = async(req,res)=>{
  try {
    res.render('dashboard')
  } catch (error) {
    console.log(error.message);
  }
}

const profile = async (req, res) => {
  try {
    let arr = []
    const user = res.locals.user;
    res.render("profileDetails", { user, arr });
  } catch (error) {
    console.log(error.message);
  }
};

const profileAdress = async (req, res) => {
  try {
    let arr = []
    const user = res.locals.user;
    const address = await Address.find({user:user._id.toString()});
    if(address){
      const ad = address.forEach((x) => {
        return (arr = x.addresses);
      });
      res.render("profileAdress", { user, arr });
    }
    
  } catch (error) {
    console.log(error.message);
  }
};

///submitt address

const submitAddress = async (req, res) => {
  try {
    console.log('SUBMIT')
    const userId = res.locals.user._id;
    console.log(userId);
    const name = req.body.name;
    const mobileNumber = req.body.mno;
    const address = req.body.address;
    const locality = req.body.locality;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const state = req.body.state;

    // Create a new address object
    const newAddress = {
      name: name,
      mobileNumber: mobileNumber,
      address: address,
      locality: locality,
      city: city,
      pincode: pincode,
      state: state,
    };

    const updatedUser = await profiletHelper.updateAddress(userId, newAddress);
    if (!updatedUser) {
      // No matching document found, create a new one
      await profiletHelper.createAddress(userId, newAddress);
    }

    res.json({ message: "Address saved successfully!" });

    res.redirect("/profile"); // Redirect to the profile page after saving the address
  } catch (error) {
    console.log(error.message);
  }
};



///edit address

const editAddress = async (req, res) => {
  console.log("hai");
  const id = req.body.id;
  const name = req.body.name;
  const address = req.body.address;
  const locality = req.body.locality;
  const city = req.body.city;
  const pincode = req.body.pincode;
  const state = req.body.state;
  const mobileNumber = req.body.mobileNumber;

  const update = await Address.updateOne(
    { "addresses._id": id }, 
    {
      $set: {
        "addresses.$.name": name,
        "addresses.$.address": address,
        "addresses.$.locality": locality,
        "addresses.$.city": city,
        "addresses.$.pincode": pincode,
        "addresses.$.state": state,
        "addresses.$.mobileNumber": mobileNumber,
      },
    }
  );

  res.redirect("/profile");
};


///delete address

const deleteAddress = async (req, res) => {
  const userId = res.locals.user._id;
  const addId = req.query.id;
  console.log("user" + userId);
  console.log(addId);

  const deleteobj = await Address.updateOne(
    { user: userId }, 
    { $pull: { addresses: { _id: addId } } }
  );

  res.redirect("/profileAddress");
};

const checkOutAddress = async (req, res) => {
  try {
    console.log('SUBMIT')
    const userId = res.locals.user._id;
    console.log(userId);
    const name = req.body.name;
    const mobileNumber = req.body.mno;
    const address = req.body.address;
    const locality = req.body.locality;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const state = req.body.state;

    const newAddress = {
      name: name,
      mobileNumber: mobileNumber,
      address: address,
      locality: locality,
      city: city,
      pincode: pincode,
      state: state,
    };

    const updatedUser = await profiletHelper.updateAddress(userId, newAddress);
    if (!updatedUser) {
      await profiletHelper.createAddress(userId, newAddress);
    }


    res.redirect("/checkOut"); 
  } catch (error) {
    console.log(error.message);
  }
};





module.exports = {
  profile,
  submitAddress,
  editAddress,
  deleteAddress,
  checkOutAddress,
  loadDashboard,
  profileAdress
  
};