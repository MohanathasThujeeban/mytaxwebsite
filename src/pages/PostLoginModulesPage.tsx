import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ModuleItem {
  code: string;
  label: string;
  tag: 'Free' | 'Paid' | null;
}

const MODULES: ModuleItem[] = [
  { code: 'M1', label: 'Tax File Submission', tag: null },
  { code: 'M2', label: 'TIN Number Status', tag: 'Free' },
  { code: 'M3', label: 'Tax Calculator', tag: 'Free' },
  { code: 'M5', label: 'Final Tax Computation', tag: 'Paid' },
  { code: 'M6', label: 'TIN Certificate Request', tag: 'Paid' },
  { code: 'M7', label: 'TIN Certificate Application', tag: 'Paid' },
  { code: 'M8', label: 'Tax Payer Information Update', tag: 'Paid' },
  { code: 'M9', label: 'Tax Administration Support', tag: 'Paid' },
];

const PostLoginModulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snack, setSnack] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/verify', { replace: true });
    }
  }, [navigate, user]);

  if (!user) {
    return null;
  }

  const showSnack = (message: string) => {
    setSnack(message);
    window.setTimeout(() => setSnack(''), 2400);
  };

  const onModuleClick = (code: string) => {
    if (code === 'M1') {
      navigate('/dashboard/m1');
      return;
    }

    if (code === 'M2') {
      navigate('/dashboard/m2');
      return;
    }

    if (code === 'M6') {
      navigate('/dashboard/m6');
      return;
    }

    if (code === 'M7') {
      navigate('/dashboard/m7');
      return;
    }

    showSnack(`${code} module will be enabled soon.`);
  };

  return (
    <main className="sub-page">
      <div className="sub-page__hero" style={{ paddingBottom: '28px' }}>
        <h1 className="sub-page__title" style={{ fontSize: '30px' }}>
          Select Tax Service
        </h1>
        <div className="silver-divider" style={{ marginTop: '12px' }} />
        <p className="sub-page__subtitle" style={{ marginTop: '12px' }}>
          Choose a module to continue.
        </p>
      </div>

      <div className="container" style={{ paddingTop: '28px' }}>
        <div className="services-grid">
          {MODULES.map(module => (
            <button
              key={module.code}
              type="button"
              className="service-card module-entry-card"
              onClick={() => onModuleClick(module.code)}
            >
              <div className="service-card__code">{module.code}</div>
              <div className="service-card__body">
                <div className="service-card__label">{module.label}</div>
                {module.tag && (
                  <span className={`service-card__tag ${module.tag === 'Free' ? 'tag-free' : 'tag-paid'}`}>
                    {module.tag}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {snack && <div className="snackbar">{snack}</div>}
    </main>
  );
};

export default PostLoginModulesPage;