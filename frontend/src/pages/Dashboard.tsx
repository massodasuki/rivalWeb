import { useState } from 'react';

// Mock Data
const mockUser = {
  name: 'Alex Johnson',
  avatar: 'AJ',
  team: 'Weekend Warriors',
  teamRank: 3,
};

const teamStats = {
  matchesPlayed: 24,
  wins: 18,
  losses: 4,
  draws: 2,
  goalsScored: 68,
  goalsConceded: 42,
  winRate: '75%',
  rank: 3,
};

const suggestedMatches = [
  { id: 1, home: 'Lightning FC', away: 'Thunder United', sport: 'Futsal', time: 'Today, 8:00 PM', players: '8/10', distance: '2 km' },
  { id: 2, home: 'Falcons', away: 'Hawks', sport: 'Basketball', time: 'Tomorrow, 6:00 PM', players: '6/10', distance: '3 km' },
  { id: 3, home: 'Eagles', away: 'Vultures', sport: 'Tennis', time: 'Jan 30, 7:00 PM', players: '2/4', distance: '5 km' },
  { id: 4, home: 'Sharks', away: 'Dolphins', sport: 'Volleyball', time: 'Feb 1, 5:00 PM', players: '12/12', distance: '4 km' },
];

const upcomingMatches = [
  { id: 1, home: 'Weekend Warriors', away: 'Dream Squad', sport: 'Futsal', time: 'Today, 8:00 PM', location: 'Sports Arena A', status: 'upcoming' },
  { id: 2, home: 'Night Owls', away: 'Early Birds', sport: 'Basketball', time: 'Tomorrow, 6:00 PM', location: 'City Gym', status: 'upcoming' },
  { id: 3, home: 'Weekend Warriors', away: 'Champions', sport: 'Futsal', time: 'Jan 30, 7:00 PM', location: 'Central Court', status: 'confirmed' },
];

const leaderboard = [
  { rank: 1, team: 'Thunder Strikers', wins: 28, points: 84, sport: 'Futsal' },
  { rank: 2, team: 'Goal Getters', wins: 25, points: 75, sport: 'Futsal' },
  { rank: 3, team: 'Weekend Warriors', wins: 18, points: 54, sport: 'Futsal' },
  { rank: 4, team: 'Night Riders', wins: 16, points: 48, sport: 'Futsal' },
  { rank: 5, team: 'Ballers', wins: 14, points: 42, sport: 'Futsal' },
  { rank: 6, team: 'Score Masters', wins: 12, points: 36, sport: 'Futsal' },
  { rank: 7, team: 'Kick Starters', wins: 10, points: 30, sport: 'Futsal' },
  { rank: 8, team: 'Trophy Hunters', wins: 8, points: 24, sport: 'Futsal' },
];

const communityPosts = [
  { id: 1, author: 'Mike Chen', avatar: 'MC', content: 'Looking for a futsal match this weekend! Our team is training hard and ready for some competition.', time: '2 hours ago', likes: 12, comments: 5 },
  { id: 2, author: 'Sarah Williams', avatar: 'SW', content: 'Just won our championship match 5-2! Amazing teamwork from everyone. 🏆', time: '5 hours ago', likes: 45, comments: 8 },
  { id: 3, author: 'James Rodriguez', avatar: 'JR', content: 'New basketball court opened downtown. Anyone wants to organize a friendly match next week?', time: '1 day ago', likes: 28, comments: 15 },
  { id: 4, author: 'Emma Davis', avatar: 'ED', content: 'Congratulations to Thunder Strikers for their unbeaten season! Incredible performance!', time: '2 days ago', likes: 67, comments: 23 },
];

const recentActivity = [
  { id: 1, type: 'match', message: 'Match "Weekend Warriors vs Dream Squad" scheduled', time: '1 hour ago' },
  { id: 2, type: 'team', message: 'You were added to team "Weekend Warriors"', time: '3 hours ago' },
  { id: 3, type: 'invite', message: 'Match invitation from Night Owls', time: '5 hours ago' },
  { id: 4, type: 'achievement', message: 'Earned "Top Scorer" badge', time: '1 day ago' },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1 className="header-title">Dashboard</h1>
          <p className="header-subtitle">Welcome back, {mockUser.name}!</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">+ Create Match</button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="card quick-actions">
        <div className="quick-action-buttons">
          <button className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Create Match
          </button>
          <button className="btn btn-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Join Match
          </button>
          <button className="btn btn-outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            Find Rival Team
          </button>
          <button className="btn btn-outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Create Team
          </button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-icon wins">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <trophy cx="6" cy="9" r="3"/>
              <path d="M10 9h4l-2 7a5 5 0 0 1-5 5"/>
              <path d="M14 21v-4a2 2 0 0 1 2-2h2"/>
            </svg>
          </div>
          <div className="stat-value">{teamStats.wins}</div>
          <div className="stat-label">Wins</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon losses">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="stat-value">{teamStats.losses}</div>
          <div className="stat-label">Losses</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon goals">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="stat-value">{teamStats.goalsScored}</div>
          <div className="stat-label">Goals Scored</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon rate">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-value">{teamStats.winRate}</div>
          <div className="stat-label">Win Rate</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Matches */}
        <div className="dashboard-column">
          {/* Suggested Matches */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Suggested Matches
              </h3>
              <a href="/matchmaking" className="view-all">View All</a>
            </div>
            {suggestedMatches.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-teams">
                  <div className="match-team">
                    <div className="match-team-name">{match.home}</div>
                  </div>
                  <span className="match-vs">vs</span>
                  <div className="match-team">
                    <div className="match-team-name">{match.away}</div>
                  </div>
                </div>
                <div className="match-meta">
                  <span className="badge badge-info">{match.sport}</span>
                  <span className="match-players">{match.players}</span>
                </div>
                <button className="btn btn-success btn-sm">Join</button>
              </div>
            ))}
          </div>

          {/* Upcoming Matches */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Upcoming Matches
              </h3>
              <a href="/matchmaking" className="view-all">View All</a>
            </div>
            {upcomingMatches.map((match) => (
              <div key={match.id} className="match-card upcoming">
                <div className="match-teams">
                  <div className="match-team">
                    <div className="match-team-name">{match.home}</div>
                    <span className="match-vs">vs</span>
                    <div className="match-team-name">{match.away}</div>
                  </div>
                </div>
                <div className="match-details">
                  <span className="badge badge-info">{match.sport}</span>
                  <span className="match-time">{match.time}</span>
                  <span className={`badge ${match.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                    {match.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Leaderboard & Community */}
        <div className="dashboard-column">
          {/* Leaderboard */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Leaderboard
              </h3>
              <a href="/stats" className="view-all">View All</a>
            </div>
            <div className="leaderboard">
              {leaderboard.map((team, index) => (
                <div key={team.rank} className={`leaderboard-row ${team.team === mockUser.team ? 'current-team' : ''}`}>
                  <div className="leaderboard-rank">
                    {team.rank <= 3 ? (
                      <span className={`medal medal-${team.rank}`}>
                        {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="rank-number">{team.rank}</span>
                    )}
                  </div>
                  <div className="leaderboard-team">
                    <div className="team-name">{team.team}</div>
                    <div className="team-sport">{team.sport}</div>
                  </div>
                  <div className="leaderboard-stats">
                    <span className="stat-wins">{team.wins}W</span>
                    <span className="stat-points">{team.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Posts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Community
              </h3>
              <a href="/community" className="view-all">View All</a>
            </div>
            <div className="community-posts">
              {communityPosts.map((post) => (
                <div key={post.id} className="community-post">
                  <div className="post-header">
                    <div className="post-avatar">{post.avatar}</div>
                    <div className="post-author">
                      <div className="author-name">{post.author}</div>
                      <div className="post-time">{post.time}</div>
                    </div>
                  </div>
                  <div className="post-content">{post.content}</div>
                  <div className="post-actions">
                    <span className="post-action">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {post.likes}
                    </span>
                    <span className="post-action">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {post.comments}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((activity) => (
              <tr key={activity.id}>
                <td>
                  <span className={`activity-icon ${activity.type}`}>
                    {activity.type === 'match' && '🏟️'}
                    {activity.type === 'team' && '👥'}
                    {activity.type === 'invite' && '📨'}
                    {activity.type === 'achievement' && '🏆'}
                  </span>
                  {activity.message}
                </td>
                <td className="activity-time">{activity.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
