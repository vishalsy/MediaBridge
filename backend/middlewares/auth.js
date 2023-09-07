const User=require("../models/User");
const jwt=require("jsonwebtoken");

exports.isAuthenticated=async (req,res,next)=>{
   try {
    const {token}=req.cookies;
    if(!token){
        return res.status(401).json({
             message:"please login first"
        })
    }

    const decoded=await jwt.verify(token,process.env.JWT_SECRET) ;
   
    req.user=await User.findById(decoded._id);
    next();
    
    } catch (error) {
    res.status(500).json({
        message:error.message,
    })
   }
};

// Certainly, here's a concise summary of the JWT verification process:

// 1. **Token Extraction**: Extract the JWT token from the client's request.

// 2. **Verification with `jwt.verify`**: Use `jwt.verify` to validate the token's authenticity.
//    - Checks include signature validation, expiration time, issuer, audience, and custom claims.

// 3. **Decoded Payload**: If valid, `jwt.verify` returns a decoded payload containing user data.

// 4. **Fetch User Data**: Use the decoded data (e.g., user ID) to fetch user information from the database.

// 5. **`req.user`**: Attach user data to `req.user` for use in subsequent middleware or routes.

// The verification step ensures the token's integrity and allows access to authenticated user information.