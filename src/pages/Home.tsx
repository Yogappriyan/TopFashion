import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const categories = [
    { name: 'Bespoke Suits', image: 'https://i.postimg.cc/QtjZ10rb/Screenshot-2026-05-17-194920.png', description: 'THE ART OF TAILORING' },
    { name: 'Modern Casual', image: 'https://i.postimg.cc/5tMhWnyn/Screenshot-2026-05-17-194804.png', description: 'REFINED SIMPLICITY' },
    { name: 'Heritage Ethnic', image: 'https://i.postimg.cc/6QLDWnGC/Screenshot-2026-05-17-194159.png', description: 'TRADITIONAL ELEGANCE' },
    { name: 'Signature Trousers', image: 'https://i.postimg.cc/Y9rTh018/Screenshot-2026-05-17-193914.png', description: 'PERFECTION IN FIT' },
    { name: 'Designer Shirts', image: 'https://i.postimg.cc/bJmWbPgp/Screenshot-2026-05-17-193837.png', description: 'CRAFTED COMFORT' },
    { name: 'Essential Accessories', image: 'https://i.postimg.cc/NFVnJxZC/Screenshot-2026-05-17-193641.png', description: 'COMPLETE THE LOOK' }
  ];

  return (
    <div className="flex flex-col bg-[#fdfbf7]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero_fashion_men.png" 
            alt="Hero Fashion" 
            className="w-full h-full object-cover grayscale-[0.2] brightness-75"
            onError={(e) => {
               e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl text-white"
          >
            <span className="inline-block text-[10px] font-bold tracking-[0.4em] uppercase mb-10 text-white/60">
              COLLECTION 2024 / TRICHY, INDIA
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-serif tracking-tighter leading-[0.85] mb-12">
              Bespoke <br /> 
              <span className="italic font-light">Elegance.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-16 max-w-xl font-serif italic border-l border-white/20 pl-8">
              "True fashion is the ultimate expression of self." — Explore our latest curated collections.
            </p>
            <div className="flex flex-wrap gap-8">
              <button 
                onClick={() => navigate('/shop')}
                className="bg-white text-black px-12 py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-700 flex items-center group shadow-2xl"
              >
                Enter Boutique
                <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-8 md:gap-12">
            <div>
              <h2 className="text-4xl sm:text-6xl font-serif tracking-tighter uppercase mb-6 italic">The Gallery</h2>
              <p className="text-gray-400 font-medium tracking-wide uppercase text-[10px]">EXPLORE OUR SEASONAL NARRATIVES</p>
            </div>
            <button 
              onClick={() => navigate('/shop')}
              className="group flex items-center space-x-6 text-[10px] font-bold uppercase tracking-[0.3em] border-b border-black pb-2"
            >
              <span>See All Chapters</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-16">
            {categories.map((cat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/shop?category=${cat.name.split(' ')[1] || cat.name}`)}
              >
                <div className="relative aspect-[4/6] overflow-hidden mb-10 shadow-2xl transition-all duration-1000">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-1000" />
                </div>
                <h3 className="text-2xl font-serif italic mb-3">{cat.name}</h3>
                <p className="text-gray-400 text-[9px] font-bold tracking-[0.4em] uppercase">{cat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="py-20 md:py-40 bg-white border-t border-black/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
          <div className="order-2 md:order-1">
             <div className="aspect-[4/5] sm:aspect-[3/4] bg-gray-50 overflow-hidden shadow-2xl relative">
                <img 
                  src="https://i.postimg.cc/XXSRN8xy/Chat-GPT-Image-May-17-2026-08-05-36-PM.png" 
                  alt="Suit Detail" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 text-white z-10">
                   <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.3em] uppercase mb-4">SINCE 2018</p>
                   <h4 className="text-3xl sm:text-4xl font-serif italic"></h4>
                </div>
             </div>
          </div>
          <div className="order-1 md:order-2 space-y-8 md:space-y-12">
            <span className="text-[10px] font-bold tracking-[0.5em] text-gray-400 uppercase">OUR RESIDENCE</span>
            <h2 className="text-4xl sm:text-6xl font-serif tracking-tight leading-none uppercase">
              Tiruchirappalli <br />
              <span className="italic font-light lowercase">Signature.</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed font-serif italic">
              Experience the legacy of Top Fashion at the ASR Complex, Shastri Road. 
              A destination where tradition meets the contemporary pulse of global style.
            </p>
            <div className="pt-8 border-t border-black/5 flex items-center space-x-8 md:space-x-12">
               <div>
                  <p className="text-2xl md:text-3xl font-serif">4.4</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-gray-300 tracking-widest uppercase mt-2">Global Rating</p>
               </div>
               <div className="w-[1px] h-10 md:h-12 bg-black/5" />
               <div>
                  <p className="text-2xl md:text-3xl font-serif">5000+</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-gray-300 tracking-widest uppercase mt-2">Suits Crafted</p>
               </div>
            </div>
            <button 
              onClick={() => window.open('https://www.google.com/maps/dir//Top+Fashion+Mens+wear,+1st+floor,+Shastri+Rd,+above+Aswins+sweets,+near+Ibaco,+North+East+Extension,+Tennur,+Tiruchirappalli,+Tamil+Nadu+620018', '_blank')}
              className="w-full sm:w-auto bg-black text-white px-12 py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all shadow-xl"
            >
              Consult the Map
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
