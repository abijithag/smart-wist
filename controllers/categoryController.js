const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')


const loadCategory = async(req,res)=>{
    try {
      const categories = await Category.find();
      
      res.render('category',{categories})
    } catch (error) {
        console.log(error)
    }
}

const createCategory = async(req, res)=>{
    try {
      const category = new Category({name:req.body.name,description:req.body.description});
      const savedCategory = await category.save();
      res.redirect('/admin/category')
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
  
  
  const loadUpdateCategory = async(req,res)=>{
    try {
      const id = req.query.id
  
      const Categorydata = await Category.findById({_id:id})
  
      res.render('updateCategory',{category:Categorydata})
    } catch (error) {
      console.log(error.message)
    }
  }
  
  // Update a category
  async function updateCategory(req, res) {
  
    try {
      const categoryId  = req.body.id;
      const updatedCategory = await Category.findByIdAndUpdate({_id:categoryId},{$set:{name:req.body.category,description:req.body.description}});
      res.redirect('/admin/category')
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
  
  // Delete a category
  const unListCategory = async(req, res)=>{
    try {
      const categoryId  = req.query.id;
      await Category.findByIdAndUpdate(categoryId,{isListed:false});
      await Product.updateMany({ category: categoryId }, { isListed: false })
      res.redirect('/admin/category')
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
  const reListCategory = async(req, res)=>{
    try {
      const categoryId  = req.query.id;
      await Category.findByIdAndUpdate(categoryId,{isListed:true});
      await Product.updateMany({ category: categoryId }, { isListed: true })
      res.redirect('/admin/category')
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }

  module.exports = {
    loadCategory,
    createCategory,
    createCategory,
    updateCategory,
    unListCategory,
    loadUpdateCategory,
    reListCategory
  }