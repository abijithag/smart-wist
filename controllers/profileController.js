const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/AddressModel");
const profiletHelper = require("../helpers/profileHelper");

// Load profile
// const profile = async (req, res) => {
//   try {
//     const user = res.locals.user;
//     const address = await Address.find();
//     const ad = address.forEach((x) => {
//       return (arr = x.addresses);
//     });
//     console.log(arr);

//     res.render("profile", { user, arr });
//   } catch (error) {
//     console.log(error.message);
//   }
// };
const profile = async (req, res) => {
  try {
    console.log('PROFILE')

    const user = res.locals.user;
    const address = await Address.find();
    const ad = address.forEach((x) => {
      return (arr = x.addresses);
    });
    console.log(arr);

    res.render("profile", { user, arr });
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

    console.log(result);

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
    { "addresses._id": id }, // Match the document with the given ID
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
    { user: userId }, // Match the user based on the user ID
    { $pull: { addresses: { _id: addId } } } // Remove the object with matching _id from addresses array
  );

  res.redirect("/profile");
};







module.exports = {
  profile,
  submitAddress,
  editAddress,
  deleteAddress,
  
};