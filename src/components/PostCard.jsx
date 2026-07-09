import React from 'react';
import '../styles/PostCard.css';

function PostCard({ 
  post, 
  isExpanded, 
  onToggleExpand, 
  onDelete, 
  onAddComment,
  newComment,
  setNewComment,
  postComments,
  canDelete
}) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`post-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="post-header">
        <h3>{post.title}</h3>
        <span className="post-date">📅 {formatDate(post.createdAt)}</span>
      </div>

      <div className="post-meta">
        <span className="post-author">✍️ {post.email}</span>
        {post.sentiment && (
          <span className={`sentiment ${post.sentiment.toLowerCase()}`}>
            {post.sentiment === 'POSITIVE' ? '😊' : '😐'} {post.sentiment}
          </span>
        )}
      </div>

      <div className="post-content">
        <p>{post.content.substring(0, 150)}...</p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="post-expanded">
          <div className="full-content">
            <h4>Full Content:</h4>
            <p>{post.content}</p>
          </div>

          {post.summary && (
            <div className="post-summary">
              <h4>📝 Summary:</h4>
              <p>{post.summary}</p>
            </div>
          )}

          <div className="comments-section">
            <h4>💬 Comments ({postComments.length})</h4>
            
            <div className="comments-list">
              {postComments.length > 0 ? (
                postComments.map((comment, idx) => (
                  <div key={idx} className="comment">
                    <p className="comment-email"><strong>{comment.email}</strong></p>
                    <p className="comment-text">{comment.comment}</p>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet</p>
              )}
            </div>

            <div className="add-comment">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                onKeyPress={(e) => e.key === 'Enter' && onAddComment()}
              />
              <button onClick={onAddComment} className="comment-btn">
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="post-actions">
        <button onClick={onToggleExpand} className="expand-btn">
          {isExpanded ? '🔼 Show Less' : '🔽 Read More'}
        </button>
        {canDelete && (
          <button onClick={onDelete} className="delete-btn">
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default PostCard;
