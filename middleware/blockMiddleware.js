const jwt = require('jsonwebtoken');
const User = require('../models/userModel');




const checkBlocked =  (req,res,next)=> {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'my-secret', async (err, decodedToken) => {
            const user = await User.findById(decodedToken.id);
            if (user.is_blocked==true){
              res.cookie('jwt', '' ,{maxAge : 1})
              res.redirect('/')
          }else{
              next()
          }
        });
    }else{
        next()
    }

  
    
  
     
  };

  module.exports = {
    checkBlocked
  }