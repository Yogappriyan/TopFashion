import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Chrome, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Professional access granted');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      toast.error('Google verification failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50/30 px-4 py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-black/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden relative z-10"
      >
        <div className="p-10 md:p-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">Member Entrance</h1>
            <p className="text-gray-400 text-sm italic">Authenticating the modern gentleman.</p>
          </div>

          <div className="space-y-6">
             <button 
               onClick={handleGoogleLogin}
               className="w-full flex items-center justify-center space-x-4 bg-gray-50 border border-gray-100 py-5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-white hover:shadow-lg transition-all active:scale-[0.98]"
             >
               <Chrome className="w-5 h-5" />
               <span>Continue with Google</span>
             </button>

             <div className="flex items-center space-x-4 py-4">
               <div className="flex-1 h-[1px] bg-gray-100" />
               <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or use credentials</span>
               <div className="flex-1 h-[1px] bg-gray-100" />
             </div>

             <form onSubmit={handleEmailLogin} className="space-y-6">
               <div className="space-y-4">
                  <div className="relative">
                    <input 
                      required
                      type="email" 
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-12 py-5 text-sm focus:bg-white focus:border-black transition-all outline-none"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  </div>
                  <div className="relative">
                    <input 
                      required
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-12 py-5 text-sm focus:bg-white focus:border-black transition-all outline-none"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  </div>
               </div>

               <button 
                 type="submit"
                 disabled={loading}
                 className="w-full bg-black text-white py-5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center space-x-3 shadow-xl shadow-black/10"
               >
                 {loading ? 'Verifying...' : (
                   <>
                     <span>Sign In Securely</span>
                     <ArrowRight className="w-4 h-4" />
                   </>
                 )}
               </button>
             </form>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-4 opacity-50">
             <ShieldCheck className="w-4 h-4" />
             <p className="text-[10px] font-bold uppercase tracking-widest">256-bit encrypted authentication</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
             Administrator? Use the provided credentials for catalog management.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
