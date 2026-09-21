import mongoose from "mongoose";
const cartItemSchema = new mongoose.Schema({
  productId:{
    type:mongoose.Schema.ObjectId,
    ref:"Product",
    required:true
  },
  quantity:{
    type:Number,
    required:true,
    min:1,
    default:1,
  },
  selectedColor:{
    type:String,
    required:true
  },
  selectSize:{
    type:String,
    required:true,
  }
},{
  _id:false
});

const cartSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    unique:true,
  },
  product:{
    type:[cartItemSchema],
    default:[],
  },

},{timestamps:true}
);

const Cart = mongoose.model("Cart", cartSchema)

export default Cart;