const HttpError=require('../models/http-error');
const User=require('../models/user')
const {validationResult}=require('express-validator')
const uuid=require('uuid');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')


// const DUMMY_USERS=[{
//     id:'1',
//     name:'max',
//     email:'test@test.com',
//     password:'test'
// }]

const getUsers=async(req,res,next)=>{
    // res.json({DUMMY_USERS})
    let users;
    try {
            users=await User.find({},'-password');
            
        } catch (error) {
            const err=new HttpError('fetching data problem',500);
            return next(err);

            
        }
        res.json({users:users.map(user=>user.toObject({getters:true}))})

}

const signup=async (req,res,next)=>{
    const error=validationResult(req);
    // console.log(error);
    if(error.isEmpty())
    {
    
        const err= new HttpError('Invalid inputs check the data',422);
        return next(err); 
    }
    const{email,name,password}=req.body;
    console.log(name);



    // const hasUser=DUMMY_USERS.find((u)=>u.email===email)
    
    // if(hasUser)
    // {
        //   throw new HttpError('Users already eixst',422)
        // }
        // const createUsers={
        //    id:Math.random(),
        //    name,
        //    email,
        //    password
        // };
        let existingUser;
        try {
        
        existingUser=await User.findOne({email:email})
    } catch (error) {
        const err=new HttpError(' signup failed',500)
        return next(err);
    }
    if(existingUser)
    {
        const err=new HttpError('user already exist',422)
        return next(err);
    }
    let hashedpassword;
    try{

        hashedpassword=await  bcrypt.hash(password,12);
    }catch(err)
    {
        const error=new HttpError('Could not create user,please try again',500);
        return next(error);
    }

    const createUsers=new User({
        name,
        email,
        image:'httpssdlkglkakm',
        password:hashedpassword,
        places:[]

    })

    try {
        await createUsers.save();
    } catch (error) {
        const err=new HttpError(' sign up failed ',500);
        return next(error);
    }
    let token;
    try{
        token=jwt.sign({userId:createUsers.id,email:createUsers.email},process.env.JWT_KEY,{expiresIn: '1h'});

    }catch(error)
    {
        const err=new HttpError(' sign up failed ',500);
        return next(error);
    }

    
    // DUMMY_USERS.push(createUsers);
    res.status(201).json({userId:createUsers.id,email:createUsers.email,token:token});



}

const login=async (req,res,next)=>{
    const {email,password}=req.body;
    // const identfiedUser=DUMMY_USERS.find((u)=>u.email===email);
    // if(!identfiedUser || identfiedUser.password !== password)
    // {
    //     throw new HttpError('Credentials wrong',401)

    // }
    let identfiedUser;
    try {
    
    identfiedUser=await User.findOne({email:email})
    } catch (error) {
    const err=new HttpError(' loggin  failed',500)
    return next(err);
   }

    if(!identfiedUser)
    {
       const err=new HttpError('invalid vredentials',403);
       return next(err);
    }
    let isValidpassword=false;
    try{
        isValidpassword=await bcrypt.compare(password,identfiedUser.password);

    }catch(err)
    {
        const error=new HttpError('password no match',500);
        return next(error)
    }
    if(!isValidpassword)
    {
        const err=new HttpError('invalid vredentials',403);
        return next(err);

    }
    let token;
    try {
        token=jwt.sign({userId:identfiedUser.id,email:identfiedUser.email},process.env.JWT_KEY,{expiresIn :'1h'})
    } catch (error) {
        const err=new HttpError(' login up failed ',500);
        return next(error);
    }
    res.json({userId:identfiedUser.id,email:identfiedUser.email,token:token});

}

exports.getUsers=getUsers;
exports.login=login;
exports.signup=signup;