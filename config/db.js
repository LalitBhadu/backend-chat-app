const mongoose = require("mongoose");

const connectDB = async() =>{
    try{
        const conn = await mongoose.connect(process.env.ATLAS_URI, {
            useNewUrlParser:true,
            useUnifiedTopology:true,
        })
        console.log(`MongoDB Connection: ${conn.connection.host}`)        
    } catch(error){
        console.log(`MongoDB connection Faild:${error.message}`);
        process.exit()
    };
};

module.exports = connectDB;