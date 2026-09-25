import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { registerNewUserSession } from '../services/sessionManager';

interface RegisterScreenProps {
  onSuccess: (name: string, email: string) => void;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export default function RegisterScreen({ onSuccess, onNavigateToLogin, onNavigateToLanding }: RegisterScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleRegisterInProgress = useRef(false);

  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [dimensions, setDimensions] = useState({ width: '100%', height: '100%' });

  useEffect(() => {
    const handleResize = () => {
      // Fit poster into viewport with some safe margins
      const parentWidth = window.innerWidth * 0.95;
      const parentHeight = window.innerHeight * 0.92;
      const imgAspect = 1024 / 1536; // Exact aspect ratio of WA0058.jpg (1024x1536, i.e. 2/3)

      let width = 0;
      let height = 0;

      if (parentWidth / parentHeight > imgAspect) {
        // Window is wider: constrain by height
        height = parentHeight;
        width = parentHeight * imgAspect;
      } else {
        // Window is taller: constrain by width
        width = parentWidth;
        height = parentWidth / imgAspect;
      }

      setDimensions({
        width: `${width}px`,
        height: `${height}px`,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.');
      return;
    }

    if (!agreedToTerms) {
      setError('يرجى الموافقة على الشروط والأحكام للمتابعة.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username.trim();

      // 1. Check if email is already in use in Firestore
      const emailQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailQ);
      if (!emailSnap.empty) {
        setError('❌ هذا البريد الإلكتروني مستخدم بالفعل لحساب آخر. لا يمكن إنشاء أكثر من حساب بنفس البريد الإلكتروني.');
        setLoading(false);
        return;
      }

      // 2. Check if username is already taken in Firestore
      const usersSnap = await getDocs(collection(db, 'users'));
      const isUsernameTaken = usersSnap.docs.some(docSnap => {
        const u = docSnap.data().username;
        return u && u.trim().toLowerCase() === cleanUsername.toLowerCase();
      });
      if (isUsernameTaken) {
        setError('❌ اسم القبطان هذا مستخدم بالفعل لدى لاعب آخر. يرجى اختيار اسم غير مكرر.');
        setLoading(false);
        return;
      }

      const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (result.user && result.user.email) {
        // Save username to firestore database user profile
        try {
          const userDocRef = doc(db, 'users', result.user.uid);
          await setDoc(userDocRef, {
            userId: result.user.uid,
            username: cleanUsername,
            email: cleanEmail,
            avatar: '⚓',
            server: 'سيرفر الأسطورة 1',
            pirateClass: 'صياد البحار',
            gold: 500,
            gems: 25,
            exp: 0,
            redGems: 2450,
            fishStorageLevel: 1,
            shipTowerLevel: 1,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (dbErr) {
          console.error("Error setting initial profile in Firestore during registration:", dbErr);
        }

        const token = await result.user.getIdToken();
        localStorage.setItem('google_auth_token', token);
        localStorage.setItem('google_auth_email', result.user.email);
        localStorage.setItem('google_auth_name', cleanUsername);
        localStorage.setItem('google_auth_uid', result.user.uid);

        // Register unique active session in Firestore to invalidate any old sessions
        await registerNewUserSession(result.user.uid);

        onSuccess(cleanUsername, result.user.email);
      }
    } catch (err: any) {
      console.error('Email registration error:', err);
      let message = 'حدث خطأ أثناء إنشاء الحساب. يرجى إعادة المحاولة.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'هذا البريد الإلكتروني مستخدم بالفعل لدى قبطان آخر.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'صيغة البريد الإلكتروني المدخل غير صالحة.';
      } else if (err.code === 'auth/weak-password') {
        message = 'كلمة المرور ضعيفة للغاية. يرجى اختيار كلمة مرور أقوى.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleRegisterInProgress.current) return;
    googleRegisterInProgress.current = true;
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.email) {
        let name = user.displayName || user.email.split('@')[0];
        const cleanEmail = user.email.toLowerCase().trim();

        // Check if there is an existing username in Firestore
        try {
          const emailQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const emailSnap = await getDocs(emailQ);
          if (!emailSnap.empty) {
            const existingData = emailSnap.docs[0].data();
            if (existingData.username) {
              name = existingData.username;
            }
          }
        } catch (dbErr) {
          console.error("Error checking existing user doc in Google Sign-In:", dbErr);
        }

        const token = await user.getIdToken();
        localStorage.setItem('google_auth_token', token);
        localStorage.setItem('google_auth_email', user.email);
        localStorage.setItem('google_auth_name', name);
        if (user.photoURL) {
          localStorage.setItem('google_auth_avatar', user.photoURL);
        }

        // Register unique active session in Firestore to invalidate any old sessions
        await registerNewUserSession(user.uid);

        onSuccess(name, user.email);
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        console.warn('Google auth register popup dismissed:', err.code);
      } else {
        console.warn('Google auth register notice:', err);
      }
      let userFriendlyMessage = 'حدث خطأ غير متوقع أثناء تسجيل الدخول أو إنشاء الحساب عبر Google.';
      
      if (err.code === 'auth/popup-blocked') {
        userFriendlyMessage = 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة أو استخدام الدخول السريع في شاشة الدخول.';
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = 'تم إغلاق نافذة الدخول عبر Google.';
      } else if (err.code === 'auth/network-request-failed' || err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        onNavigateToLogin();
        return;
      }
      setError(userFriendlyMessage);
    } finally {
      googleRegisterInProgress.current = false;
      setLoading(false);
    }
  };

  return (
    <div
      id="register-screen-container"
      className="min-h-screen w-full bg-[#04060b] text-white flex flex-col items-center justify-center font-['Cairo',_sans-serif] relative p-4 overflow-hidden select-none"
      dir="rtl"
    >
      {/* Deep Sea Blurred Epic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-lg scale-105 opacity-35 z-0 pointer-events-none"
        style={{ backgroundImage: `url('https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG-20260722-WA0058.jpg')` }}
      />
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      {/* Main Poster Container with exact Mockup Aspect Ratio */}
      <div
        id="register-poster"
        className="relative rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden z-10 transition-all duration-300 flex flex-col items-center justify-center bg-slate-950"
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
        }}
      >
        {/* Complete high-fidelity graphic illustration serving as the exact locked background */}
        <img
          src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG-20260722-WA0058.jpg"
          alt="بوابة إنشاء حساب جديد"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
          referrerPolicy="no-referrer"
        />
        
        {/* Dynamic Alerts rendered as an elegant fixed top-center toast to prevent any overlapping inside the graphic */}
        {error && (
          <div 
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-red-950/95 border-2 border-red-500/50 rounded-2xl p-4 text-red-100 flex items-start gap-3 shadow-[0_20px_50px_rgba(239,68,68,0.45)] animate-slide-in font-['Cairo',_sans-serif]"
            dir="rtl"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-right">
              <h5 className="font-extrabold text-xs sm:text-sm text-red-300">تنبيه من بوابة التسجيل</h5>
              <p className="text-[11px] sm:text-xs mt-1 leading-relaxed font-bold">{error}</p>
            </div>
            <button 
              onClick={() => setError('')} 
              className="text-red-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-red-900/50 text-xs font-black shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleRegister} className="absolute inset-0 z-20 pointer-events-none">
          
          {/* Box 1: Username Input */}
          <div 
            className="absolute pointer-events-auto"
            style={{ top: '34.5%', left: '24.2%', width: '51.6%', height: '4.2%' }}
          >
            <div className="relative w-full h-full flex items-center">
              <input
                id="register-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
                className={`w-full h-full rounded-lg pr-4 pl-4 text-[11px] sm:text-xs md:text-sm font-black focus:outline-none focus:ring-2 focus:ring-amber-500/35 transition-all text-right ${
                  usernameFocused || username !== ''
                    ? 'bg-[#e5caa0] border border-[#664b30]/40 text-[#2b1604]'
                    : 'bg-transparent border border-transparent text-transparent placeholder-transparent'
                }`}
                required
              />
            </div>
          </div>

          {/* Box 2: Email Input */}
          <div 
            className="absolute pointer-events-auto"
            style={{ top: '40.9%', left: '24.2%', width: '51.6%', height: '4.2%' }}
          >
            <div className="relative w-full h-full flex items-center">
              <input
                id="register-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className={`w-full h-full rounded-lg pr-4 pl-4 text-[11px] sm:text-xs md:text-sm font-black focus:outline-none focus:ring-2 focus:ring-amber-500/35 transition-all text-right ${
                  emailFocused || email !== ''
                    ? 'bg-[#e5caa0] border border-[#664b30]/40 text-[#2b1604]'
                    : 'bg-transparent border border-transparent text-transparent placeholder-transparent'
                }`}
                required
              />
            </div>
          </div>

          {/* Box 3: Password Input */}
          <div 
            className="absolute pointer-events-auto"
            style={{ top: '47.2%', left: '24.2%', width: '51.6%', height: '4.2%' }}
          >
            <div className="relative w-full h-full flex items-center">
              <input
                id="register-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className={`w-full h-full rounded-lg pr-4 pl-12 text-[11px] sm:text-xs md:text-sm font-black focus:outline-none focus:ring-2 focus:ring-amber-500/35 transition-all text-right ${
                  passwordFocused || password !== ''
                    ? 'bg-[#e5caa0] border border-[#664b30]/40 text-[#2b1604]'
                    : 'bg-transparent border border-transparent text-transparent placeholder-transparent'
                }`}
                required
                minLength={6}
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute left-3 w-5 h-5 flex items-center justify-center text-[#664b30]/75 hover:text-[#2b1604] transition-opacity duration-200 z-10 ${
                  passwordFocused || password !== '' ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Box 4 Cover: Hiding the pre-printed Invitation Code field from the background image as requested */}
          <div 
            className="absolute z-10 rounded-lg flex items-center justify-center select-none overflow-hidden"
            style={{ 
              top: '53.5%', 
              left: '24.2%', 
              width: '51.6%', 
              height: '4.2%',
              background: 'linear-gradient(to bottom, #19120c, #130c06)',
              border: '1px solid #2d1e13',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.9), 0 1px 2px rgba(255,255,255,0.05)'
            }}
          >
            <div className="text-[10px] sm:text-xs font-black text-[#5c4a38]/45 tracking-wider font-['Cairo',_sans-serif]">
              ⚓ مَـرْسَـى الْـمُـلُـوكِ ⚓
            </div>
          </div>

          {/* Agreed to Terms Checkbox overlay */}
          <div 
            className="absolute pointer-events-auto flex items-center justify-center select-none cursor-pointer"
            style={{ top: '58.8%', left: '24.2%', width: '51.6%', height: '2.5%' }}
            onClick={() => setAgreedToTerms(!agreedToTerms)}
          >
            {/* Draw a small clean solid background box right over the pre-printed checkbox to render the checked/unchecked state cleanly */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-[#664b30]/40 bg-[#e5caa0] flex items-center justify-center z-10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
              {agreedToTerms && (
                <span className="text-[#2b1604] text-[10px] sm:text-xs font-black select-none">✓</span>
              )}
            </div>
            {/* Invisible text placeholder to occupy space and capture clicks, perfectly matching the alignment */}
            <span className="text-[10px] sm:text-xs font-black text-transparent select-none leading-none pr-6 w-full text-right">
              أوافق على الشروط والأحكام وسياسة الخصوصية
            </span>
          </div>

          {/* Submit Register Button */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="absolute pointer-events-auto rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all active:scale-[0.97] hover:bg-yellow-500/10 hover:shadow-[0_0_20px_rgba(251,191,36,0.35)]"
            style={{ top: '64.0%', left: '24.2%', width: '51.6%', height: '4.3%' }}
          >
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin text-[#fbd172] z-10" />
            )}
          </button>

          {/* Google Login button placeholder */}
          <button
            id="register-google-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="absolute pointer-events-auto rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all active:scale-[0.97] hover:bg-white/10"
            style={{ top: '74.1%', left: '24.2%', width: '51.6%', height: '4.3%' }}
          >
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin text-amber-600 z-10" />
            )}
          </button>

          {/* Already have account -> Navigate to Login */}
          <button
            id="goto-login-btn"
            type="button"
            onClick={onNavigateToLogin}
            className="absolute pointer-events-auto rounded flex items-center justify-center cursor-pointer bg-transparent border-none text-transparent"
            style={{ top: '80.5%', left: '30%', width: '40%', height: '2.5%' }}
          >
            لديك حساب بالفعل؟ سجل الدخول
          </button>

          {/* Quick Landing Back-button if they click top area logo/chains */}
          <div 
            onClick={onNavigateToLanding}
            className="absolute pointer-events-auto cursor-pointer"
            style={{ top: '1.2%', left: '44%', width: '12%', height: '8%' }}
            title="العودة لشاشة البدء"
          />

        </form>
      </div>

      <style>{`
        @keyframes slide-in {
          0% { transform: translate(-50%, -100%) scale(0.9); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
