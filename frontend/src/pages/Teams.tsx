import { useState, useEffect, useCallback } from 'react';
import { teamService, Team, TeamMember, TeamInvitation } from '../services/teamService';
import CreateTeamModal, { CreateTeamFormData } from '../components/CreateTeamModal';
import InvitePlayerModal from '../components/InvitePlayerModal';

function Teams() {
  const [activeTab, setActiveTab] = useState('my-teams');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [invitingTeam, setInvitingTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pendingInvites, setPendingInvites] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSport, setSearchSport] = useState('');
  const [discoverTeams, setDiscoverTeams] = useState<Team[]>([]);

  // Mock data for search results
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

  // Fetch user invitations
  const fetchUserInvitations = useCallback(async () => {
    try {
      const invites = await teamService.getUserInvitations();
      setPendingInvites(invites);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      // Fallback to mock data
      setPendingInvites([
        { id: 1, team_id: 1, invited_email: 'user@example.com', inviter_id: 1, status: 'pending', created_at: new Date().toISOString(), team: { id: 1, name: 'Elite FC', sport: 'Futsal' }, inviter: { id: 1, username: 'John Doe' } },
        { id: 2, team_id: 2, invited_email: 'user@example.com', inviter_id: 2, status: 'pending', created_at: new Date().toISOString(), team: { id: 2, name: 'Quick Players', sport: 'Basketball' }, inviter: { id: 2, username: 'Jane Smith' } },
      ]);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'my-teams') {
      fetchTeams();
    } else if (activeTab === 'invites') {
      fetchUserInvitations();
    }
  }, [activeTab, fetchTeams, fetchUserInvitations]);

  const handleCreateTeam = async (formData: CreateTeamFormData) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('You must be logged in to create a team. Please log in first.');
    }
    try {
      const teamData = { 
        name: formData.name, 
        sport: formData.sport,
        captain_id: parseInt(userId, 10)
      };
      console.log('Creating team with data:', teamData);
      const response = await teamService.createTeam(teamData);
      console.log('Team created successfully:', response);
      alert('Team created successfully!');
      fetchTeams();
    } catch (err: any) {
      console.error('Error creating team:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create team. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const handleManage = async (teamId: number) => {
    try {
      const team = await teamService.getTeam(teamId);
      alert(`Team: ${team.name}\nSport: ${team.sport}`);
    } catch (err) {
      console.error('Error loading team:', err);
    }
  };

  const handleViewRoster = async (teamId: number) => {
    try {
      const team = await teamService.getTeam(teamId);
      const members = await teamService.getTeamMembers(teamId);
      setSelectedTeam(team);
      setTeamMembers(members);
      setShowRosterModal(true);
    } catch (err) {
      console.error('Error loading roster:', err);
      // Fallback to mock data
      const mockTeam = teams.find(t => t.id === teamId);
      if (mockTeam) {
        setSelectedTeam(mockTeam);
        setTeamMembers([
          { id: 1, user_id: 1, role: 'captain', user: { id: 1, username: 'You' } },
          { id: 2, user_id: 2, role: 'player', user: { id: 2, username: 'Player 2' } },
          { id: 3, user_id: 3, role: 'player', user: { id: 3, username: 'Player 3' } },
        ]);
        setShowRosterModal(true);
      }
    }
  };

  const handleInvitePlayers = (team: Team) => {
    setInvitingTeam(team);
    setShowInviteModal(true);
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      await teamService.acceptInvite(inviteId);
      alert('Invite accepted! You are now a member of the team.');
      fetchUserInvitations();
      fetchTeams();
    } catch (err: any) {
      console.error('Error accepting invite:', err);
      alert(err.response?.data?.message || 'Failed to accept invite.');
    }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    try {
      await teamService.declineInvite(inviteId);
      alert('Invite declined.');
      fetchUserInvitations();
    } catch (err: any) {
      console.error('Error declining invite:', err);
      alert(err.response?.data?.message || 'Failed to decline invite.');
    }
  };

  const handleDiscoverSearch = async () => {
    try {
      const data = await teamService.getTeams();
      const filtered = data.filter((team) => {
        const nameOk = searchTerm ? team.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        const sportOk = searchSport ? team.sport.toLowerCase() === searchSport.toLowerCase() : true;
        return nameOk && sportOk;
      });
      setDiscoverTeams(filtered);
    } catch (err) {
      console.error('Error searching teams:', err);
    }
  };

  const handleRequestJoin = async (teamId: number) => {
    try {
      const userId = localStorage.getItem('userId');
      await teamService.requestJoin(teamId, {
        user_id: userId ? parseInt(userId, 10) : 1,
        message: 'Request to join from UI',
      });
      alert('Join request sent.');
    } catch (err) {
      console.error('Error requesting to join:', err);
      alert('Failed to send join request.');
    }
  };

  const myTeams = teams.map((team) => {
    const membersValue = team.members;
    const membersCount = Array.isArray(membersValue) ? membersValue.length : (membersValue || 0);
    return {
      id: team.id,
      name: team.name,
      sport: team.sport,
      members: membersCount,
      captain: team.captain || 'Unknown',
      wins: team.wins || 0,
      losses: team.losses || 0,
    };
  });

  // Format time ago helper
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="teams">
      <header className="header">
        <h1 className="header-title">Teams</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateTeamModal(true)}>
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
                    <button className="btn btn-outline" onClick={() => handleManage(team.id)}>Manage</button>
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
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleViewRoster(team.id)}>View Roster</button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleInvitePlayers(team)}>Invite Players</button>
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
                  <strong>{invite.team?.name || 'Unknown Team'}</strong>
                  <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{invite.team?.sport || 'Unknown'}</span>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Invited by {invite.inviter?.username || 'Unknown'} - {formatTimeAgo(invite.created_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-success" onClick={() => handleAcceptInvite(invite.id)}>Accept</button>
                  <button className="btn btn-danger" onClick={() => handleDeclineInvite(invite.id)}>Decline</button>
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
                <input type="text" className="form-input" placeholder="Search by name..." style={{ flex: 1 }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select className="form-input" style={{ width: '200px' }} value={searchSport} onChange={(e) => setSearchSport(e.target.value)}>
                  <option value="">All Sports</option>
                  <option value="futsal">Futsal</option>
                  <option value="basketball">Basketball</option>
                  <option value="tennis">Tennis</option>
                </select>
                <button className="btn btn-primary" onClick={handleDiscoverSearch}>Search</button>
              </div>
            </div>
          </div>
          <div className="card">
            {(discoverTeams.length ? discoverTeams : searchResults).map((team) => {
              const membersValue = team.members;
              const memberCount = Array.isArray(membersValue) ? membersValue.length : (membersValue || 0);
              return (
                <div key={team.id} className="match-card">
                  <div>
                    <strong>{team.name}</strong>
                    <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{team.sport}</span>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {memberCount} members | Rating: {team.rating}
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleRequestJoin(team.id)}>Request to Join</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CreateTeamModal
        isOpen={showCreateTeamModal}
        onClose={() => setShowCreateTeamModal(false)}
        onCreate={handleCreateTeam}
      />

      <InvitePlayerModal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInvitingTeam(null);
        }}
        teamId={invitingTeam?.id || 0}
        teamName={invitingTeam?.name || ''}
        onInviteSent={fetchTeams}
      />

      {/* Roster Modal */}
      {showRosterModal && selectedTeam && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowRosterModal(false)}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '0', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>{selectedTeam.name}</h2>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{selectedTeam.sport}</span>
                </div>
                <button 
                  onClick={() => setShowRosterModal(false)} 
                  style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Member Count */}
            <div style={{ padding: '0.75rem 1.5rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>
                <span style={{ color: '#111827', fontWeight: 600 }}>{teamMembers.length}</span> member{teamMembers.length !== 1 ? 's' : ''} in the team
              </span>
            </div>
            
            {/* Members List */}
            <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.5rem' }}>
              {teamMembers.map((member) => (
                <div 
                  key={member.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '0.75rem 1rem',
                    margin: '0.25rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    background: member.role === 'captain' ? '#fef3c7' : 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = member.role === 'captain' ? '#fef3c7' : 'transparent'; }}
                >
                  {/* Avatar */}
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    background: member.role === 'captain' 
                      ? '#f59e0b' 
                      : '#3b82f6',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'white', 
                    fontWeight: 600,
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    {member.user?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111827' }}>
                        {member.user?.username || `User ${member.user_id}`}
                      </span>
                      {member.role === 'captain' && (
                        <span style={{ 
                          display: 'inline-flex', 
                          padding: '0.125rem 0.5rem', 
                          background: '#f59e0b', 
                          color: 'white', 
                          fontSize: '0.6875rem', 
                          fontWeight: 600, 
                          borderRadius: '9999px',
                        }}>
                          Captain
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>
                      {member.role !== 'captain' && 'Team Member'}
                    </div>
                  </div>
                  
                  {/* Online indicator */}
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <button 
                onClick={() => setShowRosterModal(false)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.625rem 2rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;
