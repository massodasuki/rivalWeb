import { useState } from 'react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (teamData: CreateTeamFormData) => Promise<void>;
}

export interface CreateTeamFormData {
  name: string;
  sport: string;
  description?: string;
}

const SPORTS = ['Futsal', 'Basketball', 'Tennis', 'Volleyball', 'Badminton', 'Soccer'];

export default function CreateTeamModal({ isOpen, onClose, onCreate }: CreateTeamModalProps) {
  const [formData, setFormData] = useState<CreateTeamFormData>({
    name: '',
    sport: 'Futsal',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }
    if (!formData.sport) {
      setError('Please select a sport');
      return;
    }

    setLoading(true);

    try {
      await onCreate(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        sport: 'Futsal',
        description: '',
      });
    } catch (err) {
      setError('Failed to create team. Please try again.');
      console.error('Error creating team:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Team</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Team Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sport">Sport *</label>
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
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a description for your team..."
              rows={3}
              maxLength={500}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Team'}
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
          max-width: 450px;
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
      `}</style>
    </div>
  );
}
