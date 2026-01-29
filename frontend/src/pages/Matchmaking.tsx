import { useState } from 'react';

function Matchmaking() {
  const [activeTab, setActiveTab] = useState('find');
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');

  const availableMatches = [
    { id: 1, sport: 'Futsal', teams: 'Lightning vs Thunder', time: 'Today, 8:00 PM', location: 'Sports Arena A', players: '8/10', price: '$20' },
    { id: 2, sport: 'Basketball', teams: 'Eagles vs Hawks', time: 'Tomorrow, 6:00 PM', location: 'City Gym', players: '6/10', price: '$15' },
    { id: 3, sport: 'Tennis', teams: 'Singles Match', time: 'Jan 30, 10:00 AM', location: 'Tennis Center', players: '1/2', price: '$25' },
    { id: 4, sport: 'Futsal', teams: 'Champions vs Kings', time: 'Jan 31, 7:00 PM', location: 'Central Court', players: '5/10', price: '$20' },
  ];

  const hostedMatches = [
    { id: 1, sport: 'Futsal', teams: 'My Team vs Opponent', time: 'Feb 2, 8:00 PM', location: 'Sports Arena B', status: 'confirmed' },
    { id: 2, sport: 'Basketball', teams: 'My Team vs Guests', time: 'Feb 5, 5:00 PM', location: 'City Gym', status: 'pending' },
  ];

  return (
    <div className="matchmaking">
      <header className="header">
        <h1 className="header-title">Matchmaking</h1>
        <div className="header-actions">
          <button className="btn btn-primary">+ Host Match</button>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'find' ? 'active' : ''}`} onClick={() => setActiveTab('find')}>
          Find Matches
        </button>
        <button className={`tab ${activeTab === 'hosted' ? 'active' : ''}`} onClick={() => setActiveTab('hosted')}>
          My Hosted Matches
        </button>
        <button className={`tab ${activeTab === 'joined' ? 'active' : ''}`} onClick={() => setActiveTab('joined')}>
          Joined Matches
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select className="form-input" style={{ width: '200px' }} value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="">All Sports</option>
            <option value="futsal">Futsal</option>
            <option value="basketball">Basketball</option>
            <option value="tennis">Tennis</option>
          </select>
          <input type="text" className="form-input" placeholder="Location..." style={{ flex: 1 }} value={location} onChange={(e) => setLocation(e.target.value)} />
          <input type="date" className="form-input" style={{ width: '200px' }} />
          <button className="btn btn-primary">Search</button>
        </div>
      </div>

      {activeTab === 'find' && (
        <div className="grid grid-2">
          {availableMatches.map((match) => (
            <div key={match.id} className="card">
              <div className="card-header">
                <span className="badge badge-info">{match.sport}</span>
                <span className="badge badge-success">{match.status || 'Open'}</span>
              </div>
              <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>{match.teams}</h3>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <div>📅 {match.time}</div>
                <div>📍 {match.location}</div>
                <div>👥 {match.players} players</div>
                <div>💵 {match.price}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Join Match</button>
                <button className="btn btn-outline">Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'hosted' && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Sport</th>
                <th>Date/Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostedMatches.map((match) => (
                <tr key={match.id}>
                  <td>{match.teams}</td>
                  <td><span className="badge badge-info">{match.sport}</span></td>
                  <td>{match.time}</td>
                  <td>{match.location}</td>
                  <td>
                    <span className={`badge ${match.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      {match.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm">Edit</button>
                    <button className="btn btn-danger btn-sm" style={{ marginLeft: '0.5rem' }}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'joined' && (
        <div className="card">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No joined matches yet</p>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-primary">Find Matches to Join</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Matchmaking;