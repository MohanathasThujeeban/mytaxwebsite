import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  IdCard,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { api } from '../utils/api';
import {
  DocumentVerificationStatus,
  M1SubmissionRecord,
  downloadM1SubmissionsCsv,
  downloadM1SubmissionsExcel,
  formatIncomeLabel,
  getAllM1Submissions,
  getSubmissionDocuments,
  getSubmissionVerificationSummary,
  getUploadSummary,
  setSubmissionDocumentVerification,
} from '../utils/taxSubmission';

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
}

interface TinApplication {
  id: string;
  nic: string;
  status: 'draft' | 'submitted' | 'assigned';
  fullName: string;
  mobileNo: string;
  emailAddress: string;
  assignedTin: string;
  paymentStatus: 'pending' | 'completed';
  requestedAt: string | null;
  assignedAt: string | null;
  updatedAt: string;
  createdAt: string;
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
});

const normalizeTinStatus = (value: unknown): TinApplication['status'] => {
  const status = asString(value).toLowerCase();
  if (status === 'submitted') {
    return 'submitted';
  }

  if (status === 'assigned') {
    return 'assigned';
  }

  return 'draft';
};

const toTinApplication = (raw: Record<string, unknown>): TinApplication => ({
  id: asString(raw.id),
  nic: asString(raw.nic),
  status: normalizeTinStatus(raw.status),
  fullName: asString(raw.fullName),
  mobileNo: asString(raw.mobileNo),
  emailAddress: asString(raw.emailAddress),
  assignedTin: asString(raw.assignedTin),
  paymentStatus: asString(raw.paymentStatus).toLowerCase() === 'completed' ? 'completed' : 'pending',
  requestedAt: asString(raw.requestedAt) || null,
  assignedAt: asString(raw.assignedAt) || null,
  updatedAt: asString(raw.updatedAt),
  createdAt: asString(raw.createdAt),
});

const formatDate = (date: Date | string | null): string => {
  if (!date) {
    return '-';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(dateObj.getTime())) {
    return '-';
  }

  return dateObj.toLocaleString();
};

const display = (value: string): string => (value.trim() ? value : '-');
const nicKey = (value: string): string => value.trim().toLowerCase();

const hasFileExt = (fileName: string | undefined, extensions: string[]): boolean => {
  const normalized = (fileName || '').toLowerCase();
  return extensions.some(ext => normalized.endsWith(`.${ext}`));
};

const isImageDoc = (fileType: string | undefined, fileName: string | undefined): boolean =>
  Boolean(fileType?.startsWith('image/')) || hasFileExt(fileName, ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']);

const isPdfDoc = (fileType: string | undefined, fileName: string | undefined): boolean =>
  Boolean(fileType?.includes('pdf')) || hasFileExt(fileName, ['pdf']);

const statusClass = (status: 'draft' | 'submitted'): string =>
  status === 'submitted' ? 'm1-status-chip success' : 'm1-status-chip warning';

const tinStatusClass = (status: TinApplication['status']): string => {
  if (status === 'assigned') {
    return 'm1-status-chip success';
  }

  if (status === 'submitted') {
    return 'm1-status-chip warning';
  }

  return 'm1-status-chip';
};

const tinPaymentClass = (status: TinApplication['paymentStatus']): string =>
  status === 'completed' ? 'm1-status-chip success' : 'm1-status-chip warning';

type AdminView = 'users' | 'm1' | 'tin';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [activeView, setActiveView] = useState<AdminView>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [submissions, setSubmissions] = useState<M1SubmissionRecord[]>([]);
  const [tinApplications, setTinApplications] = useState<TinApplication[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [m1Query, setM1Query] = useState('');
  const [tinQuery, setTinQuery] = useState('');
  const [selectedUserNic, setSelectedUserNic] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [selectedTinApplicationId, setSelectedTinApplicationId] = useState('');
  const [tinAssignValue, setTinAssignValue] = useState('');
  const [assigningTin, setAssigningTin] = useState(false);
  const [selectedDocumentKey, setSelectedDocumentKey] = useState('');
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);

  const loadDashboard = () => {
    const token = sessionStorage.getItem('mytax_admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    setWarning('');

    const localSubmissions = getAllM1Submissions();
    setSubmissions(localSubmissions);
    if (localSubmissions.length) {
      setSelectedSubmissionId(prev => prev || localSubmissions[0].id);
    }

    const usersPromise = api.adminUsers(token)
      .then(res => {
        const list = Array.isArray(res.users) ? res.users.map(item => toUser(item)) : [];
        setUsers(list);
        if (list.length) {
          setSelectedUserNic(prev => prev || list[0].nic);
        }
      })
      .catch(err => {
        const message = err?.message || 'Unable to load registered users from backend.';
        setWarning(prev => (prev ? `${prev} ${message}` : message));
      });

    const tinPromise = api.adminTinApplications(token)
      .then(res => {
        const list = Array.isArray(res.applications) ? res.applications.map(item => toTinApplication(item)) : [];
        setTinApplications(list);
        if (list.length) {
          setSelectedTinApplicationId(prev => prev || list[0].id);
        }
      })
      .catch(err => {
        const message = err?.message || 'Unable to load TIN applications from backend.';
        setWarning(prev => (prev ? `${prev} ${message}` : message));
      });

    Promise.allSettled([usersPromise, tinPromise])
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submissionsByNic = useMemo(() => {
    const bucket = new Map<string, M1SubmissionRecord[]>();

    submissions.forEach(item => {
      const key = nicKey(item.userProfile.nic);
      if (!key) {
        return;
      }

      const list = bucket.get(key);
      if (list) {
        list.push(item);
      } else {
        bucket.set(key, [item]);
      }
    });

    return bucket;
  }, [submissions]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) {
      return users;
    }

    return users.filter(item => {
      const nic = item.nic.toLowerCase();
      const fullName = item.fullName.toLowerCase();
      const phone = item.phone.toLowerCase();
      const email = item.email.toLowerCase();
      const district = item.district.toLowerCase();

      return (
        nic.includes(q) ||
        fullName.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        district.includes(q)
      );
    });
  }, [userQuery, users]);

  const selectedRegistryUser = useMemo(() => {
    if (!filteredUsers.length) {
      return null;
    }

    return filteredUsers.find(item => nicKey(item.nic) === nicKey(selectedUserNic)) || filteredUsers[0];
  }, [filteredUsers, selectedUserNic]);

  useEffect(() => {
    if (selectedRegistryUser && selectedRegistryUser.nic !== selectedUserNic) {
      setSelectedUserNic(selectedRegistryUser.nic);
    }
  }, [selectedRegistryUser, selectedUserNic]);

  const filteredSubmissions = useMemo(() => {
    const q = m1Query.trim().toLowerCase();
    if (!q) {
      return submissions;
    }

    return submissions.filter(item => {
      const fullName = item.userProfile.fullName?.toLowerCase() || '';
      const nic = item.userProfile.nic.toLowerCase();
      const contact = item.userProfile.contactNo?.toLowerCase() || '';
      return fullName.includes(q) || nic.includes(q) || contact.includes(q);
    });
  }, [m1Query, submissions]);

  const filteredTinApplications = useMemo(() => {
    const q = tinQuery.trim().toLowerCase();
    if (!q) {
      return tinApplications;
    }

    return tinApplications.filter(item => {
      return (
        item.nic.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.mobileNo.toLowerCase().includes(q) ||
        item.emailAddress.toLowerCase().includes(q) ||
        item.assignedTin.toLowerCase().includes(q)
      );
    });
  }, [tinApplications, tinQuery]);

  const selectedSubmission = useMemo(() => {
    if (!filteredSubmissions.length) {
      return null;
    }

    return filteredSubmissions.find(item => item.id === selectedSubmissionId) || filteredSubmissions[0];
  }, [filteredSubmissions, selectedSubmissionId]);

  useEffect(() => {
    if (selectedSubmission && selectedSubmission.id !== selectedSubmissionId) {
      setSelectedSubmissionId(selectedSubmission.id);
    }
  }, [selectedSubmission, selectedSubmissionId]);

  const selectedTinApplication = useMemo(() => {
    if (!filteredTinApplications.length) {
      return null;
    }

    return filteredTinApplications.find(item => item.id === selectedTinApplicationId) || filteredTinApplications[0];
  }, [filteredTinApplications, selectedTinApplicationId]);

  useEffect(() => {
    if (selectedTinApplication && selectedTinApplication.id !== selectedTinApplicationId) {
      setSelectedTinApplicationId(selectedTinApplication.id);
    }
  }, [selectedTinApplication, selectedTinApplicationId]);

  useEffect(() => {
    if (selectedTinApplication) {
      setTinAssignValue(selectedTinApplication.assignedTin || '');
      return;
    }

    setTinAssignValue('');
  }, [selectedTinApplication?.id]);

  const selectedSubmissionDocuments = useMemo(() => {
    if (!selectedSubmission) {
      return [];
    }

    return getSubmissionDocuments(selectedSubmission);
  }, [selectedSubmission]);

  const selectedUploadedDocuments = useMemo(
    () => selectedSubmissionDocuments.filter(item => item.doc.mode === 'uploaded'),
    [selectedSubmissionDocuments]
  );

  const selectedDocument = useMemo(() => {
    return selectedUploadedDocuments.find(item => item.key === selectedDocumentKey) || null;
  }, [selectedDocumentKey, selectedUploadedDocuments]);

  const selectedDocumentPreviewType = useMemo(() => {
    if (!selectedDocument) {
      return 'none' as const;
    }

    if (isImageDoc(selectedDocument.doc.fileType, selectedDocument.doc.fileName)) {
      return 'image' as const;
    }

    if (isPdfDoc(selectedDocument.doc.fileType, selectedDocument.doc.fileName)) {
      return 'pdf' as const;
    }

    return 'other' as const;
  }, [selectedDocument]);

  useEffect(() => {
    if (selectedDocumentKey && !selectedUploadedDocuments.some(item => item.key === selectedDocumentKey)) {
      setSelectedDocumentKey('');
      setIsDocumentDialogOpen(false);
    }
  }, [selectedDocumentKey, selectedUploadedDocuments]);

  const selectedDocumentVerificationSummary = useMemo(() => {
    if (!selectedSubmission) {
      return { uploaded: 0, verified: 0, rejected: 0, pending: 0 };
    }

    return getSubmissionVerificationSummary(selectedSubmission);
  }, [selectedSubmission]);

  const selectedSubmissionUser = useMemo(() => {
    if (!selectedSubmission) {
      return null;
    }

    const nic = nicKey(selectedSubmission.userProfile.nic);
    return users.find(item => nicKey(item.nic) === nic) || null;
  }, [selectedSubmission, users]);

  const selectedRegistryUserSubmissions = useMemo(() => {
    if (!selectedRegistryUser) {
      return [] as M1SubmissionRecord[];
    }

    return submissionsByNic.get(nicKey(selectedRegistryUser.nic)) || [];
  }, [selectedRegistryUser, submissionsByNic]);

  const selectedRegistryLatestSubmission = selectedRegistryUserSubmissions[0] || null;
  const selectedRegistryLatestUploadSummary = selectedRegistryLatestSubmission
    ? getUploadSummary(selectedRegistryLatestSubmission.form)
    : null;

  const selectedRegistrySubmissionMetrics = useMemo(() => {
    const total = selectedRegistryUserSubmissions.length;
    const submitted = selectedRegistryUserSubmissions.filter(item => item.status === 'submitted').length;
    const draft = selectedRegistryUserSubmissions.filter(item => item.status === 'draft').length;

    return { total, submitted, draft };
  }, [selectedRegistryUserSubmissions]);

  const metrics = useMemo(() => {
    const total = submissions.length;
    const submitted = submissions.filter(item => item.status === 'submitted').length;
    const draft = submissions.filter(item => item.status === 'draft').length;
    const completion = total ? Math.round((submitted / total) * 100) : 0;

    return { total, submitted, draft, completion };
  }, [submissions]);

  const m1UserCount = useMemo(() => submissionsByNic.size, [submissionsByNic]);

  const tinMetrics = useMemo(() => {
    const total = tinApplications.length;
    const assigned = tinApplications.filter(item => item.status === 'assigned' || item.assignedTin.trim().length > 0).length;
    const inProgress = total - assigned;
    const submitted = tinApplications.filter(item => item.status === 'submitted').length;

    return {
      total,
      assigned,
      inProgress,
      submitted,
    };
  }, [tinApplications]);

  const usersWithRequests = useMemo(
    () => users.filter(item => (submissionsByNic.get(nicKey(item.nic)) || []).length > 0).length,
    [submissionsByNic, users]
  );

  const usersWithoutRequests = Math.max(users.length - usersWithRequests, 0);

  const handleLogout = () => {
    sessionStorage.removeItem('mytax_admin_token');
    navigate('/login');
  };

  const handleExportCsv = () => {
    if (!submissions.length) {
      setError('No submissions available to export.');
      return;
    }

    setError('');
    downloadM1SubmissionsCsv(submissions);
  };

  const handleExportExcel = () => {
    if (!submissions.length) {
      setError('No submissions available to export.');
      return;
    }

    setError('');
    downloadM1SubmissionsExcel(submissions);
  };

  const handleAssignTinNumber = () => {
    if (!selectedTinApplication) {
      setError('Select a TIN application first.');
      return;
    }

    const assignedTin = tinAssignValue.trim().toUpperCase();
    if (!assignedTin) {
      setError('TIN number is required to assign.');
      return;
    }

    const token = sessionStorage.getItem('mytax_admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setAssigningTin(true);
    setError('');

    api.adminAssignTin(token, selectedTinApplication.id, assignedTin)
      .then(res => {
        const updated = toTinApplication(res.application);
        setTinApplications(prev => prev.map(item => (item.id === updated.id ? updated : item)));
        setTinAssignValue(updated.assignedTin || assignedTin);
        setWarning(`TIN ${assignedTin} assigned to NIC ${updated.nic}.`);
      })
      .catch(err => {
        setError(err?.message || 'Unable to assign TIN number.');
      })
      .finally(() => setAssigningTin(false));
  };

  const handleDocumentVerification = (documentKey: string, verificationStatus: DocumentVerificationStatus) => {
    if (!selectedSubmission) {
      return;
    }

    const updatedRecord = setSubmissionDocumentVerification(selectedSubmission.id, documentKey, verificationStatus);
    if (!updatedRecord) {
      setError('Unable to update document verification status.');
      return;
    }

    setError('');
    setSubmissions(prev => prev.map(item => (item.id === updatedRecord.id ? updatedRecord : item)));
    setWarning(
      `${updatedRecord.userProfile.nic} - document marked as ${verificationStatus}.`
    );
  };

  const openDocumentDialog = (documentKey: string) => {
    setSelectedDocumentKey(documentKey);
    setIsDocumentDialogOpen(true);
  };

  const closeDocumentDialog = () => {
    setIsDocumentDialogOpen(false);
  };

  const uploadSummary = selectedSubmission ? getUploadSummary(selectedSubmission.form) : null;

  const submissionRows = useMemo(() => {
    if (!selectedSubmission) {
      return [] as Array<{ label: string; value: string }>;
    }

    return [
      { label: 'Submission ID', value: selectedSubmission.id },
      { label: 'Status', value: selectedSubmission.status },
      { label: 'Submitted At', value: formatDate(selectedSubmission.submittedAt) },
      { label: 'Updated At', value: formatDate(selectedSubmission.updatedAt) },
      { label: 'Client Name', value: display(selectedSubmission.userProfile.fullName || '') },
      { label: 'NIC', value: display(selectedSubmission.userProfile.nic) },
      { label: 'Contact', value: display(selectedSubmission.userProfile.contactNo || '') },
      { label: 'Email', value: display(selectedSubmission.userProfile.mailAddress || '') },
      { label: 'Income Types', value: formatIncomeLabel(selectedSubmission.form) },
      { label: 'Residence Type', value: display(selectedSubmission.form.residenceType) },
      { label: 'Business Bank', value: display(selectedSubmission.form.businessBankUse) },
      { label: 'Assets Declared', value: display(selectedSubmission.form.assets.declareAssets) },
      { label: 'Loans Declared', value: display(selectedSubmission.form.liabilities.hasLoans) },
    ];
  }, [selectedSubmission]);

  const userRows = useMemo(() => {
    if (!selectedRegistryUser) {
      return [] as Array<{ label: string; value: string }>;
    }

    return [
      { label: 'Full Name', value: display(selectedRegistryUser.fullName) },
      { label: 'NIC', value: display(selectedRegistryUser.nic) },
      { label: 'Phone', value: display(selectedRegistryUser.phone) },
      { label: 'Email', value: display(selectedRegistryUser.email) },
      { label: 'District', value: display(selectedRegistryUser.district) },
      { label: 'DS Division', value: display(selectedRegistryUser.dsDivision) },
      { label: 'GS Division', value: display(selectedRegistryUser.gsDivision) },
      { label: 'Postal No', value: display(selectedRegistryUser.postalNo) },
      { label: 'Address Line 1', value: display(selectedRegistryUser.addressLine1) },
      { label: 'Address Line 2', value: display(selectedRegistryUser.addressLine2) },
      { label: 'Registered At', value: formatDate(selectedRegistryUser.createdAt) },
    ];
  }, [selectedRegistryUser]);

  const registryServiceRows = useMemo(() => {
    return [
      {
        label: 'Requested Services',
        value: selectedRegistryUserSubmissions.length ? 'M1 Tax File' : 'No requested service',
      },
      { label: 'M1 Requests', value: String(selectedRegistryUserSubmissions.length) },
      {
        label: 'Latest M1 Status',
        value: selectedRegistryLatestSubmission ? selectedRegistryLatestSubmission.status : '-',
      },
      {
        label: 'Latest M1 Progress',
        value: selectedRegistryLatestSubmission ? `${selectedRegistryLatestSubmission.progress}%` : '-',
      },
      {
        label: 'Latest M1 Update',
        value: selectedRegistryLatestSubmission ? formatDate(selectedRegistryLatestSubmission.updatedAt) : '-',
      },
    ] as Array<{ label: string; value: string }>;
  }, [selectedRegistryLatestSubmission, selectedRegistryUserSubmissions.length]);

  const submissionUserRows = useMemo(() => {
    if (!selectedSubmissionUser) {
      return [] as Array<{ label: string; value: string }>;
    }

    return [
      { label: 'Full Name', value: display(selectedSubmissionUser.fullName) },
      { label: 'NIC', value: display(selectedSubmissionUser.nic) },
      { label: 'Phone', value: display(selectedSubmissionUser.phone) },
      { label: 'Email', value: display(selectedSubmissionUser.email) },
      { label: 'District', value: display(selectedSubmissionUser.district) },
      { label: 'Registered At', value: formatDate(selectedSubmissionUser.createdAt) },
    ];
  }, [selectedSubmissionUser]);

  const tinRows = useMemo(() => {
    if (!selectedTinApplication) {
      return [] as Array<{ label: string; value: string }>;
    }

    return [
      { label: 'Request ID', value: display(selectedTinApplication.id) },
      { label: 'NIC', value: display(selectedTinApplication.nic) },
      { label: 'Full Name', value: display(selectedTinApplication.fullName) },
      { label: 'Mobile No', value: display(selectedTinApplication.mobileNo) },
      { label: 'Email', value: display(selectedTinApplication.emailAddress) },
      { label: 'Status', value: selectedTinApplication.status },
      { label: 'Assigned TIN', value: display(selectedTinApplication.assignedTin) },
      { label: 'Payment', value: selectedTinApplication.paymentStatus },
      { label: 'Requested At', value: formatDate(selectedTinApplication.requestedAt) },
      { label: 'Assigned At', value: formatDate(selectedTinApplication.assignedAt) },
      { label: 'Last Updated', value: formatDate(selectedTinApplication.updatedAt) },
    ];
  }, [selectedTinApplication]);

  const recentRecords = useMemo(() => submissions.slice(0, 6), [submissions]);
  const recentTinApplications = useMemo(() => tinApplications.slice(0, 6), [tinApplications]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => {
        const left = a.createdAt ? a.createdAt.getTime() : 0;
        const right = b.createdAt ? b.createdAt.getTime() : 0;
        return right - left;
      })
      .slice(0, 6);
  }, [users]);

  return (
    <div className="dashboard">
      <div className="dashboard-inner dashboard-inner--admin animate-in">
        {loading ? (
          <div className="admin-card" style={{ minHeight: '300px', display: 'grid', placeItems: 'center' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="admin-shell">
            <aside className="admin-rail">
              <div className="admin-rail__brand">
                <div className="admin-rail__brand-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="admin-rail__brand-text">
                  <p>Operations</p>
                  <strong>MyTax Console</strong>
                </div>
              </div>

              <div className="admin-rail__menu">
                <button
                  type="button"
                  className={`admin-rail__item${activeView === 'users' ? ' active' : ''}`}
                  onClick={() => setActiveView('users')}
                >
                  <Users size={15} /> Users
                </button>
                <button
                  type="button"
                  className={`admin-rail__item${activeView === 'm1' ? ' active' : ''}`}
                  onClick={() => setActiveView('m1')}
                >
                  <FileText size={15} /> M1
                </button>
                <button
                  type="button"
                  className={`admin-rail__item${activeView === 'tin' ? ' active' : ''}`}
                  onClick={() => setActiveView('tin')}
                >
                  <IdCard size={15} /> TIN Applications
                </button>
              </div>

              <button className="admin-rail__logout" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </aside>

            <section className="admin-board">
              <header className="admin-board__top">
                <div>
                  <p className="admin-board__eyebrow">
                    {activeView === 'users'
                      ? 'User Registry Desk'
                      : activeView === 'm1'
                        ? 'M1 Filing Desk'
                        : 'TIN Applications Desk'}
                  </p>
                  <h1>
                    {activeView === 'users'
                      ? 'Registered Users & Requested Services'
                      : activeView === 'm1'
                        ? 'M1 Tax File Users & Submissions'
                        : 'TIN Applications & Manual TIN Assignment'}
                  </h1>
                </div>

                <div className="admin-board__actions">
                  <button className="btn-outline" onClick={loadDashboard}>
                    <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh
                  </button>
                  {activeView === 'm1' && (
                    <>
                      <button className="btn-outline" onClick={handleExportCsv}>
                        <Download size={14} style={{ marginRight: 6 }} /> CSV
                      </button>
                      <button className="btn-outline" onClick={handleExportExcel}>
                        <FileSpreadsheet size={14} style={{ marginRight: 6 }} /> Excel
                      </button>
                    </>
                  )}
                </div>
              </header>

              {(error || warning) && (
                <div className={`admin-alert ${error ? 'error' : 'warning'}`}>
                  {error || warning}
                </div>
              )}

              <div className="admin-kpi-grid">
                {activeView === 'users' ? (
                  <>
                    <div className="admin-kpi">
                      <span><Users size={16} /> Registered Users</span>
                      <strong>{users.length}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><FileText size={16} /> Users With Services</span>
                      <strong>{usersWithRequests}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><Users size={16} /> Users Without Requests</span>
                      <strong>{usersWithoutRequests}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><BarChart3 size={16} /> Total M1 Requests</span>
                      <strong>{metrics.total}</strong>
                    </div>
                  </>
                ) : activeView === 'm1' ? (
                  <>
                    <div className="admin-kpi">
                      <span><Users size={16} /> M1 Tax File Users</span>
                      <strong>{m1UserCount}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><FileText size={16} /> M1 Submissions</span>
                      <strong>{metrics.total}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><BarChart3 size={16} /> Submitted</span>
                      <strong>{metrics.submitted}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><BarChart3 size={16} /> Draft</span>
                      <strong>{metrics.draft}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="admin-kpi">
                      <span><IdCard size={16} /> Total TIN Requests</span>
                      <strong>{tinMetrics.total}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><BarChart3 size={16} /> Assigned</span>
                      <strong>{tinMetrics.assigned}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><BarChart3 size={16} /> In Progress</span>
                      <strong>{tinMetrics.inProgress}</strong>
                    </div>
                    <div className="admin-kpi">
                      <span><BarChart3 size={16} /> Submitted</span>
                      <strong>{tinMetrics.submitted}</strong>
                    </div>
                  </>
                )}
              </div>

              <div className="admin-main-grid">
                {activeView === 'users' ? (
                  <>
                    <section className="admin-card">
                      <div className="admin-card__head">
                        <h3>Registered Users</h3>
                        <strong>{filteredUsers.length} shown</strong>
                      </div>

                      <div className="input-wrapper admin-search" style={{ marginBottom: '12px' }}>
                        <Search size={14} className="input-icon" />
                        <input
                          placeholder="Search by NIC, name, phone or email"
                          value={userQuery}
                          onChange={e => setUserQuery(e.target.value)}
                        />
                      </div>

                      {!filteredUsers.length ? (
                        <p className="admin-empty">No registered users found.</p>
                      ) : (
                        <div className="admin-record-list">
                          {filteredUsers.map(user => {
                            const key = nicKey(user.nic);
                            const userSubmissions = submissionsByNic.get(key) || [];
                            const latest = userSubmissions[0] || null;
                            const selected = nicKey(selectedRegistryUser?.nic || '') === key;

                            return (
                              <button
                                key={user.id || user.nic}
                                type="button"
                                className={`admin-record-item${selected ? ' selected' : ''}`}
                                onClick={() => setSelectedUserNic(user.nic)}
                              >
                                <div className="admin-record-item__name">{display(user.fullName || user.nic)}</div>
                                <div className="admin-record-item__meta">{display(user.nic)}</div>
                                <div className="admin-record-item__meta">{display(user.phone)}</div>
                                <div className="admin-record-item__chips">
                                  <span className="m1-status-chip">
                                    {userSubmissions.length} request{userSubmissions.length === 1 ? '' : 's'}
                                  </span>
                                  {latest && <span className={statusClass(latest.status)}>{latest.status}</span>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <section className="admin-card">
                      <div className="admin-card__head">
                        <h3>User Details</h3>
                        <strong>{selectedRegistryUser ? 'Active' : 'No selection'}</strong>
                      </div>

                      {!selectedRegistryUser ? (
                        <p className="admin-empty">Select a user to view details and services.</p>
                      ) : (
                        <div className="admin-stack">
                          <div className="admin-detail-grid">
                            {userRows.map(row => (
                              <div key={row.label} className="admin-detail-tile">
                                <span>{row.label}</span>
                                <strong>{row.value}</strong>
                              </div>
                            ))}
                          </div>

                          <p className="admin-section-label">Requested Services</p>
                          <div className="admin-detail-grid">
                            {registryServiceRows.map(row => (
                              <div key={row.label} className="admin-detail-tile">
                                <span>{row.label}</span>
                                <strong>{row.value}</strong>
                              </div>
                            ))}
                          </div>

                          <p className="admin-section-label">Related M1 Requests</p>
                          {!selectedRegistryUserSubmissions.length ? (
                            <p className="admin-empty">This user has not requested M1 tax file service yet.</p>
                          ) : (
                            <ul className="admin-activity-list">
                              {selectedRegistryUserSubmissions.map(record => (
                                <li key={record.id} className="admin-activity-item">
                                  <div className="admin-activity-item__top">
                                    <strong>{record.id}</strong>
                                    <span className={statusClass(record.status)}>{record.status}</span>
                                  </div>
                                  <p>{formatIncomeLabel(record.form)}</p>
                                  <time>{formatDate(record.updatedAt)} | {record.progress}%</time>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </section>
                  </>
                ) : activeView === 'm1' ? (
                  <>
                    <section className="admin-card">
                      <div className="admin-card__head">
                        <h3>M1 Tax File Users</h3>
                        <strong>{filteredSubmissions.length} shown</strong>
                      </div>

                      <div className="input-wrapper admin-search" style={{ marginBottom: '12px' }}>
                        <Search size={14} className="input-icon" />
                        <input
                          placeholder="Search by NIC, name or contact"
                          value={m1Query}
                          onChange={e => setM1Query(e.target.value)}
                        />
                      </div>

                      {!filteredSubmissions.length ? (
                        <p className="admin-empty">No M1 submissions found.</p>
                      ) : (
                        <div className="admin-record-list">
                          {filteredSubmissions.map(record => {
                            const selected = selectedSubmission?.id === record.id;
                            return (
                              <button
                                key={record.id}
                                type="button"
                                className={`admin-record-item${selected ? ' selected' : ''}`}
                                onClick={() => setSelectedSubmissionId(record.id)}
                              >
                                <div className="admin-record-item__name">{display(record.userProfile.fullName || 'Unknown')}</div>
                                <div className="admin-record-item__meta">{display(record.userProfile.nic)}</div>
                                <div className="admin-record-item__chips">
                                  <span className={statusClass(record.status)}>{record.status}</span>
                                  <span className="m1-status-chip">{record.progress}%</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <section className="admin-card">
                      <div className="admin-card__head">
                        <h3>M1 Submission Details</h3>
                        <strong>{selectedSubmission ? 'Active' : 'No selection'}</strong>
                      </div>

                      {!selectedSubmission ? (
                        <p className="admin-empty">Select an M1 submission to view details.</p>
                      ) : (
                        <div className="admin-stack">
                          <div className="admin-detail-grid">
                            {submissionRows.map(row => (
                              <div key={row.label} className="admin-detail-tile">
                                <span>{row.label}</span>
                                <strong>{row.value}</strong>
                              </div>
                            ))}

                            {uploadSummary && (
                              <>
                                <div className="admin-detail-tile">
                                  <span>Uploaded Documents</span>
                                  <strong>{uploadSummary.uploaded}</strong>
                                </div>
                                <div className="admin-detail-tile">
                                  <span>Upload Later</span>
                                  <strong>{uploadSummary.later}</strong>
                                </div>
                                <div className="admin-detail-tile">
                                  <span>Missing Documents</span>
                                  <strong>{uploadSummary.missing}</strong>
                                </div>
                              </>
                            )}
                          </div>

                          <p className="admin-section-label">Document Review</p>

                          {!selectedUploadedDocuments.length ? (
                            <p className="admin-empty">
                              No uploaded documents available for preview in this submission.
                            </p>
                          ) : (
                            <div className="admin-doc-review">
                              <p className="admin-empty" style={{ marginBottom: '8px' }}>
                                Click a document to open a clean preview dialog.
                              </p>

                              <div className="admin-doc-list admin-doc-list--panel">
                                {selectedUploadedDocuments.map(item => {
                                  const verificationStatus = item.doc.verificationStatus || 'pending';

                                  return (
                                    <button
                                      key={item.key}
                                      type="button"
                                      className="admin-doc-item"
                                      onClick={() => openDocumentDialog(item.key)}
                                    >
                                      <div className="admin-doc-item__head">
                                        <strong>{item.label}</strong>
                                        <span className={`admin-doc-badge ${verificationStatus}`}>
                                          {verificationStatus}
                                        </span>
                                      </div>
                                      <p>{item.category}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  </>
                ) : (
                  <>
                    <section className="admin-card">
                      <div className="admin-card__head">
                        <h3>TIN Applications</h3>
                        <strong>{filteredTinApplications.length} shown</strong>
                      </div>

                      <div className="input-wrapper admin-search" style={{ marginBottom: '12px' }}>
                        <Search size={14} className="input-icon" />
                        <input
                          placeholder="Search by NIC, name, mobile, email or TIN"
                          value={tinQuery}
                          onChange={e => setTinQuery(e.target.value)}
                        />
                      </div>

                      {!filteredTinApplications.length ? (
                        <p className="admin-empty">No TIN applications found.</p>
                      ) : (
                        <div className="admin-record-list">
                          {filteredTinApplications.map(record => {
                            const selected = selectedTinApplication?.id === record.id;
                            return (
                              <button
                                key={record.id}
                                type="button"
                                className={`admin-record-item${selected ? ' selected' : ''}`}
                                onClick={() => setSelectedTinApplicationId(record.id)}
                              >
                                <div className="admin-record-item__name">{display(record.fullName || 'Unknown')}</div>
                                <div className="admin-record-item__meta">{display(record.nic)}</div>
                                <div className="admin-record-item__meta">{display(record.mobileNo)}</div>
                                <div className="admin-record-item__chips">
                                  <span className={tinStatusClass(record.status)}>{record.status}</span>
                                  <span className={tinPaymentClass(record.paymentStatus)}>{record.paymentStatus}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <section className="admin-card">
                      <div className="admin-card__head">
                        <h3>TIN Application Details</h3>
                        <strong>{selectedTinApplication ? 'Active' : 'No selection'}</strong>
                      </div>

                      {!selectedTinApplication ? (
                        <p className="admin-empty">Select a TIN application to view details.</p>
                      ) : (
                        <div className="admin-stack">
                          <div className="admin-detail-grid">
                            {tinRows.map(row => (
                              <div key={row.label} className="admin-detail-tile">
                                <span>{row.label}</span>
                                <strong>{row.value}</strong>
                              </div>
                            ))}
                          </div>

                          <p className="admin-section-label">Assign / Update TIN Number</p>
                          <div className="input-wrapper admin-search">
                            <IdCard size={14} className="input-icon" />
                            <input
                              placeholder="Enter TIN number"
                              value={tinAssignValue}
                              onChange={e => setTinAssignValue(e.target.value.toUpperCase())}
                            />
                          </div>

                          <div>
                            <button className="btn-outline" onClick={handleAssignTinNumber} disabled={assigningTin}>
                              {assigningTin ? <span className="spinner" /> : <CheckCircle2 size={14} style={{ marginRight: 6 }} />}
                              Assign TIN Number
                            </button>
                          </div>
                        </div>
                      )}
                    </section>
                  </>
                )}
              </div>

            </section>

            <aside className="admin-sidepanel">
              {activeView === 'users' ? (
                <>
                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>Service Snapshot</h3>
                      <strong>{selectedRegistrySubmissionMetrics.total}</strong>
                    </div>

                    {!selectedRegistryUser ? (
                      <p className="admin-empty">No user selected.</p>
                    ) : (
                      <div className="admin-pill-grid">
                        <div className="admin-pill-stat">
                          <span>M1 Requests</span>
                          <strong>{selectedRegistrySubmissionMetrics.total}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Submitted</span>
                          <strong>{selectedRegistrySubmissionMetrics.submitted}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Draft</span>
                          <strong>{selectedRegistrySubmissionMetrics.draft}</strong>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>Latest M1 Document Health</h3>
                      <strong>{selectedRegistryLatestSubmission ? `${selectedRegistryLatestSubmission.progress}%` : '-'}</strong>
                    </div>

                    {!selectedRegistryLatestUploadSummary ? (
                      <p className="admin-empty">No M1 request found for this user.</p>
                    ) : (
                      <div className="admin-pill-grid">
                        <div className="admin-pill-stat">
                          <span>Uploaded</span>
                          <strong>{selectedRegistryLatestUploadSummary.uploaded}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Later</span>
                          <strong>{selectedRegistryLatestUploadSummary.later}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Missing</span>
                          <strong>{selectedRegistryLatestUploadSummary.missing}</strong>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>Recent Registrations</h3>
                      <strong>{recentUsers.length}</strong>
                    </div>

                    {!recentUsers.length ? (
                      <p className="admin-empty">No registered users found.</p>
                    ) : (
                      <ul className="admin-activity-list">
                        {recentUsers.map(item => (
                          <li key={item.id || item.nic} className="admin-activity-item">
                            <div className="admin-activity-item__top">
                              <strong>{display(item.fullName || item.nic)}</strong>
                            </div>
                            <p>{display(item.nic)}</p>
                            <time>{formatDate(item.createdAt)}</time>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </>
              ) : activeView === 'm1' ? (
                <>
                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>Document Health</h3>
                      <strong>{selectedSubmission ? `${selectedSubmission.progress}%` : '-'}</strong>
                    </div>

                    {!uploadSummary ? (
                      <p className="admin-empty">No submission selected.</p>
                    ) : (
                      <div className="admin-pill-grid">
                        <div className="admin-pill-stat">
                          <span>Uploaded</span>
                          <strong>{selectedDocumentVerificationSummary.uploaded}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Verified</span>
                          <strong>{selectedDocumentVerificationSummary.verified}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Pending</span>
                          <strong>{selectedDocumentVerificationSummary.pending}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Rejected</span>
                          <strong>{selectedDocumentVerificationSummary.rejected}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Later</span>
                          <strong>{uploadSummary.later}</strong>
                        </div>
                        <div className="admin-pill-stat">
                          <span>Missing</span>
                          <strong>{uploadSummary.missing}</strong>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>Registry Snapshot</h3>
                      <strong>{users.length} users</strong>
                    </div>

                    {!selectedSubmissionUser ? (
                      <p className="admin-empty">Select a submission to view account info.</p>
                    ) : (
                      <div className="admin-detail-grid">
                        {submissionUserRows.map(row => (
                          <div key={row.label} className="admin-detail-tile">
                            <span>{row.label}</span>
                            <strong>{row.value}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>Recent Activity</h3>
                      <strong>{recentRecords.length}</strong>
                    </div>

                    {!recentRecords.length ? (
                      <p className="admin-empty">No recent activity yet.</p>
                    ) : (
                      <ul className="admin-activity-list">
                        {recentRecords.map(record => (
                          <li key={record.id} className="admin-activity-item">
                            <div className="admin-activity-item__top">
                              <strong>{display(record.userProfile.fullName || record.userProfile.nic)}</strong>
                              <span className={statusClass(record.status)}>{record.status}</span>
                            </div>
                            <p>{record.id}</p>
                            <time>{formatDate(record.updatedAt)}</time>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </>
              ) : (
                <>
                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>TIN Assignment Health</h3>
                      <strong>{tinMetrics.total}</strong>
                    </div>

                    <div className="admin-pill-grid">
                      <div className="admin-pill-stat">
                        <span>Total</span>
                        <strong>{tinMetrics.total}</strong>
                      </div>
                      <div className="admin-pill-stat">
                        <span>Assigned</span>
                        <strong>{tinMetrics.assigned}</strong>
                      </div>
                      <div className="admin-pill-stat">
                        <span>In Progress</span>
                        <strong>{tinMetrics.inProgress}</strong>
                      </div>
                      <div className="admin-pill-stat">
                        <span>Submitted</span>
                        <strong>{tinMetrics.submitted}</strong>
                      </div>
                    </div>
                  </section>

                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>Selected NIC Snapshot</h3>
                      <strong>{selectedTinApplication ? 'Active' : '-'}</strong>
                    </div>

                    {!selectedTinApplication ? (
                      <p className="admin-empty">Select an application to preview assignment details.</p>
                    ) : (
                      <div className="admin-detail-grid">
                        <div className="admin-detail-tile">
                          <span>NIC</span>
                          <strong>{display(selectedTinApplication.nic)}</strong>
                        </div>
                        <div className="admin-detail-tile">
                          <span>Assigned TIN</span>
                          <strong>{display(selectedTinApplication.assignedTin)}</strong>
                        </div>
                        <div className="admin-detail-tile">
                          <span>Status</span>
                          <strong>{selectedTinApplication.status}</strong>
                        </div>
                        <div className="admin-detail-tile">
                          <span>Payment</span>
                          <strong>{selectedTinApplication.paymentStatus}</strong>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="admin-card admin-card--compact">
                    <div className="admin-card__head">
                      <h3>Recent TIN Activity</h3>
                      <strong>{recentTinApplications.length}</strong>
                    </div>

                    {!recentTinApplications.length ? (
                      <p className="admin-empty">No TIN application activity yet.</p>
                    ) : (
                      <ul className="admin-activity-list">
                        {recentTinApplications.map(record => (
                          <li key={record.id} className="admin-activity-item">
                            <div className="admin-activity-item__top">
                              <strong>{display(record.fullName || record.nic)}</strong>
                              <span className={tinStatusClass(record.status)}>{record.status}</span>
                            </div>
                            <p>{record.nic}</p>
                            <time>{formatDate(record.updatedAt)}</time>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </>
              )}
            </aside>
          </div>
        )}
      </div>

      {isDocumentDialogOpen && selectedDocument && (
        <div
          className="admin-doc-dialog__overlay"
          role="presentation"
          onClick={closeDocumentDialog}
        >
          <div
            className="admin-doc-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Document preview"
            onClick={event => event.stopPropagation()}
          >
            <div className="admin-doc-dialog__header">
              <div>
                <p>{selectedDocument.category}</p>
                <h3>{selectedDocument.label}</h3>
              </div>

              <button type="button" className="admin-doc-dialog__close" onClick={closeDocumentDialog}>
                <X size={16} /> Close
              </button>
            </div>

            <div className="admin-doc-dialog__meta">
              <span className="m1-status-chip">{display(selectedDocument.doc.fileName || '')}</span>
              <span className="m1-status-chip">{display(selectedDocument.doc.fileType || '')}</span>
              <span className={`admin-doc-badge ${selectedDocument.doc.verificationStatus || 'pending'}`}>
                {selectedDocument.doc.verificationStatus || 'pending'}
              </span>
              <span className="m1-status-chip">Verified: {formatDate(selectedDocument.doc.verifiedAt || null)}</span>
            </div>

            <div className="admin-doc-dialog__viewer">
              {selectedDocument.doc.fileDataUrl ? (
                selectedDocumentPreviewType === 'image' ? (
                  <img
                    src={selectedDocument.doc.fileDataUrl}
                    alt={selectedDocument.label}
                    className="admin-doc-dialog__image"
                  />
                ) : selectedDocumentPreviewType === 'pdf' ? (
                  <iframe
                    src={isPdfDoc(selectedDocument.doc.fileType, selectedDocument.doc.fileName)
                      ? `${selectedDocument.doc.fileDataUrl}#toolbar=1&navpanes=0`
                      : selectedDocument.doc.fileDataUrl}
                    title={selectedDocument.label}
                    className="admin-doc-dialog__iframe"
                  />
                ) : (
                  <div className="admin-doc-dialog__unsupported">
                    <p className="admin-empty" style={{ marginBottom: '8px' }}>
                      This document type does not support inline preview in browser.
                    </p>
                    <p className="admin-empty">
                      Click Open in New Tab to view or download, then verify/reject here.
                    </p>
                  </div>
                )
              ) : (
                <p className="admin-empty">Preview not available for this file.</p>
              )}
            </div>

            <div className="admin-doc-dialog__actions">
              {selectedDocument.doc.fileDataUrl && (
                <a
                  href={selectedDocument.doc.fileDataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                >
                  <Eye size={14} style={{ marginRight: 6 }} /> Open in New Tab
                </a>
              )}
              <button
                type="button"
                className="btn-outline"
                onClick={() => handleDocumentVerification(selectedDocument.key, 'verified')}
              >
                <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Verify
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => handleDocumentVerification(selectedDocument.key, 'rejected')}
              >
                <XCircle size={14} style={{ marginRight: 6 }} /> Reject
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => handleDocumentVerification(selectedDocument.key, 'pending')}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
