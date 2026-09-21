import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title:{type:String, required:true, trim:true},
  category:{type:String, required:true, trim:true},
  gender:{type:String, enum:["Men","Women","Kids"], trim:true},
  price:{type:Number, required:true, min:0},
  oldPrice:{type:Number, required:true, min:0},
  off:{type:Number,  default:0},
  rating:{type:Number, default:0, min:0, max:5},
  reviews:{type:Number, default:0},
  sizes:{type:[String], default:[],},
  colors:{type:[String], default:[]},
  images:{type:[String], required:true},
  description:{type:String, required:true, trim:true},
  stock:{type:Number, default:0, min:0},
  isActive:{type : Boolean, default:true},


},{timestamps:true});

const Product = mongoose.model("Product", productSchema);
export default Product;