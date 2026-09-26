import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Users, 
  MicOff, 
  Mic, 
  Ban, 
  AlertTriangle, 
  Send, 
  Smile, 
  Crown, 
  X, 
  MessageSquare,
  ShieldAlert,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface ChatMessage {
  id: string;
  sender: string;
  senderId?: string;
  avatar: string;
  text: string;
  time: string;
  userId?: string;
  createdAt?: string;
  isMe?: boolean;
}

interface ChatViewProps {
  chatMessages: ChatMessage[];
  sendChatMessage: (e: React.FormEvent) => void;
  chatInput: string;
  setChatInput: (val: string) => void;
  currentUser: any;
  realPlayers: any[];
  onClose: () => void;
  isMuted?: boolean;
  setIsMuted?: (val: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  friends?: string[];
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatMessages,
  sendChatMessage,
  chatInput,
  setChatInput,
  currentUser,
  realPlayers,
  onClose,
  isMuted = false,
  setIsMuted,
  showToast,
  friends = []
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'friends'>('general');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [reportTargetUser, setReportTargetUser] = useState('');
  const [reportReason, setReportReason] = useState('سب وقذف أو شتائم');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pirate_blocked_users') || '[]');
    } catch {
      return [];
    }
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom whenever messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages.length, activeTab]);

  // Emojis for quick picker (sea and battle themed)
  const quickEmojis = [
    '👑', '🔱', '🦈', '🐉', '⚔️', '🪙', '💎', '⚓', '🌊', '🔥', 
    '💥', '🏴‍☠️', '🍻', '🛡️', '⚡', '💣', '🐟', '🎯', '🚀', '😎'
  ];

  // Lookup player level and VIP from real database
  const getPlayerDetails = (userId?: string, senderName?: string) => {
    if (!userId && !senderName) return { level: 1, isVip: false };
    const found = realPlayers.find(p => (userId && (p.userId === userId || p.id === userId)) || (senderName && p.username === senderName));
    if (!found) return { level: 1, isVip: false };
    
    // Calculate level based on real ships or tower level
    const lvl = found.shipTowerLevel || Math.min(99, Math.max(1, Math.floor(Math.sqrt((found.exp || 0) / 100)) + 1));
    const isVip = (found.gold || 0) > 100000000 || (found.power || 0) > 1000000000;
    return { level: lvl, isVip };
  };

  // Filter messages based on block list and active tab
  const visibleMessages = chatMessages.filter(msg => {
    // Hide blocked users
    if (msg.sender && blockedUsers.includes(msg.sender)) return false;
    if (msg.userId && blockedUsers.includes(msg.userId)) return false;

    // Friends tab: filter only messages from friends or current user
    if (activeTab === 'friends') {
      if (msg.isMe) return true;
      if (msg.userId && friends.includes(msg.userId)) return true;
      return false;
    }

    return true;
  });

  // Handle reporting player
  const handleSubmitReport = async () => {
    if (!reportTargetUser.trim()) {
      showToast('⚠️ يرجى تحديد اسم اللاعب المخالف', 'error');
      return;
    }

    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, 'abuseReports'), {
        reporterId: currentUser?.uid || 'guest',
        reporterName: currentUser?.displayName || 'قبطان',
        targetUser: reportTargetUser.trim(),
        reason: reportReason,
        details: reportDetails.trim(),
        timestamp: new Date().toISOString()
      });

      showToast('✅ تم إرسال البلاغ بنجاح للإدارة لمراجعته وحماية المجتمع', 'success');
      setShowReportModal(false);
      setReportTargetUser('');
      setReportDetails('');
    } catch (e) {
      showToast('❌ تعذر إرسال البلاغ حالياً، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Handle blocking / unblocking
  const toggleBlockUser = (userToBlock: string) => {
    if (!userToBlock) return;
    setBlockedUsers(prev => {
      let updated: string[];
      if (prev.includes(userToBlock)) {
        updated = prev.filter(u => u !== userToBlock);
        showToast(`تم إلغاء حظر @${userToBlock}`, 'success');
      } else {
        updated = [...prev, userToBlock];
        showToast(`تم حظر @${userToBlock} ولن تظهر رسائله في محادثتك`, 'success');
      }
      localStorage.setItem('pirate_blocked_users', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[120] w-full h-full text-slate-100 flex flex-col items-center select-none overflow-y-auto overflow-x-hidden font-sans"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at center top, rgba(6, 25, 52, 0.88) 0%, rgba(3, 14, 30, 0.95) 75%, rgba(1, 5, 14, 0.99) 100%),
          url('/backgrounds/kings_depths_banner.jpg'),
          url('/backgrounds/leaderboard_bg.jpg')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
        direction: 'rtl'
      }}
    >
      {/* Top Close Button */}
      <button
        onClick={onClose}
        className="fixed top-3 left-3 z-[130] bg-slate-900/80 hover:bg-red-900/80 border border-sky-500/50 hover:border-red-500 text-sky-200 hover:text-white rounded-full w-9 h-9 flex items-center justify-center transition-all shadow-lg active:scale-95"
        title="إغلاق والعودة للميناء"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Responsive Wrapper */}
      <div className="w-full max-w-[620px] min-h-screen px-2.5 pt-3 pb-8 flex flex-col items-center relative z-20">

        {/* 1. GRAND 3D ROYAL EMBLEM ("ملوك الأعماق") */}
        <div className="relative w-full flex flex-col items-center mb-3">
          <div className="relative flex flex-col items-center justify-center">
            {/* Glowing Golden Crown at top */}
            <div className="relative z-10 -mb-3 filter drop-shadow-[0_0_16px_rgba(250,204,21,0.9)]">
              <Crown className="w-12 h-12 text-amber-400" />
            </div>

            {/* Royal Blue & Gold Crest Base */}
            <div 
              className="relative px-8 py-2 rounded-2xl flex items-center justify-center border-2 border-amber-400/80 shadow-[0_8px_30px_rgba(0,0,0,0.95)]"
              style={{
                background: 'radial-gradient(circle at center, #134e85 0%, #082442 70%, #03101f 100%)',
                boxShadow: '0 0 25px rgba(56, 189, 248, 0.4), inset 0 0 15px rgba(250, 204, 21, 0.4)'
              }}
            >
              {/* Trident Ornaments on both sides */}
              <span className="text-amber-400 text-xl font-bold ml-3 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">🔱</span>
              
              <h1 
                className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 tracking-wide"
                style={{
                  textShadow: '0 4px 8px rgba(0,0,0,0.95), 0 0 16px rgba(245,158,11,0.6)',
                  fontFamily: 'Cairo, system-ui, sans-serif'
                }}
              >
                ملوك الأعماق
              </h1>

              <span className="text-amber-400 text-xl font-bold mr-3 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">🔱</span>
            </div>
          </div>
        </div>

        {/* 2. TOP TABS SWITCHER (الدردشة العامة vs الأصدقاء) */}
        <div className="w-full flex items-center justify-between gap-3 mb-3 px-1">
          {/* الدردشة العامة */}
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 h-[46px] rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-lg border-2 ${
              activeTab === 'general'
                ? 'text-white border-cyan-400 shadow-[0_0_16px_rgba(56,189,248,0.7)]'
                : 'text-sky-300 border-sky-900/60 bg-slate-950/70 hover:bg-slate-900/80'
            }`}
            style={{
              background: activeTab === 'general'
                ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #075985 100%)'
                : undefined
            }}
          >
            <Globe className="w-5 h-5 text-cyan-300" />
            <span>الدردشة العامة</span>
          </button>

          {/* الأصدقاء */}
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 h-[46px] rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-lg border-2 ${
              activeTab === 'friends'
                ? 'text-white border-cyan-400 shadow-[0_0_16px_rgba(56,189,248,0.7)]'
                : 'text-sky-300 border-sky-900/60 bg-slate-950/70 hover:bg-slate-900/80'
            }`}
            style={{
              background: activeTab === 'friends'
                ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #075985 100%)'
                : undefined
            }}
          >
            <Users className="w-5 h-5 text-sky-400" />
            <span>الأصدقاء</span>
          </button>
        </div>

        {/* 3. MAIN CHAT LAYOUT: (Chat Feed on Left + Action Toolbar on Right in RTL) */}
        <div className="w-full flex items-stretch gap-2.5 mb-3 flex-1">

          {/* RIGHT SIDEBAR: TACTICAL ACTION BUTTONS */}
          <div className="w-[105px] md:w-[125px] flex flex-col gap-2 flex-shrink-0">
            
            {/* 1. الدردشة العامة */}
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full py-2.5 px-1.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md ${
                activeTab === 'general'
                  ? 'border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  : 'border-sky-800/60 hover:border-sky-600'
              }`}
              style={{
                background: activeTab === 'general'
                  ? 'linear-gradient(180deg, #0b406b 0%, #06233d 100%)'
                  : 'linear-gradient(180deg, #082847 0%, #041424 100%)'
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shadow-inner">
                <MessageSquare className="w-5 h-5 text-amber-950" />
              </div>
              <span className="text-[11px] md:text-xs font-black text-sky-100 whitespace-nowrap">الدردشة العامة</span>
            </button>

            {/* 2. الأصدقاء */}
            <button
              onClick={() => setActiveTab('friends')}
              className={`w-full py-2.5 px-1.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md ${
                activeTab === 'friends'
                  ? 'border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  : 'border-sky-800/60 hover:border-sky-600'
              }`}
              style={{
                background: activeTab === 'friends'
                  ? 'linear-gradient(180deg, #0b406b 0%, #06233d 100%)'
                  : 'linear-gradient(180deg, #082847 0%, #041424 100%)'
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center shadow-inner">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] md:text-xs font-black text-sky-100 whitespace-nowrap">الأصدقاء</span>
            </button>

            {/* 3. كتم الصوت */}
            <button
              onClick={() => {
                if (setIsMuted) {
                  setIsMuted(!isMuted);
                  showToast(!isMuted ? 'تم كتم الصوت' : 'تم تفعيل الصوت', 'success');
                }
              }}
              className="w-full py-2.5 px-1.5 rounded-xl border-2 border-sky-800/60 hover:border-red-400 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
              style={{
                background: 'linear-gradient(180deg, #082847 0%, #041424 100%)'
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center">
                {isMuted ? (
                  <MicOff className="w-5 h-5 text-red-400 animate-pulse" />
                ) : (
                  <Mic className="w-5 h-5 text-red-300" />
                )}
              </div>
              <span className="text-[11px] md:text-xs font-black text-sky-100 whitespace-nowrap">
                {isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
              </span>
            </button>

            {/* 4. حظر */}
            <button
              onClick={() => setShowBlockModal(true)}
              className="w-full py-2.5 px-1.5 rounded-xl border-2 border-sky-800/60 hover:border-red-400 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
              style={{
                background: 'linear-gradient(180deg, #082847 0%, #041424 100%)'
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-[11px] md:text-xs font-black text-sky-100 whitespace-nowrap">حظر</span>
            </button>

            {/* 5. الإبلاغ عن الإساءة أو الشتائم */}
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full py-2 px-1.5 rounded-xl border-2 border-sky-800/60 hover:border-amber-400 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md flex-1"
              style={{
                background: 'linear-gradient(180deg, #082847 0%, #041424 100%)'
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <span className="text-[10px] md:text-[11px] font-black text-sky-100 text-center leading-tight">
                الإبلاغ عن الإساءة<br />أو الشتائم
              </span>
            </button>

          </div>

          {/* LEFT AREA: CHAT MESSAGES FEED CONTAINER */}
          <div 
            className="flex-1 rounded-2xl border-2 border-sky-800/70 p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md"
            style={{
              background: 'radial-gradient(circle at top, rgba(8, 32, 60, 0.88) 0%, rgba(3, 14, 28, 0.94) 75%, rgba(1, 6, 15, 0.98) 100%)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.9), inset 0 0 20px rgba(56, 189, 248, 0.15)'
            }}
          >
            {/* Scrollable Messages Container */}
            <div 
              ref={chatScrollRef}
              className="w-full flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-1 pl-1 max-h-[440px] min-h-[350px]"
            >
              {visibleMessages.length === 0 ? (
                <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-sky-950/80 border-2 border-cyan-500/50 flex items-center justify-center mb-3 shadow-[0_0_16px_rgba(56,189,248,0.3)]">
                    <MessageSquare className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-black text-sky-200 mb-1">
                    {activeTab === 'general' ? 'الدردشة العامة الحية' : 'محادثات الأصدقاء'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">
                    {activeTab === 'general'
                      ? 'لا توجد رسائل مسجلة بعد في الخوادم.. كن أول قبطان يبدأ المحادثة ويرحب بالجميع!'
                      : 'لا توجد رسائل حالياً من أصدقائك.. أرسل رسالة لتحية أصدقاء الميناء!'}
                  </p>
                </div>
              ) : (
                visibleMessages.map((msg) => {
                  const details = getPlayerDetails(msg.userId, msg.sender);
                  return (
                    <div 
                      key={msg.id}
                      className="w-full flex items-start gap-2.5 group animate-fadeIn"
                    >
                      {/* Avatar on Right side */}
                      <div className="relative flex-shrink-0">
                        <div 
                          className="w-11 h-11 rounded-full border-2 flex items-center justify-center text-xl shadow-lg relative"
                          style={{
                            background: 'radial-gradient(circle, #0f3963 0%, #05192e 100%)',
                            borderColor: msg.isMe ? '#facc15' : '#38bdf8',
                            boxShadow: msg.isMe ? '0 0 10px rgba(250, 204, 21, 0.4)' : '0 0 10px rgba(56, 189, 248, 0.4)'
                          }}
                        >
                          {msg.avatar || '⚓'}
                        </div>
                      </div>

                      {/* Message Content Bubble & Header */}
                      <div className="flex-1 flex flex-col items-start min-w-0">
                        {/* Header Row: Sender name + Level / VIP Badge + Time */}
                        <div className="w-full flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs md:text-sm font-black truncate ${
                              msg.isMe ? 'text-amber-300' : 'text-sky-100'
                            }`}>
                              {msg.sender || 'قبطان'}
                              {msg.isMe && <span className="text-[10px] text-amber-400 font-bold mr-1">(أنت)</span>}
                            </span>

                            {/* Level Badge */}
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-blue-950 border border-cyan-400/70 text-cyan-200">
                              {details.level}
                            </span>

                            {/* VIP Badge if High Rank */}
                            {details.isVip && (
                              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black bg-amber-950 border border-amber-400 text-amber-300 flex items-center gap-0.5">
                                <span>👑</span>
                                <span>VIP</span>
                              </span>
                            )}
                          </div>

                          {/* Timestamp */}
                          <span className="text-[10.5px] text-slate-400 font-mono flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {msg.time || ''}
                          </span>
                        </div>

                        {/* Stylized Message Bubble */}
                        <div 
                          className="px-3.5 py-2 rounded-2xl rounded-tr-sm text-xs md:text-sm font-bold text-white shadow-md max-w-full break-words relative border"
                          style={{
                            background: msg.isMe 
                              ? 'linear-gradient(180deg, rgba(14, 116, 144, 0.85) 0%, rgba(3, 70, 90, 0.92) 100%)'
                              : 'linear-gradient(180deg, rgba(8, 47, 73, 0.85) 0%, rgba(3, 27, 45, 0.92) 100%)',
                            borderColor: msg.isMe ? 'rgba(56, 189, 248, 0.7)' : 'rgba(14, 165, 233, 0.45)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                          }}
                        >
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Emoji Bar (Popup) */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-3 right-3 bg-slate-900/95 border-2 border-cyan-500/70 rounded-2xl p-2.5 shadow-2xl z-30 flex flex-wrap gap-2 justify-center backdrop-blur-md animate-fadeIn">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setChatInput(chatInput + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-sky-900/80 flex items-center justify-center text-lg transition-transform hover:scale-125 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Input Area Form */}
            <form 
              onSubmit={sendChatMessage}
              className="w-full flex items-center gap-2 mt-2.5 pt-2 border-t border-sky-900/50"
            >
              {/* Emoji Picker Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-sky-500/50 hover:border-cyan-400 flex items-center justify-center text-sky-300 hover:text-cyan-200 transition-all flex-shrink-0 active:scale-95"
                title="إضافة تعبير"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Text Input Box */}
              <input
                type="text"
                placeholder="اكتب رسالتك هنا..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 h-10 px-3.5 bg-slate-950/90 border-2 border-sky-700/60 rounded-xl text-white text-xs md:text-sm font-bold focus:outline-none focus:border-cyan-400 placeholder-slate-400 shadow-inner"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg flex-shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border"
                style={{
                  background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
                  borderColor: '#38bdf8',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)'
                }}
                title="إرسال الرسالة"
              >
                <Send className="w-4.5 h-4.5 -rotate-45" />
              </button>
            </form>

          </div>

        </div>

        {/* 4. BOTTOM ETIQUETTE BANNER */}
        <div 
          className="w-full py-2 px-4 rounded-full border border-sky-600/50 flex items-center justify-center gap-2 text-xs md:text-sm font-black text-sky-200 shadow-lg text-center"
          style={{
            background: 'linear-gradient(90deg, rgba(3, 15, 30, 0.95) 0%, rgba(8, 36, 68, 0.95) 50%, rgba(3, 15, 30, 0.95) 100%)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(56, 189, 248, 0.2)'
          }}
        >
          <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>احترم الآخرين .. فنحن عائلة واحدة تحت المحيط</span>
          <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
        </div>

      </div>

      {/* REPORT ABUSE MODAL */}
      {showReportModal && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-5 border-2 border-amber-500/80 shadow-2xl relative text-right"
            style={{
              background: 'linear-gradient(180deg, #16110a 0%, #0d0905 100%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-amber-600/40 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
                <h3 className="text-base md:text-lg font-black text-amber-300">الإبلاغ عن الإساءة أو الشتائم</h3>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              ساعدنا في إبقاء بيئة اللعبة راقية وآمنة للجميع. سيتم فحص رسائل اللاعب من قِبل إدارة اللعبة بدقة.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">اسم اللاعب المخالف:</label>
                <input
                  type="text"
                  placeholder="اكتب اسم القبطان هنا..."
                  value={reportTargetUser}
                  onChange={(e) => setReportTargetUser(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-amber-500/50 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">نوع المخالفة:</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-amber-500/50 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-300"
                >
                  <option value="سب وقذف أو شتائم">سب وقذف أو شتائم</option>
                  <option value="إساءة متكررة وسلوك عدواني">إساءة متكررة وسلوك عدواني</option>
                  <option value="انتحال شخصية أو تضليل">انتحال شخصية أو تضليل</option>
                  <option value="رسائل مزعجة (Spam)">رسائل مزعجة (Spam)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">تفاصيل إضافية (اختياري):</label>
                <textarea
                  rows={3}
                  placeholder="اكتب تفاصيل ما حدث..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-amber-500/50 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-300 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs md:text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmittingReport ? 'جاري الإرسال...' : 'إرسال البلاغ 🚀'}
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs md:text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK USERS MODAL */}
      {showBlockModal && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowBlockModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-5 border-2 border-red-500/80 shadow-2xl relative text-right"
            style={{
              background: 'linear-gradient(180deg, #1a0808 0%, #0d0404 100%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-red-600/40 pb-2">
              <div className="flex items-center gap-2">
                <Ban className="w-6 h-6 text-red-400" />
                <h3 className="text-base md:text-lg font-black text-red-300">قائمة الحظر وتجاهل اللاعبين</h3>
              </div>
              <button 
                onClick={() => setShowBlockModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              عند حظر أي لاعب، سيتم إخفاء رسائله من شاشة الدردشة فوراً ولن تراها مجدداً.
            </p>

            {/* List of senders in current chat */}
            <div className="max-h-56 overflow-y-auto space-y-2 mb-4 pr-1">
              <div className="text-[11px] font-bold text-red-300 mb-1">اللاعبون المتواجدون في المحادثة الحالية:</div>
              {Array.from(new Set(chatMessages.map(m => m.sender).filter(s => s && s !== currentUser?.displayName))).length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4 bg-slate-900/50 rounded-xl">
                  لا يوجد لاعبون آخرون بعد لحظرهم.
                </div>
              ) : (
                Array.from(new Set(chatMessages.map(m => m.sender).filter(s => s && s !== currentUser?.displayName))).map((name) => {
                  const isBlocked = blockedUsers.includes(name);
                  return (
                    <div 
                      key={name}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-700/60"
                    >
                      <span className="text-xs font-bold text-white truncate max-w-[180px]">@{name}</span>
                      <button
                        onClick={() => toggleBlockUser(name)}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                          isBlocked 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        {isBlocked ? 'إلغاء الحظر' : 'حظر 🚫'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowBlockModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs md:text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
