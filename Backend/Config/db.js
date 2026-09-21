import mongoose from 'mongoose'

const connectDb=async(req, res)=>{
  try {
    const conect = await mongoose.connect(process.env.MONGODB_URL)
    console.log(`MongoDb connected :  ${conect.connection.host}`)
  } catch (error) {
    console.error("MongoDb conection error", error)
    process.exit(1)
  }
};
export default connectDb