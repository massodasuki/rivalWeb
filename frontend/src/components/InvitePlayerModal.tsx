import { useState } from 'react';
import { teamService, TeamInvitation } from '../services/teamService';

interface InvitePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  teamName: string;
  onInviteSent: () => void;
}

export interface InvitePlayerFormData {
  email: string;
}

function InvitePlayerModal({ isOpen, onClose, teamId, teamName, onInviteSent }: InvitePlayerModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await teamService.inviteByEmail(teamId, email);
      alert(`Invitation sent to ${email}`);
      setEmail('');
      onInviteSent();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '0', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Invite Player</h2>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Team: {teamName}</span>
            </div>
            <button 
              onClick={onClose}
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
        
        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Enter the email address of the player you want to invite. They will receive an invitation and must accept it before joining the team.
          </p>
          
          {error && (
            <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ margin: 0, color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, padding: '0.75rem 1rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email}
                style={{ flex: 1, padding: '0.75rem 1rem', background: loading || !email ? '#9ca3af' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: loading || !email ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InvitePlayerModal;
