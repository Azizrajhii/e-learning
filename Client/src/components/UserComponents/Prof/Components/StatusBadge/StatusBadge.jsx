// src/components/StatusBadge/StatusBadge.jsx
import './StatusBadge.scss';

const StatusBadge = ({ status }) => {
  const statusText = {
    draft: 'Draft',
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  return (
    <span className={`status-badge ${status}`}>
      {statusText[status]}
    </span>
  );
};

export default StatusBadge;