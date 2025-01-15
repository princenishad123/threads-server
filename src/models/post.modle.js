import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
   image: {
        type:String
    },
    caption: {
        type: String,
         maxlength: 650,
    },
      author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model (author of the thread)
      required: true,
    },
    likeCount: {
        type: Number,
        default:0
    },
    commentCount: {
          type: Number,
        default:0
    },
    sharedCount: {
          type: Number,
        default:0
    },
     views: {
      type: Number,
      default: 0, // Default views count is 0
    },
     
       likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Array of users who liked the thread
      },
  ],
      
       
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the current timestamp
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment', // Array of comment IDs
    },
  ],

})
const Post = mongoose.model("Post", postSchema);

export default Post


