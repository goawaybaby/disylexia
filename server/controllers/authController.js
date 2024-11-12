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
        
    } catch (error) {
        console.log(error);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                error: 'You do not have an account'
            });
        }

        const match = await compareP(password, user.password);
        if (match) {
            const sessionId = uuidv4();
            const loginTime = new Date();
            // Push the new session into the user's session array
            user.sessions.push({ sessionId, loginTime });
            await user.save();  // Save the user with the new session

            // Sign the JWT with the correct sessionId and loginTime
            jwt.sign(
                {
                    username: user.username,
                    email: user.email,
                    id: user._id,
                    loginTime: loginTime.toISOString(),
                    sessionId: sessionId, // Use the new sessionId here
                },
                process.env.JWT_SECRET,
                {},
                (err, token) => {
                    if (err) throw err;
                    // Send the token as a cookie and return user data as response
                    res.cookie('token', token, { httpOnly: true }).json(user);
                }
            );
        } else {
            res.json({
                error: "Incorrect password"
            });
        }
    } catch (error) {
        console.log(error);
    }
};

const getProfile =(req,res)=>{
const {token} =req.cookies
if(token){
    jwt.verify(token,process.env.JWT_SECRET,{},(err,user)=>{
        if(err) throw err;
        console.log(user)
        res.json(user)
    })
}else{
    console.log(user)
    res.json(null)
}
}

const logoutUser = async (req, res) => {
    const { token } = req.cookies;
    
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({ error: 'Invalid token' });

            const user = await User.findById(decoded.id);
            if (user) {
                
                const lastSession = user.sessions[user.sessions.length - 1];
                if (lastSession) {
                    lastSession.logoutTime = new Date();
                }

                await user.save();

                res.clearCookie('token');
                return res.json({ message: 'Logged out successfully' });
            }
        });
    } else {
        return res.status(400).json({ error: 'No token found' });
    }
};




module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile,
    logoutUser

};
