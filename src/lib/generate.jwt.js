import jwt from 'jsonwebtoken'

export const generateJwt = (userId,res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

    res.cookie("token",token,{
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 * 1000,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    })

    return token
 }
