import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, saveFirebaseConfig, hasCustomConfig, resetFirebaseConfig } from '../services/firebase';
import { Button } from './Button';
import { ShieldAlert, Settings, AlertTriangle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);
  
  // Config Form State
  const [customConfig, setCustomConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: ''
  });

  const handleLogin = async () => {
    setErrorMsg(null);
    setIsDomainError(false);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Authentication failed", error);
      setLoading(false);
      
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      
      if (error.code === 'auth/unauthorized-domain') {
        setIsDomainError(true);
        setErrorMsg(`Unauthorized Domain: ${window.location.hostname}`);
      } else if (error.code === 'auth/api-key-not-valid') {
        setErrorMsg("Invalid API Key. Please check your configuration.");
        setIsDomainError(true); // Treat as config error
      } else {
        setErrorMsg(`Authentication Failed: ${error.message}`);
      }
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customConfig.apiKey || !customConfig.projectId) return;
    
    saveFirebaseConfig({
        ...customConfig,
        authDomain: customConfig.authDomain || `${customConfig.projectId}.firebaseapp.com`
    });
  };

  if (showConfigForm) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center p-4">
             <div className="max-w-md w-full animate-in fade-in duration-300">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm shadow-xl">
                    <div className="flex items-center gap-3 mb-4 text-emerald-500">
                        <Settings size={20} />
                        <h2 className="text-lg font-bold text-white tracking-tight">Custom Firebase Project</h2>
                    </div>
                    
                    <p className="text-zinc-500 text-xs mb-6 font-mono leading-relaxed">
                        To run this app on <span className="text-white">{window.location.hostname}</span>, you must use your own Firebase project where this domain is authorized.
                    </p>

                    <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase">API Key *</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm text-white rounded-sm focus:border-emerald-500 focus:outline-none placeholder-zinc-800"
                                placeholder="AIzaSy..."
                                value={customConfig.apiKey}
                                onChange={e => setCustomConfig({...customConfig, apiKey: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase">Project ID *</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm text-white rounded-sm focus:border-emerald-500 focus:outline-none placeholder-zinc-800"
                                placeholder="my-project-id"
                                value={customConfig.projectId}
                                onChange={e => setCustomConfig({...customConfig, projectId: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase">Auth Domain (Optional)</label>
                            <input 
                                type="text" 
                                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm text-white rounded-sm focus:border-emerald-500 focus:outline-none placeholder-zinc-800"
                                placeholder="project.firebaseapp.com"
                                value={customConfig.authDomain}
                                onChange={e => setCustomConfig({...customConfig, authDomain: e.target.value})}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setShowConfigForm(false)}>Cancel</Button>
                            <Button type="submit" variant="primary">Save & Reload</Button>
                        </div>
                    </form>
                </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">RELENTLESS.</h1>
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
            Discipline & Accountability
          </p>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-sm backdrop-blur-sm relative group">
          
          <div className="flex justify-center mb-6 text-zinc-600">
             <ShieldAlert size={48} strokeWidth={1} />
          </div>
          
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            This is not a productivity tool.<br/>
            This is a mirror for your consistency.<br/>
            <br/>
            Sign in to track your failures and victories.
          </p>

          <Button 
            onClick={handleLogin}
            disabled={loading}
            variant="primary" 
            className="w-full flex items-center justify-center gap-3 py-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? "Authenticating..." : "Sign in with Google"}
          </Button>
          
          {errorMsg && (
             <div className="mt-6 text-left p-4 bg-rose-950/10 border border-rose-900/30 rounded-sm">
                <div className="flex items-start gap-2 mb-2">
                    <ShieldAlert size={16} className="text-rose-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">Authentication Error</p>
                </div>
                <p className="text-xs text-zinc-400 font-mono mb-3 break-all">{errorMsg}</p>
                
                {isDomainError && (
                    <div className="pt-3 border-t border-rose-900/20">
                        <Button 
                            onClick={() => setShowConfigForm(true)}
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-zinc-300 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center gap-2"
                        >
                            <Settings size={12} />
                            Use Custom Firebase Project
                        </Button>
                        <p className="text-[10px] text-zinc-500 mt-2 text-center">
                            Required for unauthorized domains.
                        </p>
                    </div>
                )}
             </div>
          )}
        </div>
        
        {hasCustomConfig() && (
            <button onClick={resetFirebaseConfig} className="text-[10px] text-zinc-700 hover:text-zinc-500 underline decoration-zinc-800">
                Reset to Default Configuration
            </button>
        )}

        <div className="text-[10px] text-zinc-600 font-mono uppercase">
           Identity is persistent.
        </div>
      </div>
    </div>
  );
};