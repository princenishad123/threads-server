import mongoose from "mongoose";
const commentsSchema = new mongoose.Schema({

        commentedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // User who commented
          required: true,
  },
  whichPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // Post on which the comment was made
  },
        comment: {
          type: String,
          required: true, // The actual comment text
        },
        createdAt: {
          type: Date,
          default: Date.now, // Timestamp when the comment was created
        },
    
})

const Comment = mongoose.model("Comment", commentsSchema)

export default Comment