import jwt from 'jsonwebtoken'
import User from "../models/user.model.js"
export const protectedRoutes = async (req, res, next) => {
    const token = req.cookies['token'];
    try {

        if (!token) return res.status(400).json({
            message:"Unauthorized User"
        })

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
           
        if (!decoded) return res.status(400).json({ message: "invalid token" })
        
        const user = await User.findById( {_id:decoded.userId}).select("-password -following -followers");
           
        if (!user) return res.status(400).json({ message: "invalid user access denied" })
        
        req.user = user

        next()

        
        
    } catch (error) {
        console.log(`error in verify jwt ${error.message}`)
        return res.status(200).json({
            message:"internal server error"
        })
    }
     
 }