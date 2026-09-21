import mongoose from "mongoose";

const categorySchema= new mongoose.Schema({
  title:{
    type:String,
    required:true,
    unique:true,
    trim:true
  },
  gender:{
    type:String,
    enum:["Men","Women","Kids"],
    required:true
  },
  image:{
    type:String,
    default:""
  },
  isActive:{
    type:Boolean,
    default:true,

  },
},{timestamps:true});

const Category= mongoose.model("Category", categorySchema)
export default Category;