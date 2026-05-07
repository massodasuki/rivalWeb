import { useState, useEffect } from 'react';
import { userService, User } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

function Stats() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [sport, setSport] = useState('all');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data from API on mount
  const fetchUserData = async () => {
    const userId = authUser?.id;
    if (!userId) return;
    try {
      setLoading(true);
      const userData = await userService.getUser(userId);
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id]);

  // Mock data for leaderboard and achievements (would need separate endpoints)
  const personalStats = {
    overall: { matches: 24, wins: 18, losses: 6, goals: 42, assists: 15, rating: 4.2 },
    futsal: { matches: 15, wins: 12, losses: 3, goals: 28, assists: 8, rating: 4.5 },
    basketball: { matches: 9, wins: 6, losses: 3, goals: 14, assists: 7, rating: 3.9 },
  };

  const leaderboard = [
    { rank: 1, name: 'John Doe', sport: 'Futsal', rating: 4.8, wins: 32, points: 156 },
    { rank: 2, name: 'Sarah K.', sport: 'Basketball', rating: 4.7, wins: 28, points: 142 },
    { rank: 3, name: 'Mike J.', sport: 'Futsal', rating: 4.6, wins: 25, points: 138 },
    { rank: 4, name: 'Emily R.', sport: 'Tennis', rating: 4.5, wins: 22, points: 125 },
    { rank: 5, name: 'You', sport: 'Futsal', rating: 4.2, wins: 18, points: 98 },
    { rank: 6, name: 'Alex T.', sport: 'Basketball', rating: 4.1, wins: 16, points: 92 },
    { rank: 7, name: 'Chris L.', sport: 'Futsal', rating: 4.0, wins: 14, points: 85 },
    { rank: 8, name: 'Diana M.', sport: 'Tennis', rating: 3.9, wins: 12, points: 78 },
  ];

  const achievements = [
    { id: 1, name: 'First Win', description: 'Won your first match', earned: true, icon: '🏆' },
    { id: 2, name: 'Hat Trick', description: 'Scored 3 goals in one match', earned: true, icon: '⚽' },
    { id: 3, name: 'Team Player', description: 'Joined 5 teams', earned: true, icon: '👥' },
    { id: 4, name: 'Social Butterfly', description: 'Made 10 friends', earned: false, icon: '🦋' },
    { id: 5, name: 'Champion', description: 'Won a tournament', earned: false, icon: '🥇' },
    { id: 6, name: 'Century Club', description: 'Played 100 matches', earned: false, icon: '💯' },
  ];

  const currentStats = sport === 'all' ? personalStats.overall : personalStats[sport as keyof typeof personalStats];

  return (
    <div className="stats">
      <header className="header">
        <h1 className="header-title">Stats & Leaderboards</h1>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
          Personal Stats
        </button>
        <button className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>
          Leaderboard
        </button>
        <button className={`tab ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
          Achievements
        </button>
      </div>

      {activeTab === 'personal' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <select 
              className="form-input" 
              style={{ width: '200px' }} 
              value={sport} 
              onChange={(e) => setSport(e.target.value)}
            >
              <option value="all">All Sports</option>
              <option value="futsal">Futsal</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
            </select>
          </div>

          <div className="grid grid-4">
            <div className="card stat-card">
              <div className="stat-value">{currentStats.matches}</div>
              <div className="stat-label">Matches</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{currentStats.wins}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{currentStats.goals}</div>
              <div className="stat-label">Goals</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{currentStats.rating}</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Performance Overview</h3>
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem' }}>
              {[65, 80, 45, 90, 75, 55, 70, 85, 60, 95, 70, 80].map((height, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100%', height: `${height}%`, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>M{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Sport</th>
                <th>Rating</th>
                <th>Wins</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player) => (
                <tr key={player.rank} style={{ background: player.name === 'You' ? 'var(--background)' : 'transparent' }}>
                  <td>
                    <strong style={{ color: player.rank <= 3 ? 'var(--warning)' : 'inherit' }}>
                      {player.rank <= 3 ? '🥇🥈🥉'[player.rank - 1] : player.rank}
                    </strong>
                  </td>
                  <td>{player.name}</td>
                  <td><span className="badge badge-info">{player.sport}</span></td>
                  <td>{player.rating}</td>
                  <td>{player.wins}</td>
                  <td><strong>{player.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-3">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="card" style={{ textAlign: 'center', opacity: achievement.earned ? 1 : 0.5 }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{achievement.icon}</div>
              <h4 style={{ marginBottom: '0.25rem' }}>{achievement.name}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{achievement.description}</p>
              <span className={`badge ${achievement.earned ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '0.5rem' }}>
                {achievement.earned ? 'Earned' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Stats;
