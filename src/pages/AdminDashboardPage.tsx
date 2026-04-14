import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { api } from '../utils/api';

interface AdminUser {
  id: string;
  nic: string;
  fullName: string;
  phone: string;
  email: string;
  district: string;
  dsDivision: string;
  gsDivision: string;
  postalNo: string;
  addressLine1: string;
  addressLine2: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const asDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toUser = (raw: Record<string, unknown>): AdminUser => ({
  id: asString(raw.id),
  nic: asString(raw.nic),
  fullName: asString(raw.fullName),
  phone: asString(raw.phone),
  email: asString(raw.email),
  district: asString(raw.district),
  dsDivision: asString(raw.dsDivision),
  gsDivision: asString(raw.gsDivision),
  postalNo: asString(raw.postalNo),
  addressLine1: asString(raw.addressLine1),
  addressLine2: asString(raw.addressLine2),
  createdAt: asDate(raw.createdAt),
  updatedAt: asDate(raw.updatedAt),
});

const formatDate = (date: Date | null): string => {
  if (!date) {
    return '-';
  }
  const two = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())} ${two(date.getHours())}:${two(date.getMinutes())}`;
};

const display = (value: string): string => (value.trim() ? value : '-');

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const selectedUser = useMemo(() => {
    if (!users.length) {
      return null;
    }
    return users.find(user => user.id === selectedUserId) ?? users[0];
  }, [users, selectedUserId]);

  const loadUsers = () => {
    const token = sessionStorage.getItem('mytax_admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    api.adminUsers(token)
      .then(res => {
        const list = Array.isArray(res.users)
          ? res.users.map(item => toUser(item))
          : [];
        setUsers(list);
        if (list.length) {
          setSelectedUserId(prev => prev || list[0].id);
        }
      })
      .catch(err => {
        setError(err?.message || 'Failed to load users');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('mytax_admin_token');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(184,184,184,0.55)' }}>
            Admin Panel
          </p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--silver)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} /> MyTax Admin Dashboard
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-outline" onClick={loadUsers}>
            <RefreshCw size={14} style={{ marginRight: '6px' }} /> Refresh
          </button>
          <button className="btn-outline" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: '6px' }} /> Logout
          </button>
        </div>
      </div>

      <div className="dashboard-inner animate-in">
        {loading ? (
          <div className="admin-panel" style={{ minHeight: '220px', display: 'grid', placeItems: 'center' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="admin-panel" style={{ minHeight: '220px', display: 'grid', placeItems: 'center', color: '#ff9d9d' }}>
            {error}
          </div>
        ) : (
          <div className="admin-layout">
            <aside className="admin-panel">
              <div className="admin-panel__title">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} /> Users
                </span>
                <span className="admin-count-chip">{users.length} registered</span>
              </div>

              {!users.length ? (
                <p style={{ color: 'rgba(184,184,184,0.62)', marginTop: '8px' }}>No registered users found.</p>
              ) : (
                <div className="admin-user-list">
                  {users.map(user => {
                    const selected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        className={`admin-user-item${selected ? ' selected' : ''}`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="admin-user-item__name">{display(user.fullName)}</div>
                        <div className="admin-user-item__meta">{display(user.nic)}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>

            <section className="admin-panel">
              <div className="admin-panel__title">User Details</div>
              {selectedUser ? (
                <div className="admin-detail-box">
                  <div className="admin-detail-row">
                    <span>Full Name</span>
                    <strong>{display(selectedUser.fullName)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>NIC</span>
                    <strong>{display(selectedUser.nic)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>Phone Number</span>
                    <strong>{display(selectedUser.phone)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>Email Address</span>
                    <strong>{display(selectedUser.email)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>District</span>
                    <strong>{display(selectedUser.district)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>DS Division</span>
                    <strong>{display(selectedUser.dsDivision)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>GS Division</span>
                    <strong>{display(selectedUser.gsDivision)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>Postal No</span>
                    <strong>{display(selectedUser.postalNo)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>Address Line 1</span>
                    <strong>{display(selectedUser.addressLine1)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>Address Line 2</span>
                    <strong>{display(selectedUser.addressLine2)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>Registered At</span>
                    <strong>{formatDate(selectedUser.createdAt)}</strong>
                  </div>
                  <div className="admin-detail-row">
                    <span>Updated At</span>
                    <strong>{formatDate(selectedUser.updatedAt)}</strong>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'rgba(184,184,184,0.62)' }}>Select a user to see full details.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
