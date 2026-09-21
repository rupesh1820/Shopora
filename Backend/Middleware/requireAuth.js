import jwt from "jsonwebtoken";

const requireAuth = (req, res, next)=>{
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
      return res.status(401).json({
        success:false,
        message:"Authentiaction required",
      });

    }

    const decode = jwt.verify(token, process.env.JWT_SECRET
    );
    req.user = decode;
    next();

  } catch (error) {
     return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
export default requireAuth;
