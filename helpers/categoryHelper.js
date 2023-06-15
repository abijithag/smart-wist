const Product = require('../models/productModel')
const Category = require('../models/categoryModel');


createCategory = async(data)=>{
    try {
        const category = new Category({name:data.name,description:data.description});
        const savedCategory = await category.save();
    }catch(error){
        console.log(error)
    }
}

loadUpdateCategory = async(id) => {
    try {    
        const Categorydata = await Category.findById({_id:id})
        return Categorydata
      } catch (error) {
        console.log(error.message)
      }

}

updateCategory = async(categoryId)=>{
    try {
        await Category.findByIdAndUpdate({_id:categoryId},{$set:{name:req.body.category,description:req.body.description}});
      } catch (error) {
        console.log(error.message)
      }
    }



    unListCategory = async(categoryId)=>{
        try {
          await Category.findByIdAndUpdate(categoryId,{isListed:false});
          await Product.updateMany({ category: categoryId }, {$set:{ isListed: false }})
        } catch (error) {
            console.log(error)
        }
      }

      reListCategory = async(categoryId)=>{
        try {
          await Category.findByIdAndUpdate(categoryId,{isListed:true});

          await Product.updateMany({ category: categoryId },{$set:{ isListed: true }})
        } catch (error) {
            console.log(error)
        }
      }


    



module.exports = {
    createCategory,
    loadUpdateCategory,
    updateCategory,
    unListCategory,
    reListCategory
}