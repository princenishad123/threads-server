import { generateJwt } from "../lib/generate.jwt.js";
import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import cloudinary from "../lib/cloudinary.js"
export const signupController = async (req, res) => {
    const { username, email, password } = req.body;
    try {

        if (!username || !email || !password) return res.status(406).json({
            message:"all fields Required !"
        })

         const isUser = await User.findOne({ email }).select("-following -followers -password")
        
        if (isUser) {
            return res.status(400).json({
                message: "Email already Registered."
            });
        } else {
            const isUsername = await User.findOne({ username }).select("username")
            
            if (isUsername) return res.status(400).json({
                message: "Username taken"
            })
         }
        
        const hashedPassword = await bcrypt.hash(password.toString(), 10)
        
        const userRef = new User({ email, password: hashedPassword, username })
        
        
        if (userRef) {
            await generateJwt(userRef._id, res);
            userRef.save()

          return res.status(201).json({
              message: "Sign up Successfull",
              username: userRef.username,
              profilePicture: userRef.profilePicture,
              email: userRef.email,
              fullName: userRef.fullName,
              userId:userRef._id
               
        })
        } else {
            return res.status(200).json({
                message:"invalid user data"
            })
        }

       


        
    } catch (error) {
        console.log(`error in sign up ctrl ${error}`)
        res.status(500).json({
            message:"Server error failed to Sign-up"
        })
    }
    
}


export const loginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({
            message:"all field required "
        })

        const isUser = await User.findOne({ email }).select("-following -followers")
        if (!isUser) return res.status(400).json({
            message:"invalid email or password"
        })

        const passwordMatched = await bcrypt.compare(password, isUser.password);

        if (!passwordMatched) return res.status(400).json({
            message: "invalid email or password"
        });

        generateJwt(isUser._id, res);


        return res.status(200).json({
            message: "login Success",
            fullName: isUser.fullName,
            email: isUser.email,
            userId: isUser._id,
            profilePicture: isUser.profilePicture,
            username:isUser.username,
        
        })

        
    } catch (error) {
        console.log(`error in login ctrl ${error.message}`)
       return res.status(400).json({
            message:"internal server error"
        })
    }
}


export const logoutController = async (req,res) => {
    try {

        res.cookie("token", "",{
            maxAge:0
        })

        return res.status(200).json({
            message:"your are log out"
        })
        
    } catch (error) {
        console.log(`error in logout`)
        return res.status(406).json({
            message:"failed to logout"
        })
    }
}


export const checkAuthController = async (req, res) => {
    
    try {

        return res.status(200).json(req.user)
        
    } catch (error) {
        console.log(`error in check auth ctrl ${error.message}`);
      return  res.status(400).json({
            message:"error in server"
        })
    }
    
} 

export const updateUserController = async (req, res) => {
    
    const userId = req.user._id

    try {
        const { fullName, profilePicture, username, bio } = req.body;
        if (!userId) return res.status(400).json({ message: "invalid user" })
        
       const uploadRes = await cloudinary.uploader.upload(profilePicture)
        
        const updatedData = await User.findByIdAndUpdate(userId, { fullName, profilePicture:uploadRes.secure_url, username, bio }).select("-password -followers -following")
        
        if (!updatedData) return res.status(400).json({ message: "fail to update" })
        
        res.json({
            message: "Profile updated !",
            updatedData
        })
        
    } catch (error) {
        console.log(`error in update user ${error.message}`)

        res.status(400).json({
            message:"'failed to update profile"
        })
    }
    
}

export const uploadProfilePicture = async (req, res) => {
    const { profilePicture } = req.body;
    try {

        if (!profilePicture) return res.status(400).json({ message: "Select Image" });

        const uploadRes = await cloudinary.uploader.upload(profilePicture);

        if (!uploadRes) return res.status(400).json({ message: "Coudn't upload image" });

        return res.status(201).json({
            message: "profile picture updated",
            image_url:uploadRes.secure_url
        })
    } catch (error) {
        console.log(`error in upload images ${error}`)
        return res.status(400).json({
            message:"Failed to upload profile"
        })
    }
    
}


export const getUserByUsername = async (req, res) => {
    const { username } = req.params; 
    try {

        const user = await User.findOne({ username: username }).select("-password -email");
        
        const followers = await User.find({ _id: { $in: user.followers } })
            .select("profilePicture")
            .limit(5);
      
        
    
        if (!user) return res.status(400).json({ message: "User not found" });

        return res.status(200).json({user,followers})
        
    } catch (error) {
        console.log(`error in find user ${error.message}`)

        return res.status(400).json({
            message:"Server Error"
        })
    }
}

export const findUserByUsername = async (req, res) => { 
    const { username,limit } = req.query;
  


    try {
        const users = await User.find({ username: { $regex: username, $options: "i" } })
            .select("-password -email -followers -following").limit(parseInt(limit));

    // console.log(users)

        if (!users.length) return res.status(400).json({ message: "No users found" });

        return res.status(200).json({
            success: true,
            users,
        });
        
    } catch (error) {
        console.log(`Error in find user: ${error.message}`);
        return res.status(500).json({
            message: "Server Error",
        });
    }
};

