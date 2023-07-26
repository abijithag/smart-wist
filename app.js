const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://vinayakvenugopal2000:qsIPxcs5HK8UWUPg@smartwrist.gbqg6mz.mongodb.net/test')

const express = require('express');
const app = express();
app.use(express.static(__dirname+'/public')); 


// User Route

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute')

app.use('/admin',adminRoute)



//Admin Route



app.listen(3000,()=>{
    console.log("Server Started on http://localhost:3000")
})