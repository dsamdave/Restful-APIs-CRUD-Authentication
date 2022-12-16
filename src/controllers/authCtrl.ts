const Users = require("../model/authModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const res = require("express/lib/response")
const sendUserMail = require("../utilities/sendMail")

const generateAccessToken =(payload)=>{
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn: "5m"})
}

const generateRefreshToken =(payload)=>{
    return jwt.sign(payload, process.env.REFRESH_TOKEN, {expiresIn: "5d"})
    // res.cookie('refreshtoken', refresh_token, {
        //     httpOnly: true,
        //     path: '/user/refresh_token',
        //     maxAge: 7*24*60*60*1000  7 days
        // })
}

const generateActiveToken =(payload)=>{
    return jwt.sign(payload, process.env.ACTIVE_TOKEN, {expiresIn: "24h"})
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
}


const auth = {
    register: async(req, res)=>{
        try {
            const {name, email, password, cf_password} = req.body

            if(!name || !email || !password || !cf_password)
                return res.status(400).json({msg: "Please enter all fields!"})

            if(password !== cf_password)
                return res.status(400).json({msg: "Confirm password does not match!"})

            const validEmail = validateEmail(email)
            if(!validEmail) return res.status(400).json({msg: "Enter a valid email!"})

            const alreadExist = await Users.findOne({email: email})
            if(alreadExist) return res.status(400).json({msg: "This user already exist!"})

            const hashedPassword = await bcrypt.hash(password, 12)

            const newUser = new Users({name, email, password: hashedPassword})

            const accessToken = generateAccessToken({newUser})
            const refreshToken = generateRefreshToken({newUser})

            await newUser.save()

            return res.status(200).json({
                msg: "Registration succesful!",
                newUser,
                accessToken,
                refreshToken
            })
            
        } catch (error) {
            return res.status(500).json({msg: error.message}) 
        }
    },

    login: async (req, res)=>{
        try {
            const { email, password } = req.body

            if(!email || !password)
                return res.status(400).json({msg: "Please enter email & password!"})
            
            const validEmail = validateEmail(email)
            if(!validEmail) return res.status(400).json({msg: "Enter a valid email!"})

            const user = await Users.findOne({email})

            if(!user) return res.status(400).json({msg: "No such user!"})

            const isMatch = await bcrypt.compare(password, user.password)
            
            if(!isMatch) return res.status.json({msg: "Incorrect email or password"})

            const accessToken = generateAccessToken({user})
            const refreshToken = generateRefreshToken({user})

            return res.status(200).json({
                msg: "Login succesful",
                name: user.name,
                email: user.email,

                // user: {...user, password: ""},
                accessToken,
                refreshToken

            })

        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    getAllUsers: async (req, res)=>{
        try {
            const allUsers = await Users.find()

            if(!allUsers) return res.status.json({msg: "No users to show!"})

            return res.status(200).json(allUsers)
            
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    getAccessToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken

            if(!rf_token) return res.status(400).json({msg: "Please login now!"})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN, (err, user) =>{

                if(err) return res.status(400).json({msg: "Please login now!"})

                const access_token = generateAccessToken({user})
                const rf_token = generateRefreshToken({user})

                return res.status(200).json({
                    access_token,
                    rf_token
                })
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    forgotPassword: async (req, res) => {
        try {

            const {email} = req.body

            if(!email) return res.status.json({msg: "Please enter your email!"})

            const user = await Users.findOne({email})

            if(!user) return res.status(400).json({msg: "This email does not exist."})

            const active_token = generateActiveToken({user})

            const url = `www.yourwebsite.com/user/reset/${active_token}`

            await sendUserMail(email, url, res)

            console.log(email);

            // return res.status(200).json({msg: "Re-send the password, please check your email."})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    resetPassword: async (req, res) => {
        try {

            const { password } = req.body

            if(!password) return res.status(400).json({msg: "Please enter password!"})
            
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({_id: req.user.id}, { password: passwordHash })

            return res.status(200).json({msg: "Password successfully changed!"})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },


}

module.exports = auth