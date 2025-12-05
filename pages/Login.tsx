
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Lock, Mail, User, ShieldCheck, HelpCircle, Check, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useApp();
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate network delay for premium feel
    setTimeout(() => {
        const success = login(email, password);
        if (!success) {
            setError('Invalid credentials. Please check your username/email and password.');
            setLoading(false);
        }
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name || !email || !password) {
        setError('All fields are required.');
        return;
    }
    setLoading(true);
    setTimeout(() => {
        register(name, email, password);
    }, 800);
  };

  const handleForgot = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setSuccessMsg(`If an account exists for ${email}, a reset link has been sent.`);
          setTimeout(() => {
              setView('LOGIN');
              setSuccessMsg('');
              setError('');
          }, 3000);
      }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-amber-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-amber-200/20 to-orange-100/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/20 to-indigo-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md p-4 relative z-10">
            {/* Logo Section */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-dark text-amber-500 text-3xl font-bold shadow-xl mb-4 ring-4 ring-white">
                    R
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Real Estate Plus</h1>
                <p className="text-slate-500 text-sm font-medium tracking-wide uppercase mt-1">Management Suite</p>
            </div>

            {/* Glass Card */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden p-8 transition-all duration-300">
                
                {/* View: LOGIN */}
                {view === 'LOGIN' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
                            <p className="text-slate-500 text-sm">Enter your credentials to access the dashboard.</p>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold flex items-center">
                                <span className="mr-2">●</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="premium-label">Username or Email</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="premium-input pl-10" 
                                        placeholder="admin"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                    <User className="absolute left-0 top-1.5 text-slate-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="premium-label flex justify-between items-center">
                                    Password
                                    <button type="button" onClick={() => {setError(''); setView('FORGOT')}} className="text-[10px] text-amber-600 font-bold hover:underline">Forgot?</button>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        className="premium-input pl-10" 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Lock className="absolute left-0 top-1.5 text-slate-400" size={18} />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-gradient-dark text-white py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all active:scale-95 flex items-center justify-center shadow-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>Sign In <ArrowRight size={18} className="ml-2 opacity-80" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center pt-6 border-t border-slate-200/60">
                            <p className="text-xs text-slate-500">Don't have an account?</p>
                            <button onClick={() => {setError(''); setView('REGISTER')}} className="text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors mt-1">
                                Create new account
                            </button>
                        </div>
                    </div>
                )}

                {/* View: REGISTER */}
                {view === 'REGISTER' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Create Account</h2>
                            <p className="text-slate-500 text-sm">Join the team to manage inventory.</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="premium-label">Full Name</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="premium-input pl-10" 
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <User className="absolute left-0 top-1.5 text-slate-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="premium-label">Email Address</label>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        className="premium-input pl-10" 
                                        placeholder="john@realestateplus.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Mail className="absolute left-0 top-1.5 text-slate-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="premium-label">Create Password</label>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        className="premium-input pl-10" 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <ShieldCheck className="absolute left-0 top-1.5 text-slate-400" size={18} />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-gradient-amber text-white py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all active:scale-95 flex items-center justify-center shadow-lg mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Register Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center pt-4 border-t border-slate-200/60">
                            <button onClick={() => {setError(''); setView('LOGIN')}} className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                Back to Login
                            </button>
                        </div>
                    </div>
                )}

                {/* View: FORGOT */}
                {view === 'FORGOT' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
                            <p className="text-slate-500 text-sm">Enter your email to receive recovery instructions.</p>
                        </div>

                        {successMsg ? (
                            <div className="p-6 bg-green-50 rounded-xl flex flex-col items-center text-center animate-in zoom-in-95">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                    <Check size={20} />
                                </div>
                                <p className="text-sm text-green-800 font-medium">{successMsg}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleForgot} className="space-y-6">
                                <div>
                                    <label className="premium-label">Email Address</label>
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            className="premium-input pl-10" 
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <HelpCircle className="absolute left-0 top-1.5 text-slate-400" size={18} />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all active:scale-95 flex items-center justify-center shadow-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Reset Link'}
                                </button>
                            </form>
                        )}

                        <div className="mt-6 text-center pt-4 border-t border-slate-200/60">
                             <button onClick={() => {setError(''); setView('LOGIN')}} className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                                Back to Login
                            </button>
                        </div>
                    </div>
                )}

            </div>
            
            <div className="text-center mt-6 text-[10px] text-slate-400 font-medium">
                &copy; {new Date().getFullYear()} Real Estate Plus Systems. v1.0.2
            </div>
        </div>
    </div>
  );
};
