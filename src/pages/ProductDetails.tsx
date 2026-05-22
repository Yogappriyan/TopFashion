import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, RefreshCw, Send, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const productDoc = await getDoc(doc(db, 'products', id));
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() } as Product;
          setProduct(productData);
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0]);
          }
        } else {
          toast.error('Product not found');
          navigate('/shop');
        }

        const reviewsQ = query(collection(db, 'reviews'), where('productId', '==', id));
        const reviewsSnapshot = await getDocs(reviewsQ);
        setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (profile?.wishlist && id) {
      setIsWishlisted(profile.wishlist.includes(id));
    }
  }, [profile, id]);

  const toggleWishlist = async () => {
    if (!user) return toast.error('Please sign in first');
    if (!id) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      if (isWishlisted) {
        await updateDoc(userRef, { wishlist: arrayRemove(id) });
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await updateDoc(userRef, { wishlist: arrayUnion(id) });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return toast.error('Please select a size');
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
      size: selectedSize
    });
    toast.success('Added to cart');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return toast.error('Please sign in to leave a review');
    if (!newReview.comment) return toast.error('Please enter a comment');

    try {
      const reviewData = {
        productId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'reviews'), reviewData);
      toast.success('Review submitted');
      setNewReview({ rating: 5, comment: '' });
      // Refresh reviews locally
      setReviews(prev => [{ ...reviewData, id: 'tmp', createdAt: new Date() } as Review, ...prev]);
    } catch (error) {
      toast.error('Submission failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse">Designing Details...</div>;
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 mb-16 md:mb-24">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] sm:aspect-[3/4] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group">
             <AnimatePresence mode="wait">
               <motion.img 
                 key={activeImage}
                 initial={{ opacity: 0, scale: 1.1 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.5 }}
                 src={product.images[activeImage]} 
                 alt={product.name} 
                 className="w-full h-full object-cover"
               />
             </AnimatePresence>
             
             {product.images.length > 1 && (
               <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                  className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white text-black transition-all"
                 >
                   <ChevronLeft className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                   className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white text-black transition-all"
                 >
                   <ChevronRight className="w-5 h-5" />
                 </button>
               </div>
             )}
          </div>
          
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 scrollbar-none justify-start sm:justify-center">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-16 sm:w-24 aspect-[4/5] sm:aspect-[3/4] rounded-lg sm:rounded-2xl overflow-hidden border-2 transition-all p-1 ${
                  activeImage === idx ? 'border-black' : 'border-transparent opacity-50 grayscale hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover rounded-md sm:rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-6 md:mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-6">
               <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 block">{product.category}</span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-tight">{product.name}</h1>
               </div>
               <button 
                 onClick={toggleWishlist}
                 className={`p-3 sm:p-4 rounded-full border transition-all self-end sm:self-start ${
                   isWishlisted ? 'bg-black text-white border-black shadow-xl ring-4 ring-black/10' : 'bg-white text-gray-400 border-gray-100 hover:border-black'
                 }`}
               >
                 <Heart className={`w-5 h-5 sm:w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
               </button>
            </div>
            
            <div className="flex items-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
              <p className="text-2xl sm:text-3xl font-bold font-mono">₹{product.price.toLocaleString()}</p>
              <div className="flex items-center space-x-2 border-l border-gray-100 pl-4 sm:pl-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-black text-black' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-400">({reviews.length} REVIEWS)</span>
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed max-w-lg mb-10 italic">
              {product.description}
            </p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Size</span>
                   <button className="text-[9px] font-bold uppercase tracking-widest text-black border-b border-black">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[56px] h-14 rounded-2xl flex items-center justify-center font-bold text-xs transition-all border ${
                        selectedSize === size 
                        ? 'bg-black text-white border-black shadow-xl ring-4 ring-black/5' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                 <div className="bg-gray-50 p-2 rounded-2xl flex items-center justify-between sm:justify-start sm:space-x-4 border border-gray-100">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center font-bold text-lg hover:text-black text-gray-400 transition-colors"
                    >-</button>
                    <span className="font-bold text-sm w-8 text-center">{quantity}</span>
                    <button 
                       onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                       className="w-10 h-10 flex items-center justify-center font-bold text-lg hover:text-black text-gray-400 transition-colors"
                    >+</button>
                 </div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   {product.stock} items left in stock
                 </span>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-black text-white py-6 rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center space-x-4 shadow-2xl shadow-black/10"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Shopping Bag'}</span>
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
             <div className="flex items-start space-x-4 p-5 rounded-3xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-sm transition-all">
                <Truck className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                <div>
                   <h5 className="text-[10px] font-bold uppercase mb-1">Fast Shipping</h5>
                   <p className="text-[10px] text-gray-500">Free delivery for orders above ₹5,000</p>
                </div>
             </div>
             <div className="flex items-start space-x-4 p-5 rounded-3xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-sm transition-all">
                <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                <div>
                   <h5 className="text-[10px] font-bold uppercase mb-1">Easy Returns</h5>
                   <p className="text-[10px] text-gray-500">7-day hassle-free return policy</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Reviews & Feedback */}
      <section className="bg-white rounded-[3rem] border border-gray-100 p-10 md:p-16 mb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-black" />
        <div className="max-w-4xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 text-center md:text-left">
              <div>
                 <h2 className="text-4xl font-bold tracking-tighter uppercase mb-4">Customer Opinions</h2>
                 <p className="text-gray-500 max-w-sm italic">Read what others say about the {product.name}. Honest feedback from real buyers.</p>
              </div>
              <div className="bg-gray-50 px-8 py-6 rounded-3xl border border-gray-100 shrink-0">
                 <div className="flex items-center space-x-2 justify-center mb-1">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className={`w-5 h-5 ${i < 4 ? 'fill-black text-black' : 'text-gray-200'}`} />
                   ))}
                 </div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">4.0 Average Rating</p>
              </div>
           </div>

           {/* Review Form */}
           {user ? (
             <form onSubmit={handleSubmitReview} className="mb-20 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
               <div className="flex flex-col md:flex-row gap-8 mb-6">
                 <div className="shrink-0">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Your Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button 
                          key={s} 
                          type="button"
                          onClick={() => setNewReview({...newReview, rating: s})}
                          className={`p-2 transition-all ${newReview.rating >= s ? 'text-black' : 'text-gray-200'}`}
                        >
                          <Star className={`w-6 h-6 ${newReview.rating >= s ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                 </div>
                 <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Share your experience</label>
                    <textarea 
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      placeholder="Was the fit as expected? How was the fabric quality?"
                      className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-sm focus:outline-none focus:ring-1 focus:ring-black placeholder:text-gray-300 transition-all resize-none"
                    />
                 </div>
               </div>
               <button 
                 type="submit"
                 className="flex items-center space-x-3 bg-black text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 ml-auto"
               >
                 <span>Post Review</span>
                 <Send className="w-4 h-4" />
               </button>
             </form>
           ) : (
             <div className="mb-20 p-10 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 text-center">
               <p className="text-gray-400 text-sm mb-6 italic uppercase font-bold tracking-widest">Sign in to share your feedback</p>
               <button onClick={() => navigate('/login')} className="px-10 py-4 bg-white border border-gray-100 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">Authorize</button>
             </div>
           )}

           {/* Review List */}
           <div className="space-y-12">
             {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="group">
                    <div className="flex flex-col md:flex-row gap-8">
                       <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-300 uppercase italic">
                         {review.userName[0]}
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                             <div>
                               <h4 className="font-bold text-sm uppercase tracking-tight">{review.userName}</h4>
                               <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                                 {review.createdAt?.toDate?.() ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                               </p>
                             </div>
                             <div className="flex">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-black text-black' : 'text-gray-200'}`} />
                               ))}
                             </div>
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{review.comment}</p>
                       </div>
                    </div>
                  </div>
                ))
             ) : (
               <div className="text-center py-10 opacity-30">
                  <Star className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Be the first to review</p>
               </div>
             )}
           </div>
        </div>
      </section>
    </div>
  );
}
