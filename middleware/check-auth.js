const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");


module.exports=(req,res,next)=>{
    if(req.method === 'OPTIONS')
    {
        return next();
    }
    try {
        const token=req.headers.authorization.split(' ')[1];
    if(!token)
    {
        throw new Error('Authentication falied');
    }
    const decodeToken=jwt.verify(token,'supersecret_dont_share');
    req.userData={userId:decodeToken.userId}
    next();
    } catch (error) {
        const err=new HttpError('authentication failed',401);
        return next(err)
    }
    


};