require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { HfInference } = require('@huggingface/inference');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize HuggingFace Inference Client
const hf = new HfInference(process.env.HF_TOKEN);

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    email: String,
    title: String,
    content: String,
    summary: String,
    tags: [String],
    sentiment: String,
    createdAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
    postId: String,
    email: String,
    comment: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

// ============ AUTH ENDPOINTS ============

// Register
app.post('/register', async (req,res)=>{
    try {
        const {email,password}=req.body;
        
        if(!email || !password) {
            return res.json({ success: false, message: "Email and password required" });
        }

        const user = new User({ email, password });
        await user.save();
        res.json({ success: true, message:"User Registered Successfully" });
    } catch(err) {
        res.json({ success: false, message: err.message });
    }
});

// Login
app.post('/login', async (req,res)=>{
    try {
        const {email,password}=req.body;
        const user = await User.findOne({email, password});

        if(user){
            res.json({
                success:true,
                email:user.email,
                message:"Login Success ✅"
            });
        }else{
            res.json({
                success:false,
                message:"Invalid Credentials ❌"
            });
        }
    } catch(err) {
        res.json({ success: false, message: err.message });
    }
});

// ============ BLOG POST ENDPOINTS ============

// Create Post (without AI)
app.post('/createPost', async (req,res)=>{
    try {
        const {email,title,content}=req.body;

        const post = new Post({
            email,
            title,
            content
        });

        await post.save();
        res.json({ success: true, message:"Post Created Successfully", postId: post._id });
    } catch(err) {
        res.json({ success: false, message: err.message });
    }
});

// Get All Posts
app.get('/posts', async (req,res)=>{
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch(err) {
        res.json({ error: err.message });
    }
});

// Get Single Post
app.get('/posts/:id', async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        res.json(post);
    } catch(err) {
        res.json({ error: err.message });
    }
});

// Delete Post
app.delete('/deletePost/:id', async (req,res)=>{
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ success: true, message:"Post Deleted" });
    } catch(err) {
        res.json({ success: false, message: err.message });
    }
});

// ============ AI FEATURES ENDPOINTS ============

// 1. Generate Summary (Summarization)
app.post('/ai/summarize', async (req,res)=>{
    try {
        const { content } = req.body;
        
        if(!content || content.length < 20) {
            return res.json({ error: "Content too short to summarize" });
        }

        const summary = await hf.summarization({
            model: "facebook/bart-large-cnn",
            inputs: content,
        });

        res.json({ summary: summary.summary_text });
    } catch(err) {
        res.json({ error: "Summarization failed: " + err.message });
    }
});

// 2. Generate Title
app.post('/ai/generateTitle', async (req,res)=>{
    try {
        const { content } = req.body;
        
        if(!content || content.length < 10) {
            return res.json({ error: "Content too short to generate title" });
        }

        const title = await hf.textGeneration({
            model: "gpt2",
            inputs: content.substring(0, 100),
            parameters: {
                max_new_tokens: 15,
            }
        });

        res.json({ title: title.generated_text });
    } catch(err) {
        res.json({ error: "Title generation failed: " + err.message });
    }
});

// 3. Auto-Tag (Zero-Shot Classification)
app.post('/ai/generateTags', async (req,res)=>{
    try {
        const { content } = req.body;
        
        if(!content || content.length < 20) {
            return res.json({ error: "Content too short to generate tags" });
        }

        const tags = await hf.zeroShotClassification({
            model: "facebook/zero-shot-classification",
            inputs: content.substring(0, 200),
            parameters: {
                candidate_labels: ["Technology", "AI", "Web Development", "Tutorial", "News", "Opinion", "Guide", "Review"],
            }
        });

        const topTags = tags.labels.slice(0, 3);
        res.json({ tags: topTags });
    } catch(err) {
        res.json({ error: "Tag generation failed: " + err.message });
    }
});

// 4. Sentiment Analysis
app.post('/ai/analyzeSentiment', async (req,res)=>{
    try {
        const { content } = req.body;
        
        if(!content || content.length < 5) {
            return res.json({ error: "Content too short for sentiment analysis" });
        }

        const sentiment = await hf.textClassification({
            model: "distilbert-base-uncased-finetuned-sst-2-english",
            inputs: content.substring(0, 512),
        });

        res.json({ 
            sentiment: sentiment[0].label,
            score: sentiment[0].score
        });
    } catch(err) {
        res.json({ error: "Sentiment analysis failed: " + err.message });
    }
});

// ============ COMMENTS ENDPOINTS ============

// Add Comment
app.post('/comment', async (req,res)=>{
    try {
        const {postId, email, comment}=req.body;

        const newComment = new Comment({
            postId,
            email,
            comment
        });

        await newComment.save();
        res.json({ success: true, message:"Comment Added" });
    } catch(err) {
        res.json({ success: false, message: err.message });
    }
});

// Get Comments for Post
app.get('/comments/:postId', async (req,res)=>{
    try {
        const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch(err) {
        res.json({ error: err.message });
    }
});

// ============ HEALTH CHECK ============

app.get('/health', (req,res)=>{
    res.json({ status: "Server running ✅", aiEnabled: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🤖 AI Features enabled with HuggingFace`);
});
