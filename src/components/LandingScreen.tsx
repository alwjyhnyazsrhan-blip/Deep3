import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, LogIn, ChevronLeft, HelpCircle, Info, Compass, Anchor } from 'lucide-react';

interface LandingScreenProps {
  onStartFree: () => void;
  onLogin: () => void;
}

export default function LandingScreen({ onStartFree, onLogin }: LandingScreenProps) {
  // Active hovered hotspot state to display rich, immersive tooltips
  const [hoveredItem, setHoveredItem] = useState<{
    id: string;
    title: string;
    desc: string;
  } | null>(null);

  // Sound toggler state (just for visual immersive game effect)
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Dynamic dimensions for the aspect-ratio locked container that covers the viewport
  const [dimensions, setDimensions] = useState({ width: '100vw', height: '100vh' });
  const [imgAspect, setImgAspect] = useState(759 / 1600); // Corrected portrait aspect ratio (759x1600)
  const [imgLoaded, setImgLoaded] = useState(false);

  // Programmatically detect the background image dimensions to get the true aspect ratio
  useEffect(() => {
    const img = new Image();
    img.src = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG-20260722-WA0063.jpg";
    img.onload = () => {
      if (img.width && img.height) {
        setImgAspect(img.width / img.height);
        setImgLoaded(true);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const screenAspect = screenWidth / screenHeight;

      let width = 0;
      let height = 0;

      // Fit the board inside the screen while maintaining its exact aspect ratio
      if (screenAspect > imgAspect) {
        // Screen is wider than the image (e.g. desktop monitor)
        // Fit height to screen, let width scale proportionally
        height = screenHeight;
        width = screenHeight * imgAspect;
      } else {
        // Screen is taller than the image (e.g. mobile phone in portrait)
        // Fit width to screen, let height scale proportionally
        width = screenWidth;
        height = screenWidth / imgAspect;
      }

      setDimensions({
        width: `${width}px`,
        height: `${height}px`,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, [imgAspect, imgLoaded]);

  // List of interactive hotspot definitions mapped to the exact locations of the user's design image
  const hotspots = [
    // Top bar menu items (from left to right in Arabic layout)
    {
      id: 'nav-main',
      title: 'الرئيسية',
      desc: 'أنت متواجد الآن في مرفأ ملوك الأعماق الرئيسي.',
      style: { top: '35.0%', left: '12.5%', width: '15.0%', height: '3.2%' },
      action: () => {} // Already on home
    },
    {
      id: 'nav-ships',
      title: 'أكاديمية السفن',
      desc: 'استعرض سفن الأسطول والقطع النادرة والترقيات المتاحة.',
      style: { top: '35.0%', left: '27.5%', width: '15.0%', height: '3.2%' },
      action: onStartFree
    },
    {
      id: 'nav-inventory',
      title: 'مخزن الكنوز',
      desc: 'حقيبتك الخاصة والمعدات النادرة وصيد اليوم الثمين.',
      style: { top: '35.0%', left: '42.5%', width: '15.0%', height: '3.2%' },
      action: onStartFree
    },
    {
      id: 'nav-seas',
      title: 'البحار المفتوحة',
      desc: 'خريطة الإبحار ومناطق صيد الهامور ومواقع الغزوات والكنوز.',
      style: { top: '35.0%', left: '57.5%', width: '15.0%', height: '3.2%' },
      action: onStartFree
    },
    {
      id: 'nav-events',
      title: 'الفعاليات الكبرى',
      desc: 'تحديات أسبوعية وجوائز كبرى لصيادي الأعماق المهرة.',
      style: { top: '35.0%', left: '72.5%', width: '15.0%', height: '3.2%' },
      action: onStartFree
    },

    // Left sidebar buttons (vertical stack)
    {
      id: 'side-events',
      title: 'الأحداث اليومية',
      desc: 'مهمات وطلبات خاصة من كبار تجار المرفأ بجوائز مضاعفة.',
      style: { top: '43.3%', left: '6.0%', width: '20.5%', height: '4.0%' },
      action: onStartFree
    },
    {
      id: 'side-offers',
      title: 'العروض المميزة',
      desc: 'حزم الدعم الأسبوعية، والتمويل الذهبي لأسطولك بأسعار استثنائية.',
      style: { top: '48.5%', left: '6.0%', width: '20.5%', height: '4.0%' },
      action: onStartFree
    },
    {
      id: 'side-rankings',
      title: 'ترتيب الهوامير',
      desc: 'استعرض أقوى قباطنة السيرفر، وأكثر الصيادين نفوذاً وثروة.',
      style: { top: '53.7%', left: '6.0%', width: '20.5%', height: '4.0%' },
      action: onStartFree
    },
    {
      id: 'side-messages',
      title: 'صندوق البريد',
      desc: 'تواصل مع القباطنة الآخرين وتلقى تقارير المعارك والتحالفات.',
      style: { top: '58.9%', left: '6.0%', width: '20.5%', height: '4.0%' },
      action: onStartFree
    },

    // Main central CTA button
    {
      id: 'cta-start',
      title: 'ابدأ المعركة الآن',
      desc: 'اضغط هنا لإنشاء حساب قبطان مجاني والحصول على 500 عملة ذهبية كهدية ترحيبية! 🪙',
      style: { top: '66.8%', left: '27.2%', width: '45.6%', height: '8.2%' },
      action: onStartFree,
      isPrimary: true
    },

    // Bottom bento widgets
    {
      id: 'widget-community',
      title: 'مجتمع ضخم أونلاين',
      desc: 'آلاف اللاعبين العرب بانتظارك في غرف الدردشة المباشرة وبحار التحدي لتكوين أقوى أسطول.',
      style: { top: '76.0%', left: '7.2%', width: '27.6%', height: '8.8%' },
      action: onStartFree
    },
    {
      id: 'widget-alliances',
      title: 'التحالفات والسيطرة',
      desc: 'انضم أو أنشئ حلفك الخاص لتبادل الموارد، خوض معارك النقابات الكبرى والسيطرة على الجزر.',
      style: { top: '76.0%', left: '36.2%', width: '27.6%', height: '8.8%' },
      action: onStartFree
    },
    {
      id: 'widget-battles',
      title: 'معارك بحرية ملحمية',
      desc: 'مواجهات تكتيكية حية في أعماق البحار ضد وحوش المحيط والسفن الغازية لانتزاع السيادة.',
      style: { top: '76.0%', left: '65.2%', width: '27.6%', height: '8.8%' },
      action: onStartFree
    }
  ];

  return (
    <div
      id="game-landing-screen"
      className="w-full h-screen bg-[#050914] text-white relative select-none overflow-hidden flex items-center justify-center font-['Cairo',_sans-serif]"
      dir="rtl"
    >
      {/* Outer Border Decor to match high-end pirate game aesthetic */}
      <div className="absolute inset-0 border-[8px] border-[#221208]/70 pointer-events-none z-30 shadow-[inset_0_0_40px_rgba(0,0,0,0.95)]"></div>

      {/* Floating Header Control Bar (Transparent glassmorphism overlay at the top) */}
      <div className="absolute top-4 inset-x-4 h-14 bg-slate-950/80 border border-amber-500/20 rounded-xl px-5 flex justify-between items-center z-40 text-xs shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-amber-400/90 hidden sm:inline">حالة السيرفر:</span>
          <span className="font-bold text-slate-100">سيرفر الأسطورة 1 (نشط ومستقر) ⚔️</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/10 text-[10px] sm:text-xs font-bold"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden xs:inline">موسيقى المرفأ</span>
          </button>
          <button
            onClick={onLogin}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all transform hover:scale-105 shadow-[0_4px_12px_rgba(245,158,11,0.25)] text-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>بوابة القبطان (تسجيل الدخول)</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT FILLING MASTER GAME BOARD (The background covers the screen completely and crops proportionally) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center z-10">
        <div
          id="master-canvas-board"
          className="relative transition-all duration-300 ease-out"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: 'none',
            maxHeight: 'none',
          }}
        >
          {/* Complete high-fidelity graphic illustration serving as the cover background */}
          <img
            src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG-20260722-WA0063.jpg"
            alt="ملوك الأعماق"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
            referrerPolicy="no-referrer"
          />

          {/* Interactive Overlay Map for absolute pixel-perfect hotspots */}
          <div className="absolute inset-0 z-10">
            {hotspots.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                style={item.style}
                className={`absolute group cursor-pointer focus:outline-none rounded-xl transition-all duration-300 ${
                  item.isPrimary
                    ? 'border-2 border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                    : 'border border-amber-600/10 hover:border-amber-500/60 bg-transparent hover:bg-amber-500/10 shadow-none hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                }`}
                title={item.title}
                aria-label={item.title}
              >
                {/* Glowing subtle pointer indicator inside non-primary items to draw active feedback */}
                {!item.isPrimary && (
                  <div className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </div>
                )}
                
                {item.isPrimary && (
                  <div className="absolute inset-0 border border-yellow-400/50 rounded-xl animate-pulse"></div>
                )}

                {/* Visual feedback glow ripple inside the button */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-amber-500/10 to-transparent transition-opacity rounded-xl"></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating HUD Information Box (Anchored to the bottom overlay) */}
      <div className="absolute bottom-6 inset-x-6 z-40 max-w-4xl mx-auto bg-gradient-to-r from-[#211208]/95 via-[#361e0f]/95 to-[#211208]/95 border-2 border-[#ca8a04]/50 rounded-2xl p-4 shadow-[0_15px_30px_rgba(0,0,0,0.8)] backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {hoveredItem ? (
          <div className="flex items-center gap-3.5 animate-fadeIn text-right w-full sm:w-auto">
            <div className="bg-[#120703] border border-[#ca8a04]/50 p-2.5 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl">⚓</span>
            </div>
            <div>
              <h4 className="text-amber-400 font-extrabold text-sm md:text-base">{hoveredItem.title}</h4>
              <p className="text-xs md:text-sm text-amber-100/90 mt-1 leading-relaxed font-semibold">{hoveredItem.desc}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5 text-right w-full sm:w-auto">
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center justify-center shrink-0 text-amber-500">
              <Info className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-slate-300 font-bold text-xs md:text-sm">لوحة الإبحار التفاعلية لمرفأ هامور شابك</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-medium">مرر مؤشر الفأرة فوق أزرار الخريطة لتكتشف معالم اللعبة، أو اضغط على الزر المركزي «ابدأ الآن» لخوض المغامرة!</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800/40 pt-3 sm:pt-0">
          <button
            onClick={onStartFree}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-6 py-2.5 rounded-lg transition-all shadow-md"
          >
            ابدأ اللعب مجاناً ⛵
          </button>
        </div>
      </div>

      {/* Floating subtle helper icons for direct support info */}
      <div className="absolute right-4 bottom-24 z-40 hidden lg:flex flex-col gap-2">
        <button 
          onClick={onStartFree}
          className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 p-2 rounded-full text-slate-400 hover:text-amber-400 transition-colors shadow-md"
          title="الدعم الفني"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Custom Styles block for smooth fade in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
