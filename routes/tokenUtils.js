// Utility File for creating the tokens for login and logout
const router = require("express").Router();
const Admin = require("../models/admin");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const tokenVerifier = async (token) => {
    const tokenKey = 'token';
    try{
        const decoded = jwt.verify(token, tokenKey);
        const operator = await Admin.findOne({userName: decoded.userName});
        if(operator && operator.token.includes(token)){
            return(decoded);
        }
        return(null);
    }
    catch{
        return(null);
    }
}

const applicationTokenVerifier = async (token) => {
    const tokenKey = 'token';
    try{
        const decoded = jwt.verify(token, tokenKey);
        console.log('decoded', decoded)
        const user = await User.findOne({username: decoded.username});
        if(user){
            return(decoded);
        }
        return(null);
    }
    catch{
        return(null);
    }
}

module.exports = {
    tokenVerifier: tokenVerifier,
    applicationTokenVerifier: applicationTokenVerifier
};