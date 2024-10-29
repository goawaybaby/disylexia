const User = require("../models/user");
const{hashP,compareP} =require('../bcrypt/auth')
const jwt =require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const test = (req, res) => {
    res.json('It is working');
};

const registerUser = async (req, res) => {
    try {
        const { username,email, password } = req.body;

        if(!username){
            return res.json({
                error:"please type in your username"
            })
        }

        
        if (!email) {
            return res.json({
                error: "No email entered"
            });
        }

        
        if (!password || password.length < 8) {
            return res.json({
                error: "Password is required and must be at least 8 characters long"
            });
        }

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                error: "You already have an account"
            });
        }

        const hashedP= await hashP(password)

        
        const user = await User.create({ username,email, password: hashedP});

        
        res.json({
            message: "User registered successfully",
            user: {
                username:user.username,
                id: user._id,
                email: user.email
            }
        });
        return res.json(user);
    } catch (error) {
        console.log(error);
    }
};

const loginUser = async (req,res) =>{
    try {
        const {email,password}=req.body;

        const user =await User.findOne({email})
        if(!user){

            return res.json({
                error:'you do not have an account'
            })
        }
        const match =await compareP(password,user.password)
        if(match){
            const sessionId = uuidv4();
            const loginTime = new Date();
            user.sessions.push({ sessionId, loginTime });
            await user.save();
            jwt.sign({
                username:user.username,
                email: user.email,
                id:user._id,
                loginTime:new Date().toISOString(),
                sessionId: user.sessionId,
                },
                process.env.JWT_SECRET,{},(err,token)=>{
                    if(err)throw err;
                    res.cookie('token',token).json(user)
                })

        }
        if(!match){
            res.json({
                error:"incorrect password"
            })
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    test,
    registerUser,
    loginUser

};
