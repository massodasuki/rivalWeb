import { useState, useEffect } from 'react';
import { userService, UserStats } from '../services/userService';
import { leaderboardService, LeaderboardEntry } from '../services/leaderboardService';
import { achievementService, Achievement } from '../services/achievementService';
import { useAuth } from '../contexts/AuthContext';

const achievementIcons: Record<string, string> = {
  wins: '🏆',
  goals: '⚽',
  matches: '🏟️',
  teams: '👥',
  default: '🎖️',
};

const getIcon = (type: string) => achievementIcons[type] || achievementIcons.default;

function Stats() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [sport, setSport] = useState('all');
  const [loading, setLoading] = useState(false);

  // Personal stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

  // Achievements state
  const [achievementsData, setAchievementsData] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [achievementsError, setAchievementsError] = useState(false);

  // Fetch user stats on mount / when authUser changes
  useEffect(() => {
    const userId = authUser?.id;
    if (!userId) return;

    setLoading(true);
    userService.getUserStats(userId)
      .then(setUserStats)
      .catch((err) => {
        console.error('Error fetching user stats:', err);
        setUserStats(null);
      })
      .finally(() => setLoading(false));
  }, [authUser?.id]);

  // Lazy-fetch leaderboard and achievements when the tab changes
  useEffect(() => {
    if (activeTab === 'leaderboard' && leaderboardData.length === 0 && !leaderboardLoading) {
      setLeaderboardLoading(true);
      setLeaderboardError(false);
      leaderboardService.getLeaderboard()
        .then(setLeaderboardData)
        .catch(() => setLeaderboardError(true))
        .finally(() => setLeaderboardLoading(false));
    }

    if (
      activeTab === 'achievements' &&
      achievementsData.length === 0 &&
      !achievementsLoading &&
      authUser?.id
    ) {
      setAchievementsLoading(true);
      setAchievementsError(false);
      achievementService.getUserAchievements(authUser.id)
        .then(setAchievementsData)
        .catch(() => setAchievementsError(true))
        .finally(() => setAchievementsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authUser?.id]);

  // Stat card values — show 0 on null/error
  const statMatches = userStats?.matches ?? 0;
  const statWins = userStats?.wins ?? 0;
  const statGoals = userStats?.goals ?? 0;
  const statRating = userStats?.rating ?? 0;

  return (
    <div className="stats">
      <header className="header">
        <h1 className="header-title">Stats &amp; Leaderboards</h1>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Stats
        </button>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      {activeTab === 'personal' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            {/* Sport filter is kept as a UI affordance; the API returns aggregate totals only */}
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
              <div className="stat-value">{loading ? '…' : statMatches}</div>
              <div className="stat-label">Matches</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{loading ? '…' : statWins}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{loading ? '…' : statGoals}</div>
              <div className="stat-label">Goals</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{loading ? '…' : statRating}</div>
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
          {leaderboardLoading && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading leaderboard…
            </p>
          )}
          {!leaderboardLoading && leaderboardError && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Could not load leaderboard
            </p>
          )}
          {!leaderboardLoading && !leaderboardError && (
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team</th>
                  <th>Sport</th>
                  <th>Wins</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry) => (
                  <tr key={entry.teamId}>
                    <td>
                      <strong style={{ color: entry.rank <= 3 ? 'var(--warning)' : 'inherit' }}>
                        {entry.rank <= 3 ? '🥇🥈🥉'[entry.rank - 1] : entry.rank}
                      </strong>
                    </td>
                    <td>{entry.teamName}</td>
                    <td><span className="badge badge-info">{entry.sport}</span></td>
                    <td>{entry.wins}</td>
                    <td><strong>{entry.points}</strong></td>
                  </tr>
                ))}
                {leaderboardData.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No leaderboard data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div>
          {achievementsLoading && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading achievements…
            </p>
          )}
          {!achievementsLoading && achievementsError && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Could not load achievements
            </p>
          )}
          {!achievementsLoading && !achievementsError && achievementsData.length === 0 && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No achievements yet
            </p>
          )}
          {!achievementsLoading && !achievementsError && achievementsData.length > 0 && (
            <div className="grid grid-3">
              {achievementsData.map((achievement) => {
                const earned = achievement.value > 0;
                return (
                  <div
                    key={achievement.id}
                    className="card"
                    style={{ textAlign: 'center', opacity: earned ? 1 : 0.5 }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                      {getIcon(achievement.type)}
                    </div>
                    <h4 style={{ marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                      {achievement.type}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {achievement.value}
                    </p>
                    <span
                      className={`badge ${earned ? 'badge-success' : 'badge-warning'}`}
                      style={{ marginTop: '0.5rem' }}
                    >
                      {earned ? 'Earned' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Stats;
