import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Package, ShoppingBag, LayoutGrid, ShieldCheck, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { seedCatalog } from '../../lib/seed';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, productCount: 0, pendingPayments: 0 });
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchStats = async () => {
    try {
      const productSnapshot = await getDocs(collection(db, 'products'));
      const orderSnapshot = await getDocs(collection(db, 'orders'));
      
      const totalSales = orderSnapshot.docs.reduce((acc, doc) => acc + (doc.data().total || 0), 0);
      
      setStats({
        totalSales,
        orderCount: orderSnapshot.size,
        productCount: productSnapshot.size,
        pendingPayments: orderSnapshot.docs.filter(d => d.data().paymentStatus === 'pending').length
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  const handleSeed = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    const loadingToast = toast.loading('Seeding catalog...');
    try {
      await seedCatalog();
      toast.success('Catalog seeded successfully', { id: loadingToast });
      fetchStats();
    } catch (error) {
      toast.error('Failed to seed catalog', { id: loadingToast });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (authLoading || !isAdmin) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl">Verifying Admin Access...</div>;

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-24">
          <h1 className="text-[8rem] font-serif mb-12 tracking-tight leading-none">Store Dashboard</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-black/5 pb-10">
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">
              <span className="text-black/60">ADMIN: {user?.displayName || 'THENMOZHI DESIGNS'}</span>
              <span>•</span>
              <span className="normal-case tracking-normal font-medium text-gray-400">{user?.email || 'designs2306@gmail.com'}</span>
              <button 
                className="ml-6 px-6 py-2 border border-black/10 rounded-full text-[9px] hover:bg-black hover:text-white transition-all duration-700 uppercase tracking-widest shadow-sm bg-white disabled:opacity-50"
                onClick={handleSeed}
                disabled={isSeeding}
              >
                {isSeeding ? 'SEEDING...' : 'SETUP SAMPLE STORE'}
              </button>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all duration-500 group"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {[
            { label: 'PRODUCTS', value: stats.productCount, icon: <Package className="w-4 h-4" /> },
            { label: 'TOTAL ORDERS', value: stats.orderCount, icon: <ShoppingBag className="w-4 h-4" /> },
            { label: 'REVENUE', value: stats.totalSales, prefix: '₹', icon: <LayoutGrid className="w-4 h-4" /> },
            { label: 'PENDING PAYMENTS', value: stats.pendingPayments, icon: <ShieldCheck className="w-4 h-4" /> }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 border border-black/[0.03] flex flex-col justify-between h-[220px] group hover:shadow-2xl hover:shadow-black/[0.02] transition-all duration-700"
            >
              <div className="flex items-center space-x-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9ca3af] group-hover:text-black transition-colors">
                {stat.icon}
                <span>{stat.label}</span>
              </div>
              <div className="text-6xl font-serif tracking-tighter flex items-baseline">
                {stat.prefix && <span className="text-4xl mr-1 font-serif font-light">{stat.prefix}</span>}
                {stat.value.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-14 border border-black/[0.03] group cursor-pointer hover:shadow-2xl hover:shadow-black/[0.02] transition-all duration-1000"
            onClick={() => navigate('/admin/products')}
          >
            <h2 className="text-4xl font-serif mb-4">Manage Products</h2>
            <p className="text-gray-400 text-sm mb-12 font-medium max-w-sm leading-relaxed opacity-60">Add, edit, delete products and manage stock</p>
            <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-700">
              <span>GO TO INVENTORY <span className="ml-2">›</span></span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-14 border border-black/[0.03] group cursor-pointer hover:shadow-2xl hover:shadow-black/[0.02] transition-all duration-1000"
            onClick={() => navigate('/admin/orders')}
          >
            <h2 className="text-4xl font-serif mb-4">Manage Orders</h2>
            <p className="text-gray-400 text-sm mb-12 font-medium max-w-sm leading-relaxed opacity-60">View orders, update status, confirm payments</p>
            <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-700">
              <span>VIEW ALL ORDERS <span className="ml-2">›</span></span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button (already handled in App wrapper generally, but styling it for admin) */}
      <a 
        href="https://chat.whatsapp.com/LbkyzX4gVgS3a3H2hNXosy" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-10 right-10 w-20 h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 z-50 group"
      >
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.069-.53a5.753 5.753 0 002.918.847c.001 0 .001 0 0 0h.001c3.181 0 5.767-2.586 5.768-5.766 0-3.181-2.586-5.766-5.768-5.766zm3.473 8.358c-.144.405-.845.836-1.161.884-.316.048-.711.066-2.146-.649-1.434-.715-2.451-2.162-2.522-2.261-.072-.099-.604-.803-.604-1.532 0-.729.382-1.087.525-1.231.144-.144.316-.18.423-.18h.273c.088 0 .198-.036.311.234.113.27.387.945.421 1.017.034.072.057.153.008.252-.049.099-.074.162-.148.252-.074.089-.153.18-.216.216-.063.036-.126.077-.054.207.072.13.314.513.673.83.466.411.858.539.98.601.122.062.193.053.265-.027.072-.081.306-.358.387-.482.081-.124.162-.104.275-.063.113.04.72.339.845.4.125.061.207.09.238.144.03.054.03.315-.114.72z" />
        </svg>
      </a>
    </div>
  );
}
