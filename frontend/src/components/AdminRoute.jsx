import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AdminRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin, isContributor } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-indigo"></div>
          <div className="absolute inset-0 m-auto h-6 w-6 rounded-full bg-brand-indigo/10 animate-ping"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = requireAdmin ? isAdmin() : isContributor();

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center border border-rose-500/20 shadow-lg">
          <div className="p-3.5 rounded-full bg-rose-500/10 text-rose-500 mb-4 inline-flex animate-bounce">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your account role '{user.role}' is unauthorized to view this admin/contributor upload console.
          </p>
          <a
            href="/"
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-bold transition-all duration-300"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
