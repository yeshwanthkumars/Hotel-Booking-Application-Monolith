import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import { useConfirmDialog } from '../components/ui/ConfirmDialogProvider';

const SESSION_KEYS = {
  token: 'stayease_token',
  user: 'stayease_user',
  role: 'stayease_role',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, clearSession, getToken } = useAuth();
  const toast = useToast();
  const { openConfirm } = useConfirmDialog();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = getToken();

  const tokenPreview = useMemo(() => {
    if (!token) {
      return 'Unavailable';
    }

    if (token.length <= 24) {
      return token;
    }

    return `${token.slice(0, 12)}...${token.slice(-10)}`;
  }, [token]);

  const handleSave = () => {
    setError('');

    const safeUsername = username.trim();
    const safeEmail = email.trim();

    if (!safeUsername) {
      setError('Username is required.');
      return;
    }

    if (!safeEmail) {
      setError('Email is required.');
      return;
    }

    updateProfile({ username: safeUsername, email: safeEmail });
    setIsEditing(false);
    setSuccessMessage('Profile updated in current session. Backend remains source of truth.');
    toast.success('Profile session details updated.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setUsername(user?.username || '');
    setEmail(user?.email || '');
  };

  const handleLogout = () => {
    openConfirm({
      title: 'Logout now?',
      description: 'Your current session will be ended on this device.',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      tone: 'danger',
      onConfirm: () => {
        clearSession();
        toast.info('Logged out successfully.');
        navigate('/login', { replace: true });
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Profile</h1>
          <p className="mt-2 text-sm text-sky-100 sm:text-base">Manage your account details and active session information.</p>
        </div>

        {successMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">{successMessage}</div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Edit Profile
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border px-4 py-2 ${isEditing ? 'border-gray-300 focus:border-indigo-600' : 'border-gray-200 bg-gray-50 text-gray-600'} focus:outline-none`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border px-4 py-2 ${isEditing ? 'border-gray-300 focus:border-indigo-600' : 'border-gray-200 bg-gray-50 text-gray-600'} focus:outline-none`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={user?.role || 'N/A'}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Authentication</label>
                <input
                  type="text"
                  value={token ? 'Active Session' : 'Not Available'}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Profile edits currently update session metadata on frontend. Backend profile endpoints, when available, remain the source of truth.
            </div>
          </div>

          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Session Details</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-lg border border-gray-100 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Token Preview</p>
                  <p className="mt-1 break-all font-mono text-slate-700">{tokenPreview}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Storage Keys</p>
                  <ul className="mt-1 space-y-1 text-gray-700">
                    <li>{SESSION_KEYS.token}</li>
                    <li>{SESSION_KEYS.user}</li>
                    <li>{SESSION_KEYS.role}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Security</h2>
              <p className="mt-3 text-sm text-gray-600">End this session safely from this device.</p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
