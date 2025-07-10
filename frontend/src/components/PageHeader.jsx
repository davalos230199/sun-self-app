// frontend/src/components/PageHeader.jsx
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export default function PageHeader({ title, showBackButton = true }) {
  const navigate = useNavigate();

  return (
    <header className="page-header">
      {showBackButton && (
        <button onClick={() => navigate(-1)} className="back-button" title="Volver">
          <BackIcon />
        </button>
      )}
      <h2>{title}</h2>
    </header>
  );
}
