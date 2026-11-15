'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, UserCheck, UserX, Loader2, X, User, Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string };
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  failedLoginAttempts: number;
  lockedUntil: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}/api/v1${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
      {message} <button onClick={onClose}><X className="h-4 w-4" /></button>
    </div>
  );
}

function RoleBadge({ role }: { role: { name: string } }) {
  const colors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-900/40 text-purple-400',
    ADMIN: 'bg-sky-900/40 text-sky-400',
    EDITOR: 'bg-emerald-900/30 text-emerald-400',
    VIEWER: 'bg-slate-800 text-slate-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role.name] || colors.VIEWER}`}>
      <Shield className="h-3 w-3" />
      {role.name.replace('_', ' ')}
    </span>
  );
}

function UserModal({ user, roles, onClose, onSave }: {
  user: Partial<AdminUser> | null;
  roles: Role[];
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    roleId: user?.role?.id || (roles[0]?.id || ''),
    isActive: user?.isActive ?? true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none";
  const isNew = !user?.id;

  const handleSave = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    if (isNew && !form.password) { setError('Password is required for new users.'); return; }
    if (form.password && form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password && form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    const selectedRole = roles.find(r => r.id === form.roleId);
    const roleName = selectedRole?.name || 'ADMIN';
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      roleId: form.roleId,
      roles: [roleName],
      isActive: form.isActive,
    };
    if (form.password) payload.password = form.password;
    if (user?.id) payload.id = user.id;
    await onSave(payload);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-slate-100">{isNew ? 'Invite Admin User' : 'Edit User'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-900/30 border border-rose-800 px-4 py-3 text-sm text-rose-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input className={`${inputCls} pl-9`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Role *</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <select className={`${inputCls} pl-9`} value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input type="email" className={`${inputCls} pl-9`} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@triclinium.com" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{isNew ? 'Password *' : 'New Password (leave blank to keep current)'}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input type={showPassword ? 'text' : 'password'} className={`${inputCls} pl-9 pr-10`} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 8 characters" />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {form.password && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} className={`${inputCls} pl-9`} value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat password" />
              </div>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500" />
            <span className="text-sm text-slate-300">Account active (can log in)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800">
          <button onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50">
            {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {isNew ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<AdminUser> | null | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        apiFetch('/admin/users'),
        apiFetch('/admin/roles'),
      ]);
      setUsers(Array.isArray(usersData.data) ? usersData.data : Array.isArray(usersData) ? usersData : []);
      const resolvedRoles = Array.isArray(rolesData.data?.roles)
        ? rolesData.data.roles
        : Array.isArray(rolesData.data)
        ? rolesData.data
        : [
            { id: '1', name: 'SUPER_ADMIN', description: 'Full system control' },
            { id: '2', name: 'ADMIN', description: 'Operations and management' },
            { id: '3', name: 'EDITOR', description: 'Content publishing' },
            { id: '4', name: 'VIEWER', description: 'Read only access' },
          ];
      setRoles(resolvedRoles);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      if (data.id) {
        await apiFetch(`/admin/users/${data.id}`, { method: 'PATCH', body: JSON.stringify(data) });
        showToast('User updated');
      } else {
        await apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(data) });
        showToast('User created successfully');
      }
      setEditing(undefined);
      await fetchData();
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleDeactivate = async (user: AdminUser) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !user.isActive }) });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      showToast(`User ${action}d`);
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });
      showToast('User deleted');
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleUnlock = async (user: AdminUser) => {
    try {
      await apiFetch(`/admin/users/${user.id}/unlock`, { method: 'POST' });
      showToast('Account unlocked');
      await fetchData();
    } catch (e: unknown) { showToast((e as Error).message, 'error'); }
  };

  const handleResetPassword = async (user: AdminUser) => {
    const newPass = prompt(`Enter a new temporary password for ${user.name} (min 8 characters):`);
    if (!newPass) return;
    if (newPass.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    try {
      await apiFetch(`/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPass }),
      });
      showToast(`Password for ${user.name} was successfully reset!`);
    } catch (e: unknown) {
      showToast((e as Error).message, 'error');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.name.toLowerCase().includes(search.toLowerCase())
  );

  const isLocked = (u: AdminUser) => u.lockedUntil && new Date(u.lockedUntil) > new Date();

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {editing !== undefined && <UserModal user={editing} roles={roles} onClose={() => setEditing(undefined)} onSave={handleSave} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Users</h1>
          <p className="mt-1 text-slate-400">{users.length} administrator{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
          <Plus className="h-4 w-4" /> Invite User
        </button>
      </div>

      <div className="mb-5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          placeholder="Search by name, email, or role…" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-sky-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <User className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-sky-900/40 flex items-center justify-center shrink-0">
                        <span className="text-sky-400 text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-5 py-4">
                    {isLocked(user) ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-900/40 text-rose-400">
                        <ShieldAlert className="h-3 w-3" /> Locked
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {isLocked(user) && (
                        <button onClick={() => handleUnlock(user)} title="Unlock account"
                          className="rounded-lg p-2 text-amber-400 hover:bg-amber-900/30 transition-colors">
                          <ShieldAlert className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => handleResetPassword(user)} title="Reset User Password"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors">
                        <Lock className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeactivate(user)} title={user.isActive ? 'Deactivate' : 'Activate'}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                        {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setEditing(user)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
