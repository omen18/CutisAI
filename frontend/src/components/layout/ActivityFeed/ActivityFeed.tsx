// frontend/src/components/layout/ActivityFeed/ActivityFeed.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/components/layout/ActivityFeed/ActivityFeed.tsx
// Used in: Doctor Dashboard bottom row (3rd card)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import './ActivityFeed.css';

export interface FeedItem {
  id: string;
  entity: string;
  action: string;
  timestamp: string;
  color: 'rose' | 'sage' | 'gold' | 'burg' | 'muted';
}

interface ActivityFeedProps {
  items: FeedItem[];
}

const colorMap: Record<FeedItem['color'], string> = {
  rose:  'var(--rose)',
  sage:  'var(--sage)',
  gold:  'var(--gold)',
  burg:  'var(--burg)',
  muted: 'var(--muted3)',
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ items }) => (
  <ul className="activity-feed" aria-label="Activity feed">
    {items.map((item) => (
      <li key={item.id} className="activity-feed__item">
        <span
          className="activity-feed__dot"
          style={{ backgroundColor: colorMap[item.color] }}
          aria-hidden="true"
        />
        <div className="activity-feed__content">
          <p className="activity-feed__text">
            <strong className="activity-feed__entity">{item.entity}</strong>{' '}
            <span className="activity-feed__action">{item.action}</span>
          </p>
          <p className="activity-feed__time mono">{item.timestamp}</p>
        </div>
      </li>
    ))}
  </ul>
);

export default ActivityFeed;
