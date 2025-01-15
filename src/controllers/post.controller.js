import Post from "../models/post.modle.js";
import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js"
import notification from "../models/notification.model.js";
import Comment from "../models/comment.modle.js";
import { getRecieverSocketId,io } from "../lib/socket.js"

 export const postController = async (req, res) => {
    const { caption, image } = req.body;
    const author = req.user._id
    try {

        if (!caption && !image) return res.status(400).json({ message: "invalid post" }); 


        let cloudImageUrl = "";

        if (image) {
             cloudImageUrl = (await cloudinary.uploader.upload(image)).secure_url
        }

        
        
        const postRef = new Post({ caption, image:cloudImageUrl || " ",author });

        if (postRef) {
            const post = await postRef.save();

            return res.status(200).json({
                message: "post uploaded",
                post:post
            })
        }

        
    } catch (error) {
        console.log(`error in post content ${error.message}`)
        return res.status(400).json({message:"failed to upload post"})
    }
    
}

export const uploadPostImage = async (req, res) => {
    const { image } = req.body;
    
    try {

        if (!image) return res.status(400).json({ message: "select image" })
        
        const uploadRes = await cloudinary.uploader.upload(image);
        
        if (!uploadRes) return res.status(400).json({ message: "Failed to Upload image" })
        
        return res.status(200).json({
            message: "images uploaded",
            image:uploadRes.secure_url
        })

        
        
        
    } catch (error) {
        console.log(`error in upload images ${error.message}`);
        return res.status(400).json({message:"Failed to upload images"})
    }
    
}

export const getPostsController = async (req, res) => {
    
    try {



        const posts = await Post.aggregate([
          { $sample: { size: 10 } },
      {
        $lookup: {
          from: "users", // Name of users collection
          localField: "author", // Field in posts referencing user ID
          foreignField: "_id", // Field in users collection
          as: "authorDetails", // Resultant field
        },
      },
      { $unwind: "$authorDetails" }, // Flatten the authorDetails array
      {
        $project: {
          caption: 1,
              image: 1,
              author: 1,
              likeCount:1,
              commentCount:1,
              shareCount:1,
              views: 1,
              likedBy: 1,
              createdAt:1,
       
          "authorDetails.username": 1,
          "authorDetails.profilePicture": 1,
        },
      },
    ]);

    
        
        // console.log(authersInfo)
        if (!posts) return res.status(400).json({ message: "No Posts" })
        
        return res.status(200).json(posts);
        
    } catch (error) {
        console.log(`error in get post ${error.message}`);
        return res.status(400).json({
            message:"failed to get posts"
        })
    }
}

export const deletePostController = async (req, res) => {
 const { postId } = req.params

    try {
       
        
        const post = await Post.findOneAndDelete({ _id: postId });
        
        if (!post) return res.status(400).json({ message: "Post not found" })
        
        return res.status(200).json({success:true, message: "Post deleted" })
        
    }catch (error) {
        console.log(`error in delete post ${error.message}`);
        return res.status(400).json({ message: "Failed to delete post" })
    }
}
 
export const getComments = async (req,res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ whichPost: postId }).populate("commentedBy", "username profilePicture");
        if(!comments) return res.status(400).json({message:"no comments"})
        return res.status(200).json(comments)
        
    } catch (error) {
        console.log(`error in get Comments ${error.message}`);
        return res.status(400).json({message:"failed to get comments"})
    }
}

export const likePostController = async (req, res) => {
    const { postId } = req.params
    const userId = req.user._id;
    const user = req.user;
  
    try {

        const post = await Post.findOne({ _id: postId });
            let recieverId = getRecieverSocketId(post.author);


        if (!post.likedBy.includes(userId)) { 
            post.likeCount++,
                post.likedBy.push(userId)
            let latestposts = await post.save();
            const notifyRef = new notification({
                user: post.author,
                message: `${user.username} liked your post`,
                postId: postId,
                from: userId
            });

            if (notifyRef) {
                await notifyRef.save();
                        
console.log("recieverId",recieverId)

            io.to(recieverId).emit("notification",notifyRef)

            }
    
          return  res.status(200).json(latestposts);

            

           
            
           
        } else {
           post.likedBy = post.likedBy.filter(id => id === userId);
            
         
   post.likeCount--;
        let latestposts =  await post.save();
             res.status(200).json(latestposts);
        }

        

       
        
    } catch (error) {
        console.log(`error in like ctrl ${error.message}`)
    }
}

export const commentPostController = async (req, res) => { 
    try {
        const { postId } = req.params;
        const { comment:text } = req.body;

        const userId = req.user._id;
        const user = req.user;

        const post = await Post.findOne({ _id: postId });
  let recieverId = getRecieverSocketId(post.author);


        post.comments.push(userId);
        post.commentCount++;

        const latestposts = await post.save();

        const commentRef = new Comment({
            comment: text,
            message: `${user.username} commented on your post ${text}`,          
            whichPost: postId,
            commentedBy: userId
        });

           const notifyRef = new notification({
                user: post.author,
                message: `${user.username} comment your post ${text}`,
                postId: postId,
                from: userId
            });
        if (commentRef) {
            await commentRef.save();
            await notifyRef.save();
            

        io.to(recieverId).emit("notification", notifyRef)
        }
      

        return res.status(200).json({message:"commented"});

    } catch (error) {
        console.log(`error in comment ctrl ${error.message}`)
        return res.status(400).json({ message: "failed to comment" })
     }
}

export const doFollowoController = async (req, res) => {
    const { username } = req.params;
    const userId = req.user._id;
    try {

        const user = await User.findOne({ username }).select("-password -likedBy");
        const user2 = await User.findOne({ _id:userId }).select("following followingCount _id");



        if (!user.followers.includes(userId)) {
            user.followersCount++
            user.followers.push(userId);
           
           
                 user2.followingCount++
                user2.following.push(user._id);
            await user2.save()
                
            

            await user.save()
        } else {
              user.followersCount--
            user.followers = user.followers.filter((e) => e === userId);
      
         
                        user2.followingCount--
                user2.following = user.following.filter((e) => e === user._id);
            await user2.save()
                
            
            
            await user.save()

        }

        return res.status(200).json({message:"ok"})

        
    } catch (error) {
        console.log(`error in follow ${error.message}`);
        res.status(400).json({
            message:"server error follow failed"
        })
    }
}


export const getFollowersDetails = async (req, res) => {
    const { limit } = req.query;
    const userId = req.user._id
    try {
        const data = await User.findById( userId ).select('followers');

       return res.status(200).json(data.followers)
        
    } catch (error) {
        console.log(`error in get followers details ${error.message}`)
        return res.status(400).json({message:"failed to get followes details"})
    }
}


export const getNotification = async (req, res) => { 
    const userId = req.user._id;

    try {
    const data = await notification.aggregate([
        { $match: { user: userId } },
        {
            $lookup: {
                from: "users",
                localField: "from",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        { $unwind: "$userDetails" },
        {
            $project: {
                message: 1,
                postId: 1,
                createdAt: 1,
                "userDetails.username": 1,
                "userDetails.profilePicture": 1
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "postId",
                foreignField: "_id",
                as: "postDetails"
            }
        },
        { $unwind: "$postDetails" },
        {
            $project: {
                message: 1,
                postId: 1,
                createdAt: 1,
                "userDetails.username": 1,
                "userDetails.profilePicture": 1,
                "postDetails.image": 1
            }
        },
        {
            $group: {
                _id: "$postId",
                notifications: { $push: "$$ROOT" }
            }
        },
        { $unwind: "$notifications" },
        {
            $replaceRoot: { newRoot: "$notifications" }
        }
    ]);
        // console.log(data)
        return res.status(200).json(data)
    } catch (error) {
        console.log(`error in get notification ${error.message}`);
        return res.status(400).json({message:"failed to get notification"})
    }
}


export const getAutherPosts = async (req, res) => { 
    const {id} = req.params;

    try {

        const posts = await Post.find({ author: id });

        if (!posts) return res.status(400).json({ message: "no posts found" });

        return res.status(200).json(posts);
        
    } catch (error) {
        console.log(`error in get auther posts ${error.message}`);
        return res.status(400).json({message:"failed to get auther posts"})
    }
}

