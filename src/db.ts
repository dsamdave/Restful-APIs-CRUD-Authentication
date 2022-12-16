const mongoose  = require ("mongoose");
const dotenv = require ("dotenv")
dotenv.config()

const URI = `${process.env.MONGODB_URL}`

const connectDB = async () => {
    await mongoose.connect(URI, (err)=>{
        if(err) throw err
        console.log("MongoDB connected")
    })
}

module.exports = connectDB