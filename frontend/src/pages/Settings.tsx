import { useState } from 'react';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    matchReminders: true,
    teamInvites: true,
    friendRequests: true,
  });

  return (
    <div className="settings">
      <header className="header">
        <h1 className="header-title">Settings</h1>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button className={`tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
          Notifications
        </button>
        <button className={`tab ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>
          Privacy
        </button>
        <button className={`tab ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
          Account
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" defaultValue="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" defaultValue="john.doe@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" defaultValue="+1 234 567 8900" />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" defaultValue="New York, NY" />
            </div>
            <button className="btn btn-primary">Save Changes</button>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Sports Preferences</h3>
            <div className="form-group">
              <label className="form-label">Primary Sport</label>
              <select className="form-input">
                <option value="futsal">Futsal</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Skill Level</label>
              <select className="form-input">
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3" selected>Advanced</option>
                <option value="4">Professional</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sport Preferences</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input type="checkbox" defaultChecked /> Futsal
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input type="checkbox" defaultChecked /> Basketball
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input type="checkbox" /> Tennis
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input type="checkbox" /> Volleyball
                </label>
              </div>
            </div>
            <button className="btn btn-primary">Save Preferences</button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Email Notifications</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Receive updates via email</p>
              </div>
              <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({...notifications, email: e.target.checked})} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Push Notifications</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Receive push notifications</p>
              </div>
              <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({...notifications, push: e.target.checked})} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Match Reminders</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Get reminded before matches</p>
              </div>
              <input type="checkbox" checked={notifications.matchReminders} onChange={(e) => setNotifications({...notifications, matchReminders: e.target.checked})} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Team Invites</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Notify when invited to a team</p>
              </div>
              <input type="checkbox" checked={notifications.teamInvites} onChange={(e) => setNotifications({...notifications, teamInvites: e.target.checked})} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Friend Requests</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Notify for new friend requests</p>
              </div>
              <input type="checkbox" checked={notifications.friendRequests} onChange={(e) => setNotifications({...notifications, friendRequests: e.target.checked})} />
            </label>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Save Preferences</button>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Privacy Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Profile Visible</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Anyone can view your profile</p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Show Online Status</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Let others see when you're online</p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Allow Friend Requests</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Anyone can send you friend requests</p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Show in Leaderboards</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Display your stats publicly</p>
              </div>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Save Privacy Settings</button>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Change Password</h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" />
            </div>
            <button className="btn btn-primary">Update Password</button>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem', color: 'var(--danger)' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="btn btn-danger">Delete Account</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;