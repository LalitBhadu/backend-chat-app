const jwt = require('jsonwebtoken')
const User = require("../models/userModel");
const asyncHandler =  require("express-async-handler");

const protect = asyncHandler(async(req, res, next) => {
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try{
            token = req.headers.authorization.split(" ")[1];

            //decodede token id
            const decodede = jwt.verify(token, process.env.JWT_TOKEN);

            req.user = await User.findById(decodede.id).select("-password");

            next();
        }catch (error){
            res.status(401);
            throw new Error("Not  Authorized, token failed");
        }
    }
    if(!token){
        res.status(401);
        throw new Error("Not  Authorized, No token")
    }
});


module.exports = {protect};