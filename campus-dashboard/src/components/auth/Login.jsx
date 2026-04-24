import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from './LoginHeader';
import LoginForm from './LoginForm';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Please enter both your ID and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5106/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('campus_user', JSON.stringify(userData));
        navigate('/dashboard', { replace: true });
      } else {
        const errData = await response.json();
        setError(errData.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Network error. Cannot connect to the Campus Server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        <LoginHeader />

        <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-8">
            <LoginForm 
              credentials={credentials}
              error={error}
              isLoading={isLoading}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              Need access? Contact the QCU Registrar.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}