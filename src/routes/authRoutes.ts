
const express = require("express")
const authCtrl = require("../controllers/authCtrl")

const router = express.Router()

router.post("/register", authCtrl.register)

router.post("/login", authCtrl.login)

router.get("/allusers", authCtrl.getAllUsers)

router.get("/refreshtoken", authCtrl.getAccessToken)

router.post("/forgotpassword", authCtrl.forgotPassword)

router.post("/resetpassword", authCtrl.resetPassword)



module.exports = router