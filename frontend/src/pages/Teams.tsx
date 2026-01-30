import { useState, useEffect, useCallback } from 'react';
import { teamService, Team } from '../services/teamService';

function Teams() {
  const [activeTab, setActiveTab] = useState('my-teams');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for invites and search results
  const pendingInvites = [
    { id: 1, team: 'Elite FC', sport: 'Futsal', from: 'John Doe', time: '2 hours ago' },
    { id: 2, team: 'Quick Players', sport: 'Basketball', from: 'Jane Smith', time: '1 day ago' },
  ];

  const searchResults = [
    { id: 1, name: 'Pro Team Alpha', sport: 'Futsal', members: 10, rating: 4.5 },
    { id: 2, name: 'Amateur United', sport: 'Basketball', members: 6, rating: 3.8 },
  ];

  // Fetch teams from API
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeams();
      setTeams(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Using mock data.');
      // Fallback to mock data
      setTeams([
        { id: 1, name: 'Weekend Warriors', sport: 'Futsal', members: 8, captain: 'You', wins: 12, losses: 3 },
        { id: 2, name: 'City Strikers', sport: 'Basketball', members: 5, captain: 'Mike J.', wins: 8, losses: 5 },
        { id: 3, name: 'Tennis Pros', sport: 'Tennis', members: 4, captain: 'Sarah K.', wins: 15, losses: 2 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'my-teams') {
      fetchTeams();
    }
  }, [activeTab, fetchTeams]);

  const myTeams = teams.map((team) => ({
    id: team.id,
    name: team.name,
    sport: team.sport,
    members: team.members || 0,
    captain: team.captain || 'Unknown',
    wins: team.wins || 0,
    losses: team.losses || 0,
  }));

  return (
    <div className="teams">
      <header className="header">
        <h1 className="header-title">Teams</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
            + Create Team
          </button>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'my-teams' ? 'active' : ''}`} onClick={() => setActiveTab('my-teams')}>
          My Teams
        </button>
        <button className={`tab ${activeTab === 'invites' ? 'active' : ''}`} onClick={() => setActiveTab('invites')}>
          Invites ({pendingInvites.length})
        </button>
        <button className={`tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
          Discover
        </button>
      </div>

      {activeTab === 'my-teams' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading teams...</div>
          ) : error ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--warning)' }}>
              {error}
            </div>
          ) : myTeams.length > 0 ? (
            <div className="grid grid-2">
              {myTeams.map((team) => (
                <div key={team.id} className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{team.name}</h3>
                      <span className="badge badge-info">{team.sport}</span>
                    </div>
                    <button className="btn btn-outline">Manage</button>
                  </div>
                  <div className="grid grid-4" style={{ marginTop: '1rem' }}>
                    <div className="stat-card">
                      <div className="stat-value">{team.members}</div>
                      <div className="stat-label">Members</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{team.wins}</div>
                      <div className="stat-label">Wins</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{team.losses}</div>
                      <div className="stat-label">Losses</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{team.captain}</div>
                      <div className="stat-label">Captain</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }}>View Roster</button>
                    <button className="btn btn-secondary" style={{ flex: 1 }}>Invite Players</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>You haven't joined any teams yet</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('discover')}>
                Discover Teams
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'invites' && (
        <div className="card">
          {pendingInvites.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No pending invitations</p>
          ) : (
            pendingInvites.map((invite) => (
              <div key={invite.id} className="match-card">
                <div>
                  <strong>{invite.team}</strong>
                  <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{invite.sport}</span>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Invited by {invite.from} - {invite.time}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-success">Accept</button>
                  <button className="btn btn-danger">Decline</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Search Teams</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" className="form-input" placeholder="Search by name..." style={{ flex: 1 }} />
                <select className="form-input" style={{ width: '200px' }}>
                  <option value="">All Sports</option>
                  <option value="futsal">Futsal</option>
                  <option value="basketball">Basketball</option>
                  <option value="tennis">Tennis</option>
                </select>
                <button className="btn btn-primary">Search</button>
              </div>
            </div>
          </div>
          <div className="card">
            {searchResults.map((team) => (
              <div key={team.id} className="match-card">
                <div>
                  <strong>{team.name}</strong>
                  <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{team.sport}</span>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {team.members} members | Rating: {team.rating}
                  </div>
                </div>
                <button className="btn btn-primary">Request to Join</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;
