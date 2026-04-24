import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginForm({ credentials, error, isLoading, handleChange, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-bold animate-in fade-in">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            ID Number / Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="e.g. 24-1507 or admin"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 font-medium text-slate-800 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 font-medium text-slate-800 transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Secure Login'}
        </button>
      </div>

    </form>
  );
}