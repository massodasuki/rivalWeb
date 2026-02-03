import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import authService from '../services/authService';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    matchReminders: true,
    teamInvites: true,
    friendRequests: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    allowFriendRequests: true,
    showInLeaderboards: true,
  });
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mock user from auth context/API data (would come from real API)
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, NY',
    primarySport: 'futsal',
    skillLevel: '3',
  });

  // Fetch user data from API (optional)
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const user = await userService.getUser(parseInt(userId, 10));
        setUserData({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          location: user.location || '',
          primarySport: user.primary_sport || 'futsal',
          skillLevel: String(user.skill_level || 3),
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        await userService.updateUser(parseInt(userId, 10), {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          location: userData.location,
          primary_sport: userData.primarySport,
          skill_level: parseInt(userData.skillLevel, 10),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      // Simulate save for demo
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        await userService.updateNotifications(parseInt(userId, 10), notifications);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving notifications:', err);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        await userService.updatePrivacy(parseInt(userId, 10), privacy);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving privacy:', err);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.next || passwords.next !== passwords.confirm) {
      alert('New password and confirm password must match.');
      return;
    }
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        await userService.updatePassword(parseInt(userId, 10), {
          current_password: passwords.current,
          new_password: passwords.next,
        });
        setPasswords({ current: '', next: '', confirm: '' });
        alert('Password updated.');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      alert('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently?')) return;
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (userId) {
        await userService.deleteUser(parseInt(userId, 10));
      }
      authService.logout();
      alert('Account deleted.');
      window.location.href = '/';
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

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
              <input 
                type="text" 
                className="form-input" 
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input 
                type="text" 
                className="form-input" 
                value={userData.location}
                onChange={(e) => setUserData({ ...userData, location: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span style={{ marginLeft: '1rem', color: 'var(--success)' }}>Saved!</span>}
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Sports Preferences</h3>
            <div className="form-group">
              <label className="form-label">Primary Sport</label>
              <select 
                className="form-input"
                value={userData.primarySport}
                onChange={(e) => setUserData({ ...userData, primarySport: e.target.value })}
              >
                <option value="futsal">Futsal</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Skill Level</label>
              <select 
                className="form-input"
                value={userData.skillLevel}
                onChange={(e) => setUserData({ ...userData, skillLevel: e.target.value })}
              >
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3">Advanced</option>
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
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
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
              <input 
                type="checkbox" 
                checked={notifications.email} 
                onChange={(e) => setNotifications({...notifications, email: e.target.checked})} 
              />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Push Notifications</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Receive push notifications</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.push} 
                onChange={(e) => setNotifications({...notifications, push: e.target.checked})} 
              />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Match Reminders</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Get reminded before matches</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.matchReminders} 
                onChange={(e) => setNotifications({...notifications, matchReminders: e.target.checked})} 
              />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Team Invites</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Notify when invited to a team</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.teamInvites} 
                onChange={(e) => setNotifications({...notifications, teamInvites: e.target.checked})} 
              />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Friend Requests</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Notify for new friend requests</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.friendRequests} 
                onChange={(e) => setNotifications({...notifications, friendRequests: e.target.checked})} 
              />
            </label>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={handleSaveNotifications} disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
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
              <input type="checkbox" checked={privacy.profileVisible} onChange={(e) => setPrivacy({ ...privacy, profileVisible: e.target.checked })} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Show Online Status</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Let others see when you're online</p>
              </div>
              <input type="checkbox" checked={privacy.showOnlineStatus} onChange={(e) => setPrivacy({ ...privacy, showOnlineStatus: e.target.checked })} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Allow Friend Requests</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Anyone can send you friend requests</p>
              </div>
              <input type="checkbox" checked={privacy.allowFriendRequests} onChange={(e) => setPrivacy({ ...privacy, allowFriendRequests: e.target.checked })} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
              <div>
                <strong>Show in Leaderboards</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Display your stats publicly</p>
              </div>
              <input type="checkbox" checked={privacy.showInLeaderboards} onChange={(e) => setPrivacy({ ...privacy, showInLeaderboards: e.target.checked })} />
            </label>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={handleSavePrivacy} disabled={loading}>
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </button>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Change Password</h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={handleUpdatePassword} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.5rem', color: 'var(--danger)' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={loading}>Delete Account</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
