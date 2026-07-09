import React, { useState } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import '../styles/BlogList.css';

function BlogList({ posts, currentUser, onPostDeleted, onPostsUpdated, apiUrl, loading }) {
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${apiUrl}/deletePost/${postId}`);
        onPostDeleted(postId);
      } catch(err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  const toggleExpand = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      // Load comments if not already loaded
      if (!comments[postId]) {
        try {
          const response = await axios.get(`${apiUrl}/comments/${postId}`);
          setComments({...comments, [postId]: response.data});
        } catch(err) {
          setComments({...comments, [postId]: []});
        }
      }
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    try {
      await axios.post(`${apiUrl}/comment`, {
        postId,
        email: currentUser,
        comment: commentText
      });
      setNewComment({...newComment, [postId]: ''});
      // Reload comments
      const response = await axios.get(`${apiUrl}/comments/${postId}`);
      setComments({...comments, [postId]: response.data});
    } catch(err) {
      console.error('Failed to add comment:', err);
    }
  };

  if (loading) {
    return <div className="blog-list"><p>📖 Loading posts...</p></div>;
  }

  return (
    <div className="blog-list">
      <h2>📚 Blog Posts ({posts.length})</h2>
      
      {posts.length === 0 ? (
        <div className="no-posts">
          <p>No blog posts yet. Be the first to write one! ✍️</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              isExpanded={expandedPost === post._id}
              onToggleExpand={() => toggleExpand(post._id)}
              onDelete={() => handleDeletePost(post._id)}
              onAddComment={() => handleAddComment(post._id)}
              newComment={newComment[post._id] || ''}
              setNewComment={(text) => setNewComment({...newComment, [post._id]: text})}
              postComments={comments[post._id] || []}
              canDelete={post.email === currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogList;
