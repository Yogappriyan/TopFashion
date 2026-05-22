import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, MapPin, Phone, User, Mail, CreditCard, CheckCircle2, ShieldCheck, ChevronLeft } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { sendOrderConfirmationEmail } from '../services/emailService';

export default function CartPage() {
  const cart = useCart();
  
  if (!cart) {
    console.error('CartPage: useCart() returned undefined');
    return <div className="p-20 text-center">System error: Cart not found.</div>;
  }

  const { items = [], removeFromCart, total = 0, clearCart } = cart;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  console.log('CartPage state:', { itemsCount: items.length, total, step, userId: user?.uid });

  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    street: '',
    city: 'Tiruchirappalli',
    zipCode: '',
    phone: ''
  });

  // Sync email when user loads
  React.useEffect(() => {
    if (user?.email && !address.email) {
      setAddress(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to place an order');
    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        userEmail: address.email || user.email,
        items,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        deliveryAddress: {
          fullName: address.fullName,
          street: address.street,
          city: address.city,
          zipCode: address.zipCode,
          phone: address.phone
        },
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setCreatedOrderId(docRef.id);
      
      // Trigger confirmation email
      await sendOrderConfirmationEmail(
        orderData.userEmail,
        docRef.id,
        address.fullName,
        total
      );
      
      // Update stock (optional but recommended)
      for (const item of items) {
        const productRef = doc(db, 'products', item.productId);
        await updateDoc(productRef, {
            stock: increment(-item.quantity)
        });
      }

      setStep('success');
      clearCart();
      toast.success('Order placed successfully');
    } catch (error) {
      console.error('Checkout error:', error);
      // We don't know exactly where it failed, so we'll log it as a general write error
      if (error instanceof Error && error.message.includes('permission')) {
          handleFirestoreError(error, OperationType.WRITE, 'orders/products');
      }
      toast.error('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </motion.div>
        <h1 className="text-5xl font-bold tracking-tighter uppercase mb-4">Style Secured.</h1>
        <div className="bg-gray-50 border border-black/5 px-8 py-6 rounded-3xl mb-8 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 blur-2xl rounded-full" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">UNIQUE TRACKING ID</p>
          <h2 className="text-3xl font-mono font-bold tracking-tighter text-black select-all">
            TC-{createdOrderId?.toUpperCase()}
          </h2>
          <button 
            onClick={() => {
              if (createdOrderId) {
                navigator.clipboard.writeText(`TC-${createdOrderId.toUpperCase()}`);
                toast.success('ID copied to clipboard');
              }
            }}
            className="mt-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            CLICK TO COPY
          </button>
        </div>
        <p className="text-gray-500 max-w-sm mb-6 italic">Your order has been placed. Please ensure you have sent the payment screenshot to <span className="text-black font-bold not-italic">+91 93452 75150</span> on WhatsApp to confirm your purchase.</p>
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-300 mb-12">You can track your order status using your Order ID above.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/track" className="bg-black text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">Track Order</Link>
          <Link to="/shop" className="bg-white border border-gray-100 px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">Continue Browsing</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 mb-8 md:mb-12 border-b border-gray-100 pb-8 md:pb-12 gap-2 sm:gap-6">
            <button 
              onClick={() => setStep('cart')}
              className={`text-2xl sm:text-3xl font-bold tracking-tighter uppercase transition-opacity ${step === 'cart' ? 'opacity-100' : 'opacity-20 hover:opacity-40'}`}
            >
              Shopping Bag
            </button>
            <span className="text-2xl sm:text-3xl font-bold opacity-10 hidden sm:block">/</span>
            <button 
              disabled={items.length === 0}
              onClick={() => setStep('checkout')}
              className={`text-2xl sm:text-3xl font-bold tracking-tighter uppercase transition-opacity ${step === 'checkout' ? 'opacity-100' : 'opacity-20 hover:opacity-40'}`}
            >
              Logistics
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 'cart' ? (
              <motion.div 
                key="cart"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {items.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {(items || []).map((item) => (
                        <div key={item.productId + (item.size || '')} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-8 bg-gray-50/50 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all gap-6">
                          <div className="flex items-center space-x-4 sm:space-x-8 w-full sm:w-auto">
                             <div className="w-16 sm:w-24 aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1">
                               <h3 className="font-bold text-sm sm:text-lg uppercase tracking-tight mb-1">{item.name}</h3>
                               <p className="text-[10px] sm:text-sm text-gray-400 font-mono mb-2 sm:mb-4">Ref: {item.productId ? item.productId.slice(0,6) : 'N/A'}</p>
                               <div className="flex flex-wrap items-center gap-2">
                                 <div className="flex items-center space-x-2 sm:space-x-4 bg-white rounded-full px-3 sm:px-4 py-1 sm:py-2 w-fit border border-gray-50">
                                   <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">Qty: {item.quantity}</span>
                                 </div>
                                 {item.size && (
                                   <div className="flex items-center space-x-2 sm:space-x-4 bg-black text-white rounded-full px-3 sm:px-4 py-1 sm:py-2 w-fit">
                                     <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Size: {item.size}</span>
                                   </div>
                                 )}
                               </div>
                             </div>
                          </div>
                          <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-none pt-4 sm:pt-0 gap-4">
                             <p className="text-lg sm:text-xl font-bold font-mono">₹{(item.price * item.quantity).toLocaleString()}</p>
                             <button 
                               onClick={() => removeFromCart(item.productId, item.size)}
                               className="p-2 sm:p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                             >
                               <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-8">
                       <Link to="/shop" className="text-xs font-bold uppercase tracking-[0.2em] flex items-center hover:translate-x-1 transition-transform">
                         <ChevronLeft className="w-4 h-4 mr-2" />
                         Back to Shop
                       </Link>
                       <button 
                         onClick={() => setStep('checkout')}
                         className="bg-black text-white px-12 py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-2xl shadow-black/10 flex items-center space-x-4 group"
                       >
                         <span>Confirm Logistics</span>
                         <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </>
                ) : (
                  <div className="py-32 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8">
                       <ShoppingBag className="w-8 h-8 text-gray-200" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tighter uppercase mb-4">Your bag is currently empty.</h2>
                    <p className="text-gray-400 text-sm max-w-xs mb-10 italic">Looks like you haven't added any refined styles to your collection yet.</p>
                    <Link to="/shop" className="bg-black text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">Start Shopping</Link>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleCheckout} className="space-y-12">
                   <div className="bg-gray-50 rounded-[3rem] p-10 md:p-16 space-y-10 border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="col-span-full">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Full Legal Name</label>
                            <div className="relative">
                               <input 
                                 required
                                 type="text" 
                                 placeholder="name"
                                 value={address.fullName}
                                 onChange={(e) => setAddress({...address, fullName: e.target.value})}
                                 className="w-full bg-white border border-transparent rounded-[1.5rem] px-12 py-5 text-sm focus:border-black transition-all outline-none"
                               />
                               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            </div>
                         </div>
                         <div className="col-span-full">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Email for Manifest & Notifications</label>
                            <div className="relative">
                               <input 
                                 required
                                 type="email" 
                                 placeholder="email@example.com"
                                 value={address.email}
                                 onChange={(e) => setAddress({...address, email: e.target.value})}
                                 className="w-full bg-white border border-transparent rounded-[1.5rem] px-12 py-5 text-sm focus:border-black transition-all outline-none"
                               />
                               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            </div>
                         </div>
                         <div className="col-span-full">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Secret Delivery Location</label>
                            <div className="relative">
                               <textarea 
                                 required
                                 placeholder="Door No, Street Name, Landmark..."
                                 rows={3}
                                 value={address.street}
                                 onChange={(e) => setAddress({...address, street: e.target.value})}
                                 className="w-full bg-white border border-transparent rounded-[1.5rem] px-12 py-5 text-sm focus:border-black transition-all outline-none resize-none"
                               />
                               <MapPin className="absolute left-4 top-6 w-4 h-4 text-gray-300" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Zip Code</label>
                            <input 
                              required
                              type="text" 
                              placeholder="620018"
                              value={address.zipCode}
                              onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                              className="w-full bg-white border border-transparent rounded-[1.5rem] px-6 py-5 text-sm focus:border-black transition-all outline-none font-mono"
                            />
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Secure Phone Number</label>
                            <div className="relative">
                               <input 
                                 required
                                 type="tel" 
                                 placeholder="+91 98765 43210"
                                 value={address.phone}
                                 onChange={(e) => setAddress({...address, phone: e.target.value})}
                                 className="w-full bg-white border border-transparent rounded-[1.5rem] px-12 py-5 text-sm focus:border-black transition-all outline-none"
                               />
                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            </div>
                         </div>
                      </div>
                   </div>

                  <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] space-y-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold tracking-tight uppercase text-lg">Payment Instructions</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direct Transfer via UPI / Mobile</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-xs leading-relaxed italic max-w-md">
                      To complete your purchase, please transfer the total amount to the owner's mobile number below. 
                      Once paid, your order will be activated after verification.
                    </p>

                    <div className="bg-[#fdfbf7] p-8 rounded-[2rem] border border-black/5 flex items-center justify-between">
                      <div>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Owner's UPI / Mobile</span>
                         <span className="text-2xl font-mono font-bold tracking-tighter text-black">+91 93452 75150</span>
                      </div>
                      <button 
                         type="button"
                         onClick={() => {
                           navigator.clipboard.writeText('+91 93452 75150');
                           toast.success('Number copied');
                         }}
                         className="px-6 py-3 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                      >
                         COPY
                      </button>
                    </div>

                    <div className="flex items-center space-x-4 p-5 bg-green-50 rounded-2xl border border-green-100/50">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] text-green-800 font-medium leading-relaxed">
                        Share your payment screenshot on WhatsApp to the same number for instant order confirmation.
                      </p>
                    </div>
                  </div>

                  <button 
                     type="submit"
                     disabled={loading}
                     className="w-full bg-black text-white py-6 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center space-x-4 shadow-2xl shadow-black/10"
                   >
                     {loading ? 'Processing Transaction...' : (
                       <>
                         <CreditCard className="w-5 h-5" />
                         <span>Finalize Order & Pay ₹{total.toLocaleString()}</span>
                       </>
                     )}
                   </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
        {items.length > 0 && (
          <aside className="w-full lg:w-96 shrink-0">
             <div className="sticky top-32 bg-gray-50 rounded-[3rem] p-10 border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-full -mr-8 -mt-8" />
                <h3 className="text-xl font-bold tracking-tighter uppercase mb-10">Order Summary</h3>
                
                <div className="space-y-6 mb-10 scrollbar-thin max-h-[30vh] overflow-y-auto pr-2">
                   {(items || []).map((item) => (
                     <div key={item.productId + (item.size || '')} className="flex justify-between items-center text-sm">
                        <div className="flex-1 pr-4">
                          <span className="text-gray-500 line-clamp-1">{item.name} × {item.quantity}</span>
                          {item.size && <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Size: {item.size}</span>}
                        </div>
                        <span className="font-bold font-mono">₹{(item.price * item.quantity).toLocaleString()}</span>
                     </div>
                   ))}
                </div>

                <div className="space-y-4 pt-10 border-t border-gray-200">
                   <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="font-mono">₹{total.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>Logistics</span>
                      <span className="text-green-500">Gratis (Free)</span>
                   </div>
                   <div className="pt-6 flex justify-between items-center">
                      <span className="text-lg font-bold uppercase tracking-tighter">Total Due</span>
                      <span className="text-3xl font-bold font-mono tracking-tighter">₹{total.toLocaleString()}</span>
                   </div>
                </div>

                <div className="mt-12 p-6 bg-white rounded-3xl border border-gray-50 flex items-center space-x-4">
                   <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <p className="text-[10px] text-gray-400 leading-relaxed italic">Your transaction is secured by end-to-end military grade encryption.</p>
                </div>
             </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// Helper icons that aren't in lucide or custom versions
