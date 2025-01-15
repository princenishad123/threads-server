import mongoose from "mongoose"

const userShema = new mongoose.Schema({
    fullName: {
        type: String,
        default:""
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    profilePicture: {
        type: String,
        default: '' // URL for the profile picture, optional
    },
    bio: {
        type: String,
        maxlength: 160 // Optional bio with a character limit
    },

    followersCount: {
        type: Number,
        default:0
    },
    followingCount: {
        type: Number,
        default:0
    },

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // List of users this user is following
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // List of users following this user
        }
    ],

}, { timestamps: true });

const User = mongoose.model("User", userShema)

export default User;