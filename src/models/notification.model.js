import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    read: {
        type: Boolean,
        default: false,
    },
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
  
});

const notification = mongoose.model("Notification", notificationSchema);

export default notification;