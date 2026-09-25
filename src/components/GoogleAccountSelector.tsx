import React, { useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { registerNewUserSession } from '../services/sessionManager';

interface GoogleAccountSelectorProps {
  onSelectAccount: (name: string, email: string) => void;
}

export default function GoogleAccountSelector({ onSelectAccount }: GoogleAccountSelectorProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const loginInProgress = useRef(false);

  const handleGoogleLogin = async () => {
    if (loginInProgress.current) return;
    loginInProgress.current = true;
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      // Enforce Google account picker so they can select their own account
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.email) {
        let name = user.displayName || user.email.split('@')[0];
        const cleanEmail = user.email.toLowerCase().trim();

        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const emailQ = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const emailSnap = await getDocs(emailQ);
          if (!emailSnap.empty) {
            const existingData = emailSnap.docs[0].data();
            if (existingData.username) {
              name = existingData.username;
            }
          }
        } catch (dbErr) {
          console.error("Error checking existing user doc in GoogleAccountSelector:", dbErr);
        }

        const token = await user.getIdToken();

        // Save session parameters for seamless game reload and backward compatibility
        localStorage.setItem('google_auth_token', token);
        localStorage.setItem('google_auth_email', user.email);
        localStorage.setItem('google_auth_name', name);
        localStorage.setItem('google_auth_uid', user.uid);
        if (user.photoURL) {
          localStorage.setItem('google_auth_avatar', user.photoURL);
        }

        // Register unique active session in Firestore, terminating all other devices
        await registerNewUserSession(user.uid);

        // Trigger parent state transition to enter the game
        onSelectAccount(name, user.email);
      } else {
        throw new Error('فشل الحصول على معلومات البريد الإلكتروني من حساب Google.');
      }
    } catch (err: any) {
      console.error('Firebase Authentication Error:', err);
      let userFriendlyMessage = err.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول عبر Google.';
      
      if (err.code === 'auth/popup-blocked') {
        userFriendlyMessage = 'تم حظر النافذة المنبثقة بواسطة المتصفح. يرجى السماح بالنوافذ المنبثقة لإكمال تسجيل الدخول.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        userFriendlyMessage = 'تم إلغاء عملية تسجيل الدخول من قبلك.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
      } else if (err.code === 'auth/network-request-failed') {
        userFriendlyMessage = 'تعذر الاتصال بنافذة Google بسبب قيود المتصفح أو حظر ملفات تعريف الارتباط. يرجى تجربة فتح اللعبة في نافذة جديدة أو التحقق من الاتصال.';
      }
      
      setError(userFriendlyMessage);
    } finally {
      loginInProgress.current = false;
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0b1329',
        backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Cairo", "Segoe UI", Roboto, sans-serif',
        overflow: 'auto',
        color: '#ffffff',
        padding: '20px',
        boxSizing: 'border-box',
      }}
      dir="rtl"
    >
      {/* Main Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '2px solid #ca8a04',
          textAlign: 'center',
        }}
      >
        {/* Game Logo Title */}
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#facc15', margin: '0 0 5px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          🌊 ملوك الأعماق 🌊
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 30px 0' }}>
          لعبة البحار والمغامرات الأسطورية
        </p>

        {/* Google Identity Logo & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: 'block' }}>
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3.01-.97 4.25l3.07 2.38c1.8-1.66 2.95-4.1 2.95-6.48z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.07-2.38c-.9.6-2.04.98-3.32.98-2.55 0-4.71-1.73-5.48-4.05L4.93 18.02c2.01 4 6.16 5.98 7.07 5.98z"
            />
            <path
              fill="#FBBC05"
              d="M6.52 15.64a7.17 7.17 0 0 1 0-4.56l-3.09-2.4a11.97 11.97 0 0 0 0 9.35l3.09-2.39z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.35 0 3.19 2.68 1.13 6.64l3.09 2.4c.77-2.32 2.93-4.29 7.78-4.29z"
            />
          </svg>
          <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
            تسجيل دخول آمن وفوري عبر حساب Google
          </span>
        </div>

        {error && (
          <div
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: '1.5',
              textAlign: 'right',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Real Sign In with Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#1f1f1f',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            marginBottom: '25px',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #ccc',
                  borderTop: '2px solid #1a73e8',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
              <span>جاري الاتصال...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3.01-.97 4.25l3.07 2.38c1.8-1.66 2.95-4.1 2.95-6.48z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.07-2.38c-.9.6-2.04.98-3.32.98-2.55 0-4.71-1.73-5.48-4.05L4.93 18.02c2.01 4 6.16 5.98 7.07 5.98z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.52 15.64a7.17 7.17 0 0 1 0-4.56l-3.09-2.4a11.97 11.97 0 0 0 0 9.35l3.09-2.39z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.35 0 3.19 2.68 1.13 6.64l3.09 2.4c.77-2.32 2.93-4.29 7.78-4.29z"
                />
              </svg>
              <span style={{ fontFamily: '"Cairo", sans-serif' }}>تسجيل الدخول الآمن بحساب Google الخاص بك</span>
            </>
          )}
        </button>

        {/* Styles block for animations */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', margin: '0' }}>
          بالنقر على الزر أعلاه، سيتم فتح نافذة Google الرسمية الآمنة لتختار حسابك الخاص لتسجيل الدخول الفوري ومزامنة بيانات القبطان.
        </p>
      </div>

      {/* Footer bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '25px',
          fontSize: '12px',
          color: '#64748b',
        }}
      >
        <span style={{ cursor: 'pointer' }}>العربية</span>
        <span>•</span>
        <span style={{ cursor: 'pointer' }}>المساعدة</span>
        <span>•</span>
        <span style={{ cursor: 'pointer' }}>الخصوصية</span>
        <span>•</span>
        <span style={{ cursor: 'pointer' }}>البنود</span>
      </div>
    </div>
  );
}
