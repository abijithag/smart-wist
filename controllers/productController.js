// const Admin = require('../models/adminModel')
// const User = require('../models/userModel')
// const path = require('path');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
// const multer = require('multer');
const productHelper = require('../helpers/productHelper')




const loadProducts = async(req,res)=>{
    try {
      const categories = await Category.find({})
      res.render('addProduct',{category:categories})
    } catch (error) {
      
    }
  }
  
  
  const createProduct = async(req, res) => {
    try {
      const categories = await Category.find({})
      if (!req.body.name || req.body.name.trim().length === 0) {
        return res.render("addProduct", { message: "Name is required",category:categories });
    }
      const images = req.files.map(file => file.filename);
      await productHelper.createProduct(req.body,images)
      res.redirect('/admin/displayProduct');
    } catch (error) {
      console.log(error)
      
    }
  
  };


  const displayProduct = async(req,res)=>{
    try {

      const product = await Product.find({})
      res.render('displayProduct',{product:product})    
    } catch (error) {
      console.log(error.message)
    }
  }
  
  const unListProduct = async(req,res)=>{
    try {
      await productHelper.unListProduct(req.query.id)

        res.redirect('/admin/displayProduct')
        
    } catch (error) {
        console.log(error.message);
    }
  }



  const reListProduct = async(req,res)=>{
    try {

        await productHelper.reListProduct(req.query.id)
        res.redirect('/admin/displayProduct')
    } catch (error) {
        console.log(error.message);
    }
  }


  
  const loadUpdateProduct = async(req,res)=>{
    try {
      const categories = await Category.find({})
      const id = req.query.id;
      const productData = await Product.findById({_id:id})
      res.render('updateProduct',{product:productData,category:categories})
      
    } catch (error) {
      console.log(error)
      
    }
  }
 
  const updateProduct = async (req, res) => {
    try {
        const images = req.files.map(file => file.filename);
        await productHelper.updateProduct(req.body,images)
        res.redirect('/admin/displayProduct');
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const productPage = async ( req, res ) => {
    try{
        const id = req.query.id
        const product = await Product.findOne({ _id : id }).populate('category')
        res.render('product',{product : product})
    }
    catch(error){
        console.log(error);
        res.send({ success: false, error: error.message });
 }

}

  module.exports = {
    loadProducts,
    createProduct,
    displayProduct,
    unListProduct,
    reListProduct,
    loadUpdateProduct,
    updateProduct,
    productPage
  }