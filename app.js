const express=require('express');
const bodyParser=require('body-parser');

const mongoose=require('mongoose');

const HttpError=require('./models/http-error');




const placeRoutes=require('./routes/places-routes');

const userRoutes=require('./routes/users-routes');

const app=express();
app.use(bodyParser.json())
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,PATCH');
    next();
})
app.use('/api/places',placeRoutes); 

app.use('/api/users',userRoutes);



app.use((req,res,next)=>{
    const error=new HttpError('Could not find the route',404);
    throw error;

})
app.use((error,req,res,next)=>{
   if(res.headerSent)
   {
    return next(error);
   }
   else{
    res.status(error.code || 500).json({message: error.message || "unknown error occured"})
   }

})






mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zl7nk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`).then(()=>{
    app.listen(5000);
}).catch((err)=>{
    console.log(err);
});
