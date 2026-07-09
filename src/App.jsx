import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState('');
  const [showAuth, setShowAuth] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch(err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (email) => {
    setCurrentUser(email);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setCurrentUser('');
    setShowAuth(true);
    setPosts([]);
  };

  const handlePostCreated = () => {
    loadPosts();
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1>📝 AI-Powered Blog Platform</h1>
          {currentUser && (
            <div className="user-info">
              <span>👤 {currentUser}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {showAuth ? (
          <AuthForm onLoginSuccess={handleLogin} />
        ) : (
          <div className="dashboard">
            <BlogEditor 
              currentUser={currentUser} 
              onPostCreated={handlePostCreated}
              apiUrl={API_URL}
            />
            <BlogList 
              posts={posts}
              currentUser={currentUser}
              onPostDeleted={handlePostDeleted}
              onPostsUpdated={loadPosts}
              apiUrl={API_URL}
              loading={loading}
            />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>🚀 Built with React + HuggingFace AI | Modern Blogging Platform</p>
      </footer>
    </div>
  );
}

export default App;
