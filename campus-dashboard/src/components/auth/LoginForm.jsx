import { useState } from 'react';
import { Lock, User, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ credentials, error, isLoading, handleChange, handleSubmit }) {
  // HCI Standard: Allow users to verify what they typed
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm font-bold animate-in fade-in" role="alert">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Employee ID / Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={18} />
            </div>
            <input
              id="username"
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="e.g. PRO-0001"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-bold text-slate-800 transition-all disabled:opacity-50"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Password
            </label>
            {/* HCI Standard: Escape hatch for forgotten credentials */}
            <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors" tabIndex="-1">
              Forgot Password?
            </a>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-bold text-slate-800 transition-all disabled:opacity-50"
              required
            />
            {/* HCI Standard: Password visibility toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 text-lg tracking-wide"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Authenticating...
            </>
          ) : (
            'Secure Login'
          )}
        </button>
      </div>
    </form>
  );
}