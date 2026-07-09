import React, { useState } from 'react';
import axios from 'axios';
import '../styles/BlogEditor.css';

function BlogEditor({ currentUser, onPostCreated, apiUrl }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState([]);
  const [sentiment, setSentiment] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({
    title: false,
    summary: false,
    tags: false,
    sentiment: false
  });
  const [error, setError] = useState('');

  const generateAITitle = async () => {
    if (!content.trim()) {
      setError('Please write some content first');
      return;
    }
    setAiLoading({...aiLoading, title: true});
    try {
      const response = await axios.post(`${apiUrl}/ai/generateTitle`, { content });
      setSuggestedTitle(response.data.title || response.data.error);
    } catch(err) {
      setError('Failed to generate title');
    } finally {
      setAiLoading({...aiLoading, title: false});
    }
  };

  const generateSummary = async () => {
    if (!content.trim()) {
      setError('Please write some content first');
      return;
    }
    setAiLoading({...aiLoading, summary: true});
    try {
      const response = await axios.post(`${apiUrl}/ai/summarize`, { content });
      setSummary(response.data.summary || response.data.error);
    } catch(err) {
      setError('Failed to generate summary');
    } finally {
      setAiLoading({...aiLoading, summary: false});
    }
  };

  const generateTags = async () => {
    if (!content.trim()) {
      setError('Please write some content first');
      return;
    }
    setAiLoading({...aiLoading, tags: true});
    try {
      const response = await axios.post(`${apiUrl}/ai/generateTags`, { content });
      setTags(response.data.tags || []);
    } catch(err) {
      setError('Failed to generate tags');
    } finally {
      setAiLoading({...aiLoading, tags: false});
    }
  };

  const analyzeSentiment = async () => {
    if (!content.trim()) {
      setError('Please write some content first');
      return;
    }
    setAiLoading({...aiLoading, sentiment: true});
    try {
      const response = await axios.post(`${apiUrl}/ai/analyzeSentiment`, { content });
      setSentiment(`${response.data.sentiment} (${(response.data.score * 100).toFixed(1)}%)`);
    } catch(err) {
      setError('Failed to analyze sentiment');
    } finally {
      setAiLoading({...aiLoading, sentiment: false});
    }
  };

  const useSuggestedTitle = () => {
    setTitle(suggestedTitle);
    setSuggestedTitle('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${apiUrl}/createPost`, {
        email: currentUser,
        title,
        content
      });

      setTitle('');
      setContent('');
      setSuggestedTitle('');
      setSummary('');
      setTags([]);
      setSentiment('');
      onPostCreated();
    } catch(err) {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-editor">
      <h2>✍️ Create New Blog Post</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your blog title"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here..."
            rows="8"
            disabled={loading}
          />
        </div>

        <div className="ai-features">
          <h3>🤖 AI Features</h3>
          <div className="ai-buttons">
            <button
              type="button"
              onClick={generateAITitle}
              disabled={aiLoading.title || !content.trim()}
              className="ai-btn"
            >
              {aiLoading.title ? '⏳ Generating...' : '💡 Generate Title'}
            </button>
            <button
              type="button"
              onClick={generateSummary}
              disabled={aiLoading.summary || !content.trim()}
              className="ai-btn"
            >
              {aiLoading.summary ? '⏳ Summarizing...' : '📝 Generate Summary'}
            </button>
            <button
              type="button"
              onClick={generateTags}
              disabled={aiLoading.tags || !content.trim()}
              className="ai-btn"
            >
              {aiLoading.tags ? '⏳ Tagging...' : '🏷️ Generate Tags'}
            </button>
            <button
              type="button"
              onClick={analyzeSentiment}
              disabled={aiLoading.sentiment || !content.trim()}
              className="ai-btn"
            >
              {aiLoading.sentiment ? '⏳ Analyzing...' : '😊 Analyze Sentiment'}
            </button>
          </div>

          {suggestedTitle && (
            <div className="ai-result">
              <p><strong>💡 Suggested Title:</strong> {suggestedTitle}</p>
              <button type="button" onClick={useSuggestedTitle} className="use-btn">
                Use This Title
              </button>
            </div>
          )}

          {summary && (
            <div className="ai-result">
              <p><strong>📝 Summary:</strong></p>
              <p className="summary-text">{summary}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="ai-result">
              <p><strong>🏷️ Suggested Tags:</strong></p>
              <div className="tags">
                {tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {sentiment && (
            <div className="ai-result">
              <p><strong>😊 Sentiment:</strong> {sentiment}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="publish-btn"
          disabled={loading}
        >
          {loading ? '⏳ Publishing...' : '🚀 Publish Post'}
        </button>
      </form>
    </div>
  );
}

export default BlogEditor;
