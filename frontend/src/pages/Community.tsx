import { useState } from 'react';

function Community() {
  const [activeTab, setActiveTab] = useState('forum');
  const [newPost, setNewPost] = useState('');

  const forumPosts = [
    { id: 1, author: 'John Doe', title: 'Best futsal courts in the city?', content: 'Looking for recommendations for futsal courts with good lighting and parking.', replies: 12, time: '2 hours ago' },
    { id: 2, author: 'Sarah K.', title: 'Basketball league starting next month', content: 'Anyone interested in joining a recreational basketball league?', replies: 8, time: '5 hours ago' },
    { id: 3, author: 'Mike J.', title: 'Tips for improving stamina', content: 'What are your go-to exercises for building endurance?', replies: 15, time: '1 day ago' },
  ];

  const chatRooms = [
    { id: 1, name: 'Futsal Players', members: 156, active: 23, lastMessage: 'Anyone up for a match tonight?' },
    { id: 2, name: 'Basketball League', members: 89, active: 12, lastMessage: 'Game time confirmed for Saturday' },
    { id: 3, name: 'Tennis Enthusiasts', members: 64, active: 8, lastMessage: 'Looking for a tennis partner' },
    { id: 4, name: 'Weekend Warriors', members: 234, active: 45, lastMessage: 'Who\'s hosting this weekend?' },
  ];

  return (
    <div className="community">
      <header className="header">
        <h1 className="header-title">Community</h1>
        <div className="header-actions">
          <button className="btn btn-primary">+ New Post</button>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'forum' ? 'active' : ''}`} onClick={() => setActiveTab('forum')}>
          Forum
        </button>
        <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          Chat Rooms
        </button>
        <button className={`tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          Events
        </button>
      </div>

      {activeTab === 'forum' && (
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <textarea
                className="form-input"
                placeholder="Share something with the community..."
                rows={3}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline">Cancel</button>
              <button className="btn btn-primary">Post</button>
            </div>
          </div>
          <div className="card">
            {forumPosts.map((post) => (
              <div key={post.id} className="match-card" style={{ display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{post.author}</strong>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{post.time}</span>
                  </div>
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>{post.title}</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{post.content}</p>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <span>💬 {post.replies} replies</span>
                  <button className="btn btn-outline btn-sm">Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="chat-container">
          <div className="chat-rooms">
            {chatRooms.map((room) => (
              <div key={room.id} className="chat-room">
                <div style={{ fontWeight: 600 }}>{room.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {room.members} members | {room.active} online
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {room.lastMessage}
                </div>
              </div>
            ))}
          </div>
          <div className="chat-messages">
            <div className="chat-messages-list">
              <div className="chat-message">
                <div className="chat-message-sender">John Doe</div>
                <div className="chat-message-content">Hey everyone! Anyone up for a futsal match tonight?</div>
              </div>
              <div className="chat-message">
                <div className="chat-message-sender">Sarah K.</div>
                <div className="chat-message-content">I'm in! What time?</div>
              </div>
              <div className="chat-message">
                <div className="chat-message-sender">Mike J.</div>
                <div className="chat-message-content">Count me in too! 8 PM works?</div>
              </div>
            </div>
            <div className="chat-input">
              <input type="text" className="form-input" placeholder="Type a message..." />
              <button className="btn btn-primary">Send</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-3">
          <div className="card">
            <span className="badge badge-info">This Weekend</span>
            <h3 className="card-title" style={{ marginTop: '0.5rem' }}>City Futsal Tournament</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Annual futsal tournament open to all skill levels</p>
            <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              <div>📅 Jan 30-31, 2026</div>
              <div>📍 Sports Arena A</div>
              <div>💵 Entry: $50/team</div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>Register</button>
          </div>
          <div className="card">
            <span className="badge badge-warning">Upcoming</span>
            <h3 className="card-title" style={{ marginTop: '0.5rem' }}>Basketball League</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Recreational basketball league starting next month</p>
            <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              <div>📅 Feb 15 - Apr 15, 2026</div>
              <div>📍 City Gym</div>
              <div>💵 Entry: $100/team</div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>Register</button>
          </div>
          <div className="card">
            <span className="badge badge-success">Open</span>
            <h3 className="card-title" style={{ marginTop: '0.5rem' }}>Tennis Open Day</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Casual tennis meetup for all levels</p>
            <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              <div>📅 Every Saturday</div>
              <div>📍 Tennis Center</div>
              <div>💵 Free</div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>Join</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;