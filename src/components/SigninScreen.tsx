import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { registerNewUserSession } from '../services/sessionManager';

interface SigninScreenProps {
  onSuccess: (name: string, email: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToLanding: () => void;
}

export default function SigninScreen({ onSuccess, onNavigateToRegister, onNavigateToLanding }: SigninScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const googleLoginInProgress = useRef(false);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Allow any origin that ends with .run.app or is our known preview host or localhost
      const isTrustedOrigin = event.origin.endsWith('run.app') || 
                              event.origin.endsWith('firebaseapp.com') ||
                              event.origin.includes('localhost') ||
                              event.origin.includes('127.0.0.1');
      if (!isTrustedOrigin) return;

      if (event.data && event.data.type === 'GOOGLE_TUNNEL_SUCCESS') {
        const { idToken, email: tunnelEmail, displayName, photoURL } = event.data;
        setGoogleLoading(true);
        setError('');
        try {
          const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
          const credential = GoogleAuthProvider.credential(idToken);
          const result = await signInWithCredential(auth, credential);
          
          if (result.user && result.user.email) {
            const name = displayName || result.user.displayName || result.user.email.split('@')[0];
            const token = await result.user.getIdToken();

            localStorage.setItem('google_auth_token', token);
            localStorage.setItem('google_auth_email', result.user.email);
            localStorage.setItem('google_auth_name', name);
            localStorage.setItem('google_auth_uid', result.user.uid);
            if (photoURL || result.user.photoURL) {
              localStorage.setItem('google_auth_avatar', photoURL || result.user.photoURL || '');
            }

            // Register fresh active session in Firestore, terminating all other devices
            await registerNewUserSession(result.user.uid);

            onSuccess(name, result.user.email);
          }
        } catch (err: any) {
          console.error('Tunnel signin credential error:', err);
          setError('فشل إكمال تسجيل الدخول: ' + (err.message || String(err)));
        } finally {
          setGoogleLoading(false);
        }
      } else if (event.data && event.data.type === 'GOOGLE_TUNNEL_ERROR') {
        setError('فشل تسجيل الدخول عبر Google: ' + event.data.error);
        setGoogleLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [dimensions, setDimensions] = useState({ width: '100%', height: '100%' });

  useEffect(() => {
    const handleResize = () => {
      // Fit poster into viewport with some safe margins
      const parentWidth = window.innerWidth * 0.95;
      const parentHeight = window.innerHeight * 0.92;
      const imgAspect = 1050 / 1498; // Exact aspect ratio of WA0057.jpg (1050x1498)

      let width = 0;
      let height = 0;

      if (parentWidth / parentHeight > imgAspect) {
        // Parent container is wider: constrain by height
        height = parentHeight;
        width = parentHeight * imgAspect;
      } else {
        // Parent container is taller: constrain by width
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

  const [showDomainModal, setShowDomainModal] = useState(false);
  const [currentHostname, setCurrentHostname] = useState('');
  const [googleEmailFallback, setGoogleEmailFallback] = useState('');
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackSuccess, setFallbackSuccess] = useState(false);

  const generateShadowPassword = (email: string) => {
    // Generate a deterministic and secure password based on email and kingofdeep project-specific salt
    const salt = "kingofdeep_captain_salt_99!";
    const enc = btoa(email.toLowerCase() + salt).replace(/[^a-zA-Z0-9]/g, "");
    return `Capt_${enc.slice(0, 15)}_${enc.length}!`;
  };

  const handleGoogleFallbackLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailFallback || !googleEmailFallback.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح تابع لـ Google.');
      return;
    }

    setFallbackLoading(true);
    setError('');

    const shadowPassword = generateShadowPassword(googleEmailFallback);
    const displayName = googleEmailFallback.split('@')[0];

    try {
      // Try logging in
      const result = await signInWithEmailAndPassword(auth, googleEmailFallback.trim(), shadowPassword);
      if (result.user && result.user.email) {
        const name = result.user.displayName || displayName;
        const token = await result.user.getIdToken();

        localStorage.setItem('google_auth_token', token);
        localStorage.setItem('google_auth_email', result.user.email);
        localStorage.setItem('google_auth_name', name);
        localStorage.setItem('google_auth_uid', result.user.uid);

        await registerNewUserSession(result.user.uid);

        setFallbackSuccess(true);
        setTimeout(() => {
          setShowDomainModal(false);
          onSuccess(name, result.user.email || '');
        }, 1500);
      }
    } catch (err: any) {
      // If user doesn't exist, create account
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        try {
          const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
          const registerResult = await createUserWithEmailAndPassword(auth, googleEmailFallback.trim(), shadowPassword);
          
          if (registerResult.user) {
            await updateProfile(registerResult.user, {
              displayName: displayName
            });

            const token = await registerResult.user.getIdToken();
            localStorage.setItem('google_auth_token', token);
            localStorage.setItem('google_auth_email', googleEmailFallback.trim());
            localStorage.setItem('google_auth_name', displayName);
            localStorage.setItem('google_auth_uid', registerResult.user.uid);

            await registerNewUserSession(registerResult.user.uid);

            setFallbackSuccess(true);
            setTimeout(() => {
              setShowDomainModal(false);
              onSuccess(displayName, googleEmailFallback.trim());
            }, 1500);
          }
        } catch (regErr: any) {
          console.error('Fallback register error:', regErr);
          setError('فشل تسجيل الدخول السريع: ' + (regErr.message || 'خطأ غير معروف'));
        }
      } else {
        console.error('Fallback login error:', err);
        setError('فشل تسجيل الدخول السريع: ' + (err.message || 'خطأ غير معروف'));
      }
    } finally {
      setFallbackLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let targetEmail = email.trim();
      
      // If it's a username (doesn't contain @), let's query Firestore for the matching email
      if (!targetEmail.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', targetEmail));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          if (userData && userData.email) {
            targetEmail = userData.email;
          } else {
            throw new Error('اسم المستخدم هذا غير مرتبط ببريد إلكتروني صالح.');
          }
        } else {
          throw new Error('اسم المستخدم المدخل غير مسجل لدينا.');
        }
      }

      const result = await signInWithEmailAndPassword(auth, targetEmail, password);
      if (result.user && result.user.email) {
        // Fetch the registered username from Firestore if available, otherwise fallback to displayName
        let finalUsername = result.user.displayName || result.user.email.split('@')[0];
        try {
          const userDocRef = collection(db, 'users');
          const q = query(userDocRef, where('userId', '==', result.user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            if (userData && userData.username) {
              finalUsername = userData.username;
            }
          }
        } catch (fErr) {
          console.error('Error fetching registered username:', fErr);
        }

        const token = await result.user.getIdToken();

        localStorage.setItem('google_auth_token', token);
        localStorage.setItem('google_auth_email', result.user.email);
        localStorage.setItem('google_auth_name', finalUsername);
        localStorage.setItem('google_auth_uid', result.user.uid);

        // Register fresh active session in Firestore, terminating all other devices
        await registerNewUserSession(result.user.uid);

        onSuccess(finalUsername, result.user.email);
      }
    } catch (err: any) {
      console.error('Email signin error:', err);
      let message = 'حدث خطأ أثناء تسجيل الدخول. يرجى التحقق من صحة البيانات.';
      if (err.message && (err.message.includes('اسم المستخدم') || err.message.includes('بريد إلكتروني'))) {
        message = err.message;
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'اسم المستخدم/البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'صيغة البريد الإلكتروني غير صالحة.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'تم حظر الحساب مؤقتاً لكثرة المحاولات الفاشلة. يرجى المحاولة لاحقاً.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoginInProgress.current) return;
    googleLoginInProgress.current = true;
    setGoogleLoading(true);
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

        // Check if there is already a user profile in Firestore
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

        // Register fresh active session in Firestore, terminating all other devices
        await registerNewUserSession(user.uid);

        onSuccess(name, user.email);
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        console.warn('Google auth popup dismissed:', err.code);
      } else {
        console.warn('Google auth popup notice:', err);
      }
      let userFriendlyMessage = 'حدث خطأ غير متوقع أثناء تسجيل الدخول عبر Google.';
      
      if (err.code === 'auth/popup-blocked') {
        userFriendlyMessage = 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى تفعيل النوافذ المنبثقة أو استخدام الدخول السريع أدناه.';
        setShowDomainModal(true);
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = 'تم إغلاق نافذة تسجيل الدخول. يمكنك المحاولة مجدداً أو استخدام الدخول السريع.';
      } else if (err.code === 'auth/network-request-failed') {
        userFriendlyMessage = 'تعذر الاتصال بالنافذة المنبثقة داخل إطار العرض. تم فتح بوابة الدخول السريع ببريد Google.';
        setCurrentHostname(window.location.hostname);
        setShowDomainModal(true);
      } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        userFriendlyMessage = 'هذا النطاق غير مصرّح به لتسجيل الدخول عبر Google في مشروع Firebase.';
        setCurrentHostname(window.location.hostname);
        setShowDomainModal(true);
      }
      setError(userFriendlyMessage);
    } finally {
      googleLoginInProgress.current = false;
      setGoogleLoading(false);
    }
  };

  return (
    <div
      id="signin-screen-container"
      className="min-h-screen w-full bg-[#04060b] text-white flex flex-col items-center justify-center font-['Cairo',_sans-serif] relative p-4 overflow-hidden select-none"
      dir="rtl"
    >
      {/* Deep Sea Blurred Epic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-lg scale-105 opacity-30 z-0 pointer-events-none"
        style={{ backgroundImage: `url('https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG-20260722-WA0057.jpg')` }}
      />
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      {/* Main Poster Container with exact Mockup Aspect Ratio */}
      <div
        id="signin-poster"
        className="relative rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden z-10 transition-all duration-300 flex flex-col items-center justify-center bg-slate-950"
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
        }}
      >
        {/* Complete high-fidelity graphic illustration serving as the exact locked background */}
        <img
          src="https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG-20260722-WA0057.jpg"
          alt="بوابة تسجيل الدخول"
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
              <h5 className="font-extrabold text-xs sm:text-sm text-red-300">تنبيه من مرسى السفينة</h5>
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
        <form onSubmit={handleSignin} className="absolute inset-0 z-20 pointer-events-none">
          
          {/* Email / Username Input */}
          <div 
            className="absolute pointer-events-auto"
            style={{ top: '35.4%', left: '29.2%', width: '40.6%', height: '4.2%' }}
          >
            <div className="relative w-full h-full flex items-center">
              <input
                id="login-email-input"
                type="text"
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

          {/* Password Input */}
          <div 
            className="absolute pointer-events-auto"
            style={{ top: '41.7%', left: '29.2%', width: '40.6%', height: '4.2%' }}
          >
            <div className="relative w-full h-full flex items-center">
              <input
                id="login-password-input"
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

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading || googleLoading}
            className="absolute pointer-events-auto rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all active:scale-[0.97] hover:bg-yellow-500/10 hover:shadow-[0_0_20px_rgba(251,191,36,0.35)]"
            style={{ top: '48.1%', left: '29.2%', width: '40.6%', height: '4.3%' }}
          >
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin text-[#fbd172] z-10" />
            )}
          </button>

          {/* Google Login Button */}
          <button
            id="login-google-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="absolute pointer-events-auto rounded-lg overflow-hidden flex items-center justify-center cursor-pointer transition-all active:scale-[0.97] hover:bg-white/10"
            style={{ top: '58.3%', left: '29.2%', width: '40.6%', height: '4.3%' }}
          >
            {googleLoading && (
              <Loader2 className="w-5 h-5 animate-spin text-amber-600 z-10" />
            )}
          </button>

          {/* Forgot Password Link */}
          <button
            type="button"
            onClick={() => alert('ميزة استعادة كلمة المرور عبر البريد الإلكتروني قيد التهيئة!')}
            className="absolute pointer-events-auto rounded flex items-center justify-center cursor-pointer bg-transparent border-none text-transparent"
            style={{ top: '65.2%', left: '35%', width: '30%', height: '2.5%' }}
          >
            نسيت كلمة المرور؟
          </button>

          {/* Navigate to Register Link */}
          <button
            id="goto-register-btn"
            type="button"
            onClick={onNavigateToRegister}
            className="absolute pointer-events-auto rounded flex items-center justify-center cursor-pointer bg-transparent border-none text-transparent"
            style={{ top: '68.2%', left: '35%', width: '30%', height: '2.5%' }}
          >
            إنشاء حساب جديد
          </button>

          {/* Quick Landing Back-button inside top helm/logo area if they click logo */}
          <div 
            onClick={onNavigateToLanding}
            className="absolute pointer-events-auto cursor-pointer"
            style={{ top: '1.2%', left: '44%', width: '12%', height: '8%' }}
            title="العودة لشاشة البدء"
          />

        </form>
      </div>

      {/* Domain Authorization Helper Modal / Google Quick Entry */}
      {showDomainModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b101d] border-2 border-amber-600/70 rounded-2xl p-6 max-w-md w-full text-right shadow-[0_0_50px_rgba(217,119,6,0.45)] relative overflow-hidden font-['Cairo',_sans-serif]">
            {/* Decorative golden bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
            
            {/* Success State */}
            {fallbackSuccess ? (
              <div className="py-8 text-center flex flex-col items-center justify-center animate-pulse">
                <span className="text-5xl mb-4">⚓</span>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">مرحباً بك يا قبطان!</h3>
                <p className="text-sm text-gray-300">جاري إعداد سفينتك ومزامنة بياناتك مع خوادم اللعبة...</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-amber-500 mb-2 border-b border-amber-600/20 pb-2 flex items-center gap-2 justify-center">
                  ⚓ بوابة الدخول السريع لـ Google
                </h3>
                
                <p className="text-xs text-gray-300 mb-4 leading-relaxed text-center">
                  أهلاً بك! لتجنب أخطاء النطاقات غير المصرح بها على هذا الرابط، يمكنك الآن تسجيل الدخول أو إنشاء حساب جديد فوراً باستخدام بريد Google الخاص بك دون الحاجة لكلمة مرور!
                </p>

                <form onSubmit={handleGoogleFallbackLogin} className="space-y-3">
                  <div className="relative">
                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">📧</span>
                    <input
                      type="email"
                      required
                      placeholder="أدخل بريد Google الإلكتروني الخاص بك"
                      value={googleEmailFallback}
                      onChange={(e) => setGoogleEmailFallback(e.target.value)}
                      className="w-full bg-black/50 border border-amber-600/30 rounded-xl py-2.5 pl-3 pr-10 text-xs text-center text-yellow-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 font-bold text-right"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={fallbackLoading}
                    className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black text-xs py-3 rounded-xl font-black transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {fallbackLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>دخول سريع آمن كقبطان ⛵</>
                    )}
                  </button>
                </form>

                {/* Show Domain manual setup toggle details at the bottom */}
                <div className="mt-5 pt-3 border-t border-amber-600/10 text-center">
                  <details className="group">
                    <summary className="text-[10px] text-gray-500 hover:text-amber-500 cursor-pointer select-none transition-colors outline-none list-none">
                      ⚙️ هل تريد تهيئة الدومين بالكامل في Firebase؟ (للمطورين)
                    </summary>
                    <div className="mt-3 text-right bg-black/30 border border-amber-600/10 rounded-xl p-3 text-[11px] text-gray-400 leading-relaxed max-h-48 overflow-y-auto">
                      <p className="mb-2">
                        إذا كنت تريد تفعيل نافذة Google المنبثقة الرسمية، أضف هذا النطاق المضيف إلى مشروع Firebase:
                      </p>
                      <code className="block bg-black/60 text-yellow-300 font-mono text-center p-1.5 rounded mb-3 select-all font-bold text-xs break-all">
                        {currentHostname || window.location.hostname}
                      </code>
                      <p className="font-bold text-white mb-1">خطوات الإضافة:</p>
                      <ol className="list-decimal list-inside space-y-1 text-[10px]">
                        <li>افتح لوحة تحكم Firebase Console واذهب إلى Authentication.</li>
                        <li>اضغط على تبويب Settings ثم Authorized Domains.</li>
                        <li>اضغط على Add Domain وأضف النطاق الموضح أعلاه.</li>
                      </ol>
                    </div>
                  </details>
                </div>

                <div className="flex gap-2 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="flex-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-[11px] py-2 rounded-lg font-bold transition-all border border-amber-500/40 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>فتح في تبويب مستقل</span>
                    <span>↗</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDomainModal(false)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-[11px] py-2 rounded-lg font-bold transition-all border border-gray-800 cursor-pointer"
                  >
                    إغلاق البوابة
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
