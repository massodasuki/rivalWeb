import { useState } from 'react';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (matchData: MatchFormData) => Promise<void>;
}

export interface MatchFormData {
  sport: string;
  scheduled_at: string;
  location: string;
  home_team: string;
  away_team: string;
  max_players: number;
  description: string;
}

const SPORTS = ['Futsal', 'Basketball', 'Tennis', 'Volleyball', 'Badminton', 'Soccer'];

export default function CreateMatchModal({ isOpen, onClose, onCreate }: CreateMatchModalProps) {
  const [formData, setFormData] = useState<MatchFormData>({
    sport: 'Futsal',
    scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    location: '',
    home_team: '',
    away_team: '',
    max_players: 10,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_players' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onCreate({
        ...formData,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
      });
      onClose();
      // Reset form
      setFormData({
        sport: 'Futsal',
        scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        location: '',
        home_team: '',
        away_team: '',
        max_players: 10,
        description: '',
      });
    } catch (err) {
      setError('Failed to create match. Please try again.');
      console.error('Error creating match:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Match</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sport">Sport</label>
            <select
              id="sport"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              required
            >
              {SPORTS.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="scheduled_at">Date & Time</label>
            <input
              type="datetime-local"
              id="scheduled_at"
              name="scheduled_at"
              value={formData.scheduled_at}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="home_team">Home Team</label>
              <input
                type="text"
                id="home_team"
                name="home_team"
                value={formData.home_team}
                onChange={handleChange}
                placeholder="Enter home team name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="away_team">Away Team</label>
              <input
                type="text"
                id="away_team"
                name="away_team"
                value={formData.away_team}
                onChange={handleChange}
                placeholder="Enter away team name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter match location"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="max_players">Max Players</label>
              <input
                type="number"
                id="max_players"
                name="max_players"
                value={formData.max_players}
                onChange={handleChange}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional details about the match..."
              rows={3}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--bg-primary, #fff);
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary, #666);
          padding: 0;
          line-height: 1;
        }

        .modal-close:hover {
          color: var(--text-primary, #333);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: var(--text-primary, #333);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 8px;
          font-size: 14px;
          background: var(--bg-primary, #fff);
          color: var(--text-primary, #333);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color, #007bff);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .error-message {
          color: var(--danger-color, #dc3545);
          padding: 10px;
          background: rgba(220, 53, 69, 0.1);
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
