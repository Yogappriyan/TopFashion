import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, Search, Menu, X, LogIn, LogOut, LayoutDashboard, Package, ListOrdered } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { auth } from './lib/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Pages (to be implemented)
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import TrackOrder from './pages/TrackOrder';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

import Logo from './components/Logo';
import WhatsAppIcon from './components/WhatsAppIcon';

function Navbar() {
  const { user, isAdmin, profile } = useAuth();
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error(error);
      toast.error('Login failed');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
    toast.success('Signed out');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <Logo className="h-10 w-10 sm:h-14 sm:w-14" />
              <div className="flex flex-col">
                <span className="text-sm sm:text-xl font-bold tracking-tighter text-black uppercase leading-none">
                  Top Fashion
                </span>
                <span className="text-[7px] sm:text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-1">
                  Men & Womens Wear
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-gray-400 transition-colors">Home</Link>
            <Link to="/shop" className="text-xs font-bold uppercase tracking-[0.2em] hover:text-gray-400 transition-colors">Shop</Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] hover:text-black transition-colors border border-[#D4AF37]/20 px-4 py-2 rounded-full"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
            
            <div className="relative flex items-center">
              <AnimatePresence>
                {showSearch ? (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 300, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="flex items-center bg-gray-50 rounded-full px-4 py-2 absolute right-0"
                  >
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-300"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowSearch(false)}
                      className="ml-2 text-gray-400 hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.form>
                ) : (
                  <button 
                    onClick={() => setShowSearch(true)}
                    className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <Search className="w-5 h-5 text-gray-700" />
                  </button>
                )}
              </AnimatePresence>
            </div>

            <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Heart className="w-5 h-5 text-gray-700" />
              {profile?.wishlist && profile.wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>
            <a 
              href="https://chat.whatsapp.com/LbkyzX4gVgS3a3H2hNXosy" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 hover:bg-green-50 text-green-600 rounded-full transition-colors relative group"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                WhatsApp Chat
              </span>
            </a>
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <User className="w-5 h-5 text-gray-700" />
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-500">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2 sm:space-x-4">
            <a 
              href="https://chat.whatsapp.com/LbkyzX4gVgS3a3H2hNXosy" 
              target="_blank" 
              rel="noreferrer"
              className="p-1.5 sm:p-2 text-green-600"
            >
              <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <Link to="/cart" className="relative p-1.5 sm:p-2">
              <ShoppingBag className="w-5 h-5 sm:w-6 h-6" />
              {items.length > 0 && (
                 <span className="absolute top-1 sm:top-0 right-1 sm:right-0 bg-black text-white text-[8px] sm:text-[10px] w-3.5 sm:w-4 h-3.5 sm:h-4 flex items-center justify-center rounded-full">
                 {items.length}
               </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 sm:p-2">
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 h-6" /> : <Menu className="w-5 h-5 sm:w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <form onSubmit={handleSearch} className="mb-4 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-black/5"
                />
              </form>
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 border-b border-gray-50">Home</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 border-b border-gray-50">Shop</Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-indigo-600 border-b border-gray-50">Admin Dashboard</Link>
              )}
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 border-b border-gray-50">Profile & Wishlist</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-4 text-base font-medium text-red-600">Logout</button>
                </>
              ) : (
                <button onClick={handleLogin} className="w-full text-left px-3 py-4 text-base font-medium text-black">Sign In</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold tracking-tighter uppercase mb-6">Top Fashion Men & Womens Wear</h3>
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
              Premium men and women's clothing store in Tiruchirappalli. From wedding suits and ethnic wear to modern casuals, we bring you the finest collection for every occasion.
            </p>
            <p className="text-sm text-gray-400">
              1st floor, Shastri Rd, above Aswins sweets, near Ibaco, Tennur, Tiruchirappalli, Tamil Nadu 620018
            </p>
          </div>
          <div>
            <h4 className="font-bold uppercase text-sm mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/shop" className="text-gray-500 hover:text-black transition-colors text-sm">Shop All</Link></li>
              <li><Link to="/shop?category=Suits" className="text-gray-500 hover:text-black transition-colors text-sm">Suits & Blazers</Link></li>
              <li><Link to="/shop?category=Casual" className="text-gray-500 hover:text-black transition-colors text-sm">Casual Wear</Link></li>
              <li><Link to="/shop?category=Ethnic" className="text-gray-500 hover:text-black transition-colors text-sm">Ethnic Wear</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase text-sm mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/track" className="text-gray-500 hover:text-black transition-colors text-sm">Track Order</Link></li>
              <li><a href="tel:08072313912" className="text-gray-500 hover:text-black transition-colors text-sm">Contact Us</a></li>
              <li><a href="https://chat.whatsapp.com/LbkyzX4gVgS3a3H2hNXosy" target="_blank" className="text-green-600 hover:text-green-700 transition-colors text-sm font-medium flex items-center">
                <WhatsAppIcon className="w-4 h-4 mr-2" />
                WhatsApp Chat
              </a></li>
              <li><a href="https://instagram.com" target="_blank" className="text-gray-500 hover:text-black transition-colors text-sm">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 uppercase tracking-widest gap-4">
          <p>© 2024 Top Fashion Men & Womens Wear. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white font-sans antialiased">
            <Toaster position="bottom-right" />
            <Navbar />
            <main className="pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
