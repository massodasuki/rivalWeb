import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService, Match } from '../services/matchService';
import { teamService, Team } from '../services/teamService';
import { communityService, CommunityPost } from '../services/communityService';
import { userService, UserStats, ActivityEntry } from '../services/userService';
import { leaderboardService, LeaderboardEntry } from '../services/leaderboardService';
import CreateMatchModal, { MatchFormData } from '../components/CreateMatchModal';
import { useAuth } from '../contexts/AuthContext';

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);

  // Live stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Live leaderboard state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(false);

  // Live activity state
  const [activityData, setActivityData] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(false);

  const displayName = user?.name || 'there';

  // Fetch data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData, postsData] = await Promise.all([
        matchService.getMatches().catch(() => []),
        teamService.getTeams().catch(() => []),
        communityService.getPosts().catch(() => []),
      ]);

      // Ensure we have arrays
      const safeMatches = Array.isArray(matchesData) ? matchesData : [];
      const safeTeams = Array.isArray(teamsData) ? teamsData : [];
      const safePosts = Array.isArray(postsData) ? postsData : [];

      setMatches(safeMatches);
      setTeams(safeTeams);
      setPosts(safePosts.slice(0, 4));
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load some data');
      setMatches([]);
      setTeams([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }

    // Fetch user-specific and leaderboard data in parallel
    const [statsResult, lbResult, actResult] = await Promise.allSettled([
      user?.id ? userService.getUserStats(user.id) : Promise.reject('no user'),
      leaderboardService.getLeaderboard(),
      user?.id ? userService.getUserActivity(user.id) : Promise.reject('no user'),
    ]);

    if (statsResult.status === 'fulfilled') {
      setUserStats(statsResult.value);
    }
    setStatsLoading(false);

    if (lbResult.status === 'fulfilled') {
      setLeaderboardData(lbResult.value);
      setLeaderboardError(false);
    } else {
      setLeaderboardError(true);
    }
    setLeaderboardLoading(false);

    if (actResult.status === 'fulfilled') {
      setActivityData(actResult.value);
      setActivityError(false);
    } else {
      setActivityError(true);
    }
    setActivityLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived stat values
  const wins = userStats?.wins ?? 0;
  const losses = userStats?.losses ?? 0;
  const goals = userStats?.goals ?? 0;
  const winRate =
    userStats && userStats.matches > 0
      ? `${((userStats.wins / userStats.matches) * 100).toFixed(1)}%`
      : '0%';

  // Handle button clicks
  const handleCreateMatchClick = () => {
    setIsCreateMatchModalOpen(true);
  };

  const handleCreateMatch = async (formData: MatchFormData): Promise<void> => {
    try {
      await matchService.createMatch({
        sport: formData.sport,
        scheduled_at: formData.scheduled_at,
        location: formData.location,
        home_team: formData.home_team,
        away_team: formData.away_team,
        max_players: formData.max_players,
        description: formData.description,
      });
      fetchDashboardData();
    } catch (err) {
      console.error('❌ Error creating match:', err);
      throw err;
    }
  };

  const handleJoinMatch = async (matchId: number) => {
    const userId = user?.id;
    if (!userId) return;
    try {
      await matchService.addParticipant(matchId, { user_id: userId, role: 'player' });
      fetchDashboardData();
    } catch (err) {
      console.error('Error joining match:', err);
    }
  };

  const handleCreateTeam = () => navigate('/teams');

  const handleFindRival = () => navigate('/teams');

  const handleQuickJoin = async () => {
    const matchId = suggestedMatches[0]?.id;
    if (!matchId || !user?.id) {
      navigate('/matchmaking');
      return;
    }
    try {
      await matchService.addParticipant(matchId, { user_id: user.id, role: 'player' });
    } catch (err) {
      console.error('Error joining match:', err);
    }
    navigate('/matchmaking');
  };

  // Transform matches for display
  const suggestedMatches = matches.slice(0, 4).map((match) => {
    const homeName =
      match.home_team_name ||
      (typeof match.home_team === 'string'
        ? match.home_team
        : match.home_team?.name || match.teams?.split(' vs ')[0] || 'TBD');
    const awayName =
      match.away_team_name ||
      (typeof match.away_team === 'string'
        ? match.away_team
        : match.away_team?.name || match.teams?.split(' vs ')[1] || 'TBD');

    return {
      id: match.id,
      home: homeName,
      away: awayName,
      sport: match.sport,
      time: match.time || new Date(match.scheduled_at).toLocaleString(),
      players: match.players || 'Open',
      distance: '2 km',
    };
  });

  const upcomingMatches = matches.slice(0, 3).map((match) => {
    const homeName =
      match.home_team_name ||
      (typeof match.home_team === 'string'
        ? match.home_team
        : match.home_team?.name || match.teams?.split(' vs ')[0] || 'TBD');
    const awayName =
      match.away_team_name ||
      (typeof match.away_team === 'string'
        ? match.away_team
        : match.away_team?.name || match.teams?.split(' vs ')[1] || 'TBD');

    return {
      id: match.id,
      home: homeName,
      away: awayName,
      sport: match.sport,
      time: match.time || new Date(match.scheduled_at).toLocaleString(),
      location: match.location || 'TBD',
      status: match.status || 'upcoming',
    };
  });

  const communityPosts = posts.map((post) => {
    const authorName =
      typeof post.author === 'string' ? post.author : post.author?.name || 'Unknown';
    const avatarText =
      typeof post.author === 'string'
        ? post.author.substring(0, 2).toUpperCase()
        : (post.author?.name || 'U').substring(0, 2).toUpperCase();

    return {
      id: post.id,
      author: authorName,
      avatar: avatarText,
      content: post.content,
      time: post.time || 'Recently',
      likes: post.replies || 0,
      comments: post.replies || 0,
    };
  });

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1 className="header-title">Dashboard</h1>
          <p className="header-subtitle">Welcome back, {displayName}!</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreateMatchClick}>
            + Create Match
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="card quick-actions">
        <div className="quick-action-buttons">
          <button className="btn btn-primary" onClick={handleCreateMatchClick}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Create Match
          </button>
          <button className="btn btn-secondary" onClick={handleQuickJoin}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Join Match
          </button>
          <button className="btn btn-outline" onClick={handleFindRival}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Find Rival Team
          </button>
          <button className="btn btn-outline" onClick={handleCreateTeam}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Create Team
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-icon wins">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div className="stat-value">{statsLoading ? '—' : wins}</div>
          <div className="stat-label">Wins</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon losses">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="stat-value">{statsLoading ? '—' : losses}</div>
          <div className="stat-label">Losses</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon goals">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="stat-value">{statsLoading ? '—' : goals}</div>
          <div className="stat-label">Goals Scored</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon rate">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-value">{statsLoading ? '—' : winRate}</div>
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginRight: '8px' }}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Suggested Matches
              </h3>
              <a href="/matchmaking" className="view-all">
                View All
              </a>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>Loading matches...</div>
            ) : suggestedMatches.length > 0 ? (
              suggestedMatches.map((match) => (
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
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleJoinMatch(match.id)}
                  >
                    Join
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}
              >
                No matches available
              </div>
            )}
          </div>

          {/* Upcoming Matches */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginRight: '8px' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Upcoming Matches
              </h3>
              <a href="/matchmaking" className="view-all">
                View All
              </a>
            </div>
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match) => (
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
                    <span
                      className={`badge ${match.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}
                    >
                      {match.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}
              >
                No upcoming matches
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Leaderboard & Community */}
        <div className="dashboard-column">
          {/* Leaderboard */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginRight: '8px' }}
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Leaderboard
              </h3>
              <a href="/stats" className="view-all">
                View All
              </a>
            </div>
            <div className="leaderboard">
              {leaderboardLoading ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>Loading leaderboard...</div>
              ) : leaderboardError ? (
                <div
                  style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}
                >
                  Could not load leaderboard
                </div>
              ) : leaderboardData.length === 0 ? (
                <div
                  style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}
                >
                  No leaderboard data yet
                </div>
              ) : (
                leaderboardData.slice(0, 8).map((entry) => (
                  <div key={entry.rank} className="leaderboard-row">
                    <div className="leaderboard-rank">
                      {entry.rank <= 3 ? (
                        <span className={`medal medal-${entry.rank}`}>
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="rank-number">{entry.rank}</span>
                      )}
                    </div>
                    <div className="leaderboard-team">
                      <div className="team-name">{entry.teamName}</div>
                      <div className="team-sport">{entry.sport}</div>
                    </div>
                    <div className="leaderboard-stats">
                      <span className="stat-wins">{entry.wins}W</span>
                      <span className="stat-points">{entry.points} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Community Posts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginRight: '8px' }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Community
              </h3>
              <a href="/community" className="view-all">
                View All
              </a>
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
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {post.likes}
                    </span>
                    <span className="post-action">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
            {activityLoading ? (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', padding: '1rem' }}>
                  Loading activity...
                </td>
              </tr>
            ) : activityError || activityData.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}
                >
                  No recent activity
                </td>
              </tr>
            ) : (
              activityData.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className={`activity-icon ${entry.type}`}>
                      {entry.type === 'match_join' && '🏟️'}
                      {entry.type === 'team_join' && '👥'}
                      {entry.type === 'achievement' && '🏆'}
                    </span>
                    {entry.message}
                  </td>
                  <td className="activity-time">{timeAgo(entry.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateMatchModal
        isOpen={isCreateMatchModalOpen}
        onClose={() => setIsCreateMatchModalOpen(false)}
        onCreate={handleCreateMatch}
      />
    </div>
  );
}

export default Dashboard;
