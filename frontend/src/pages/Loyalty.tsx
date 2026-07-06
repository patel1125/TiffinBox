import { useEffect, useState } from 'react';
import api from '../services/api';
import { LoyaltyReward } from '../types';

const Loyalty = () => {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);

  useEffect(() => {
    api.get('/loyalty/my-rewards').then(({ data }) => setRewards(data));
  }, []);

  const totalPoints = rewards.reduce((sum, r) => sum + r.pointsEarned, 0);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">Loyalty Rewards</h1>
      <div className="loyalty-card">
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>Total Points</p>
        <div className="points">{totalPoints}</div>
      </div>
      {rewards.length === 0 ? (
        <div className="empty-state">No reward activity yet. Points are earned as you order!</div>
      ) : (
        rewards.map((r) => (
          <div key={r._id} className="card" style={{ padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{r.reason}</strong>
              <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>+{r.pointsEarned}</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>
              {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default Loyalty;
