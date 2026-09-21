import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName:{ type:String, require:true, trim:true},
  email:{type:String, require:true,unique:true, lowercase:true, trim:true},
  phone:{type:String, require:true,trim:true},
  password:{type:String, required: true, minlength:true},
  role:{type:String, enum:["user","admin"], default:"user"},
  isBlocked:{type:Boolean, default:false},
  isVerified:{type : Boolean, default:false},
  otp:{
    type:String,default:null
  },
  otpExpire:{type:Date, default:null},
  profileImage:{
    type:String, default:""
  },
  adress:[
    {name:{
      type:String,
      trim:true
    },
    phone:{type: String, trim:true},
    adressLine:{
      type:String, trim:true
    },
    city:{
      type:String,
      trim:true
    },
    state:{type:String, trim:true},
    pincode:{type : String, trim:true},
    isDefault:{type:Boolean, default:false},
    
  
  },
  ],
}, {timestamps:true}
); 

const User = mongoose.model("User", userSchema)

export default User;