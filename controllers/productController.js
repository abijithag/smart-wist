const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const path = require('path');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const jwt = require('jsonwebtoken');
const multer = require('multer');




const loadProducts = async(req,res)=>{
    try {
      let categories = await Category.find({})
      res.render('addProduct',{category:categories})
    } catch (error) {
      
    }
  }
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/product-images/');
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
  });
  
  const upload = multer({ storage: storage }).array('images');
  
  const createProduct = (req, res) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.error('Error uploading image:', err);
        return res.status(500).send('Error uploading image');
      } else if (err) {
        console.error('Error uploading image:', err);
        return res.status(500).send('Error uploading image');
      }
  
      const { name, description, category,price } = req.body;
      const images = req.files.map(file => file.filename);
  
      const newProduct = new Product({
        name,
        description,
        images,
        category,
        price
      });
  
      newProduct.save()
        .then(() => {
          res.redirect('/admin/displayProduct');
        })
        .catch((err) => {
          console.error('Error adding product:', err);
          res.status(500).send('Error adding product to the database');
        });
    });
  };
  const displayProduct = async(req,res)=>{
    try {
      console.log('displayproduct')
      const product = await Product.find({})
      res.render('displayProduct',{product:product})    
    } catch (error) {
      console.log(error.message)
    }
  }
  
  const unListProduct = async(req,res)=>{
    try {
        const id = req.query.id;
        await Product.updateOne({_id:id},{ isProductListed: false })
        res.redirect('/admin/displayProduct')
        
    } catch (error) {
        console.log(error.message);
    }
  }

  const reListProduct = async(req,res)=>{
    try {
        const id = req.query.id;
        const categorylisted = await Product.findOne({_id:id}).populate('category')
        console.log(categorylisted.category.isListed)
        if(categorylisted.category.isListed==true){
          await Product.updateOne({_id:id},{ isProductListed: true })
        }else{
          console.log('Cannot Relist v')
        }
        
        res.redirect('/admin/displayProduct')
        
    } catch (error) {
        console.log(error.message);
    }
  }

  module.exports = {
    loadProducts,
    createProduct,
    displayProduct,
    unListProduct,
    reListProduct
  }