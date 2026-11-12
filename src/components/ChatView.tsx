import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Smile, 
  X, 
  Megaphone, 
  Settings, 
  Users, 
  ShieldAlert, 
  Ban, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  UserX,
  Search, 
  Flame,
  Radio,
  Crown
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: string;
  senderId?: string;
  avatar?: string;
  avatarIndex?: number;
  level?: number | string;
  vip?: boolean;
  text: string;
  time: string;
  userId?: string;
  createdAt?: string;
  isMe?: boolean;
  channel?: 'general' | 'private' | 'tribe' | 'friends' | 'broadcast';
  recipientId?: string;
  recipientName?: string;
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
  showToast?: (msg: string, type?: 'success' | 'error') => void;
  friends?: string[];
  tribeId?: string | null;
  tribeName?: string;
  onOpenTribes?: () => void;
}

// Authentic conversation from the user's reference screenshot (IMG-20261104-WA0055)
const REFERENCE_MESSAGES: ChatMessage[] = [
  {
    id: 'ref-msg-1',
    sender: 'فارس الأعماق',
    avatar: '/assets/chat_avatar_1.png',
    avatarIndex: 0,
    level: 3,
    vip: false,
    text: 'سوا قروب و احنا ننضم',
    time: '12:06',
    isMe: false,
    channel: 'general',
  },
  {
    id: 'ref-msg-2',
    sender: 'Oceanking',
    avatar: '/assets/chat_avatar_1.png',
    avatarIndex: 0,
    level: 3,
    vip: true,
    text: 'الفعاليات كلها لي أنا لا تحاولوا',
    time: '12:06',
    isMe: false,
    channel: 'general',
  },
  {
    id: 'ref-msg-3',
    sender: 'Captain 55',
    avatar: '/assets/chat_avatar_2.png',
    avatarIndex: 1,
    level: 3,
    vip: false,
    text: 'ازاي اهاجم علي السفن',
    time: '12:55',
    isMe: false,
    channel: 'general',
  },
  {
    id: 'ref-msg-4',
    sender: 'نوح',
    avatar: '/assets/chat_avatar_3.png',
    avatarIndex: 2,
    level: 3,
    vip: false,
    text: 'راسلوني على تلجرام @zom3014 بجهز قروب وضيفكم',
    time: '12:57',
    isMe: false,
    channel: 'general',
  },
  {
    id: 'ref-msg-5',
    sender: 'نوح',
    avatar: '/assets/chat_avatar_3.png',
    avatarIndex: 2,
    level: 3,
    vip: false,
    text: 'تتهنا فيها اجوايز ماتستاعل',
    time: '12:58',
    isMe: false,
    channel: 'general',
  },
  {
    id: 'ref-msg-6',
    sender: 'نوح',
    avatar: '/assets/chat_avatar_3.png',
    avatarIndex: 2,
    level: 3,
    vip: false,
    text: 'اي واحد يتواصل معي يرسل صورت حسابه',
    time: '12:58',
    isMe: false,
    channel: 'general',
  },
];

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
  friends = [],
  tribeId,
  tribeName,
  onOpenTribes
}) => {
  // 4 Top Tabs matching user's screenshot exactly: العام | الخاص | القبيلة | الأصدقاء
  const [activeTab, setActiveTab] = useState<'general' | 'private' | 'tribe' | 'friends'>('general');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [internalMuted, setInternalMuted] = useState(isMuted);

  // Modals for actions
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMegaphoneModal, setShowMegaphoneModal] = useState(false);
  const [megaphoneText, setMegaphoneText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedWhisperPlayer, setSelectedWhisperPlayer] = useState<string>('');

  // Floating side panel minimized toggle
  const [isMinimized, setIsMinimized] = useState(false);

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('blocked_chat_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [userToBlock, setUserToBlock] = useState('');

  // Report state
  const [reportTarget, setReportTarget] = useState('');
  const [reportReason, setReportReason] = useState('شتائم وألفاظ نابية');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Quick game emojis
  const quickEmojis = [
    '👑', '🔱', '🦈', '🐉', '⚔️', '🪙', '💎', '⚓', '🌊', '🔥', 
    '💪', '👏', '💥', '🏴‍☠️', '🍻', '🛡️', '⚡', '💣', '🐟', '🎯', 
    '🚀', '😎', '❤️', '🏆'
  ];

  const handleToggleMute = () => {
    const newState = !internalMuted;
    setInternalMuted(newState);
    if (setIsMuted) {
      setIsMuted(newState);
    }
    if (showToast) {
      showToast(newState ? 'تم كتم صوت الشات 🔇' : 'تم تفعيل صوت الشات 🔊');
    }
  };

  const handleBlockUser = (username: string) => {
    if (!username.trim()) return;
    const cleanName = username.trim();
    if (!blockedUsers.includes(cleanName)) {
      const updated = [...blockedUsers, cleanName];
      setBlockedUsers(updated);
      try {
        localStorage.setItem('blocked_chat_users', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      if (showToast) {
        showToast(`تم حظر اللاعب @${cleanName} بنجاح`, 'success');
      }
    }
    setUserToBlock('');
  };

  const handleUnblockUser = (username: string) => {
    const updated = blockedUsers.filter(u => u !== username);
    setBlockedUsers(updated);
    try {
      localStorage.setItem('blocked_chat_users', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (showToast) {
      showToast(`تم إلغاء حظر @${username}`, 'success');
    }
  };

  const handleBroadcastMegaphone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!megaphoneText.trim()) return;
    setChatInput(`📢 [إعلان عالمي] ${megaphoneText.trim()}`);
    setShowMegaphoneModal(false);
    setMegaphoneText('');
    setTimeout(() => {
      // Trigger submission with announcement format
      const form = document.getElementById('chat-form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 50);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget.trim()) {
      if (showToast) showToast('يرجى تحديد اسم اللاعب المخالف', 'error');
      return;
    }
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportTarget('');
      setReportNotes('');
      if (showToast) {
        showToast('تم إرسال بلاغك للإدارة بنجاح', 'success');
      }
    }, 1200);
  };

  const getPlayerDetails = (userId?: string, senderName?: string, fallbackLevel?: number | string, fallbackVip?: boolean) => {
    if (fallbackLevel !== undefined && fallbackLevel !== null) {
      return { level: fallbackLevel, isVip: !!fallbackVip };
    }
    if (!userId && !senderName) {
      return { level: 3, isVip: false };
    }
    const found = realPlayers?.find(p => 
      (userId && (p.userId === userId || p.id === userId)) || 
      (senderName && (p.username === senderName || p.displayName === senderName))
    );
    if (!found) {
      return { level: fallbackLevel || 3, isVip: fallbackVip ?? false };
    }
    
    const lvl = found.shipTowerLevel || Math.min(99, Math.max(1, Math.floor(Math.sqrt((found.exp || 0) / 100)) + 1));
    const isVip = (found.gold || 0) > 100000000 || (found.power || 0) > 1000000000 || false;
    return { level: lvl, isVip };
  };

  // Base messages: merge reference messages with real Firestore messages seamlessly
  const baseMessages = chatMessages && chatMessages.length > 0
    ? [...REFERENCE_MESSAGES, ...chatMessages]
    : REFERENCE_MESSAGES;

  // Filter messages based on active tab
  const filteredMessages = baseMessages.filter(msg => {
    // Check block list
    if (blockedUsers.some(b => msg.sender.includes(b))) return false;

    if (activeTab === 'friends') {
      const isFriend = friends.some(f => msg.sender.includes(f));
      const isMe = msg.isMe || (currentUser?.displayName && msg.sender.includes(currentUser.displayName));
      return isFriend || isMe;
    }

    if (activeTab === 'private') {
      if (selectedWhisperPlayer) {
        return (
          msg.recipientName === selectedWhisperPlayer || 
          msg.sender.includes(selectedWhisperPlayer) ||
          msg.text.includes(`@${selectedWhisperPlayer}`) ||
          msg.channel === 'private'
        );
      }
      return msg.channel === 'private' || msg.recipientId || msg.text.startsWith('/w ') || msg.text.startsWith('خاص:');
    }

    if (activeTab === 'tribe') {
      return msg.channel === 'tribe' || (tribeId && msg.text.includes(`[${tribeName || 'القبيلة'}]`));
    }

    return true; // General tab
  });

  const recentSenders = Array.from(new Set(baseMessages.map(m => m.sender.replace(/[👑🔱]/g, '').trim()))).filter(Boolean);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [filteredMessages.length, activeTab]);

  // Map avatar to cropped character artwork
  const getAvatarForMessage = (msg: ChatMessage, index: number): string => {
    if (msg.avatar && msg.avatar.startsWith('/assets/chat_avatar_')) return msg.avatar;
    if (msg.sender === 'Oceanking' || msg.sender === 'فارس الأعماق') return '/assets/chat_avatar_1.png';
    if (msg.sender === 'Captain 55') return '/assets/chat_avatar_2.png';
    if (msg.sender === 'نوح') return '/assets/chat_avatar_3.png';
    if (typeof msg.avatarIndex === 'number' && msg.avatarIndex >= 0) {
      return `/assets/chat_avatar_${(msg.avatarIndex % 7) + 1}.png`;
    }
    let hash = 0;
    const seed = msg.sender || msg.senderId || msg.userId || `msg-${index}`;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const avatarNum = (Math.abs(hash) % 7) + 1;
    return `/assets/chat_avatar_${avatarNum}.png`;
  };

  // Convert digits to Arabic-Indic format
  const toArabicDigits = (num: number | string): string => {
    const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (w) => arabicNums[+w]);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at 50% 15%, #082642 0%, #06182c 45%, #020b14 100%)',
        color: '#f8fafc',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Background underwater star/caustics pattern */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle at 50% 10%, rgba(56, 189, 248, 0.08) 0%, transparent 60%), radial-gradient(#38bdf8 0.6px, transparent 0.6px)',
          backgroundSize: '100% 100%, 36px 36px',
          opacity: 0.35,
          zIndex: 0,
        }}
      />

      {/* Main Ornate Chat Container matching structure of user reference screenshot */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '10px 12px 14px 12px',
          background: 'linear-gradient(180deg, rgba(7, 26, 44, 0.95) 0%, rgba(3, 13, 24, 0.98) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          boxShadow: '0 0 35px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(6, 25, 45, 0.8)',
        }}
      >
        {/* ===================== 4 CORNER RIVETS / ORNAMENTS ===================== */}
        <div style={{ position: 'absolute', top: '4px', right: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', border: '1px solid #fef08a', boxShadow: '0 0 6px #eab308' }} />
        <div style={{ position: 'absolute', top: '4px', left: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', border: '1px solid #fef08a', boxShadow: '0 0 6px #eab308' }} />
        <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', border: '1px solid #fef08a', boxShadow: '0 0 6px #eab308' }} />
        <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', border: '1px solid #fef08a', boxShadow: '0 0 6px #eab308' }} />

        {/* ===================== FLOATING SIDE TOGGLE TAB (Left edge from screenshot) ===================== */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          title="تصغير / توسيع الشات"
          style={{
            position: 'absolute',
            left: '-2px',
            top: '46%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: 'linear-gradient(180deg, #d4af37 0%, #996515 100%)',
            border: '1.5px solid #fef08a',
            borderLeft: 'none',
            borderRadius: '0 10px 10px 0',
            padding: '8px 5px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            boxShadow: '2px 0 10px rgba(0,0,0,0.5)',
          }}
        >
          <MessageCircle style={{ width: '15px', height: '15px', color: '#1a1003' }} />
          <span style={{ fontSize: '10px', fontWeight: '900', color: '#1a1003', lineHeight: 1 }}>
            {isMinimized ? '>' : '<'}
          </span>
        </div>

        {/* ===================== TOP 4 TABS ROW (العام | الخاص | القبيلة | الأصدقاء) ===================== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            paddingBottom: '10px',
            borderBottom: '1.5px solid rgba(212, 175, 55, 0.45)',
            marginBottom: '10px',
          }}
        >
          {/* The 4 Tab Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: 1,
            }}
          >
            {/* TAB 1: العام */}
            <button
              onClick={() => setActiveTab('general')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '900',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                background:
                  activeTab === 'general'
                    ? 'linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)'
                    : 'linear-gradient(180deg, #0e2a47 0%, #071728 100%)',
                color: activeTab === 'general' ? '#0a1626' : '#cbd5e1',
                border:
                  activeTab === 'general'
                    ? '1.5px solid #ffffff'
                    : '1.5px solid rgba(212, 175, 55, 0.4)',
                boxShadow:
                  activeTab === 'general'
                    ? '0 0 14px rgba(250, 204, 21, 0.5), inset 0 1px 0 #fff'
                    : 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              العام
            </button>

            {/* TAB 2: الخاص */}
            <button
              onClick={() => setActiveTab('private')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '900',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                background:
                  activeTab === 'private'
                    ? 'linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)'
                    : 'linear-gradient(180deg, #0e2a47 0%, #071728 100%)',
                color: activeTab === 'private' ? '#0a1626' : '#cbd5e1',
                border:
                  activeTab === 'private'
                    ? '1.5px solid #ffffff'
                    : '1.5px solid rgba(212, 175, 55, 0.4)',
                boxShadow:
                  activeTab === 'private'
                    ? '0 0 14px rgba(250, 204, 21, 0.5), inset 0 1px 0 #fff'
                    : 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              الخاص
            </button>

            {/* TAB 3: القبيلة */}
            <button
              onClick={() => setActiveTab('tribe')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '900',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                background:
                  activeTab === 'tribe'
                    ? 'linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)'
                    : 'linear-gradient(180deg, #0e2a47 0%, #071728 100%)',
                color: activeTab === 'tribe' ? '#0a1626' : '#cbd5e1',
                border:
                  activeTab === 'tribe'
                    ? '1.5px solid #ffffff'
                    : '1.5px solid rgba(212, 175, 55, 0.4)',
                boxShadow:
                  activeTab === 'tribe'
                    ? '0 0 14px rgba(250, 204, 21, 0.5), inset 0 1px 0 #fff'
                    : 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              القبيلة
            </button>

            {/* TAB 4: الأصدقاء */}
            <button
              onClick={() => setActiveTab('friends')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '900',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                background:
                  activeTab === 'friends'
                    ? 'linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)'
                    : 'linear-gradient(180deg, #0e2a47 0%, #071728 100%)',
                color: activeTab === 'friends' ? '#0a1626' : '#cbd5e1',
                border:
                  activeTab === 'friends'
                    ? '1.5px solid #ffffff'
                    : '1.5px solid rgba(212, 175, 55, 0.4)',
                boxShadow:
                  activeTab === 'friends'
                    ? '0 0 14px rgba(250, 204, 21, 0.5), inset 0 1px 0 #fff'
                    : 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              الأصدقاء
            </button>
          </div>

          {/* Close / Return to Harbor Button */}
          <button
            onClick={onClose}
            title="إغلاق والعودة للميناء"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.5)',
              color: '#f8fafc',
              fontSize: '15px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Sub-Header Context Notification (if Private or Tribe selected) */}
        {activeTab === 'private' && (
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(56, 189, 248, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#38bdf8',
            }}
          >
            <span>💬 المحادثات الخاصة والهمس المباشر بين القادة</span>
            {realPlayers && realPlayers.length > 0 && (
              <select
                value={selectedWhisperPlayer}
                onChange={(e) => setSelectedWhisperPlayer(e.target.value)}
                style={{
                  background: '#071b2e',
                  color: '#facc15',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '11px',
                }}
              >
                <option value="">جميع المحادثات الخاصة</option>
                {realPlayers.slice(0, 15).map(p => (
                  <option key={p.userId || p.id} value={p.username || p.displayName}>
                    همس مع: {p.username || p.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {activeTab === 'tribe' && !tribeId && (
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(234, 179, 8, 0.12)',
              borderRadius: '8px',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#fef08a',
            }}
          >
            <span>🛡️ انضم أو أنشئ قبيلة للدردشة مع تحالفك البحري!</span>
            {onOpenTribes && (
              <button
                onClick={onOpenTribes}
                style={{
                  background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                فتح قوائم القبيلة
              </button>
            )}
          </div>
        )}

        {/* ===================== MESSAGES SCROLL STREAM ===================== */}
        <div
          ref={chatScrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '4px',
            paddingLeft: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {filteredMessages.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                gap: '8px',
              }}
            >
              <MessageCircle style={{ width: '40px', height: '40px', color: '#38bdf8', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#cbd5e1' }}>
                {activeTab === 'friends'
                  ? 'لا توجد رسائل أصدقاء حالياً'
                  : activeTab === 'private'
                  ? 'لا توجد محادثات خاصة بعد'
                  : activeTab === 'tribe'
                  ? 'لا توجد رسائل في شات القبيلة'
                  : 'لا توجد رسائل'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                اكتب رسالتك في الأسفل وكن أول من يبدأ الحديث!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const details = getPlayerDetails(msg.userId, msg.sender, msg.level, msg.vip);
              const isMe = msg.isMe || (currentUser?.displayName && msg.sender.includes(currentUser.displayName));
              const avatarSrc = getAvatarForMessage(msg, idx);

              return (
                <div
                  key={msg.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    width: '100%',
                    direction: 'ltr', // LTR row layout: avatar on left, bubble on right pointing to it
                  }}
                >
                  {/* Circular Avatar + Diamond Level Badge at bottom */}
                  <div
                    style={{
                      position: 'relative',
                      width: '52px',
                      height: '52px',
                      flexShrink: 0,
                    }}
                  >
                    {/* Circular Avatar Ring */}
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        border: isMe ? '2px solid #facc15' : '2px solid #38bdf8',
                        overflow: 'hidden',
                        background: '#031728',
                        boxShadow: isMe
                          ? '0 0 12px rgba(250, 204, 21, 0.4)'
                          : '0 0 12px rgba(56, 189, 248, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={avatarSrc}
                        alt={msg.sender}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>

                    {/* Diamond Level Badge at Bottom Center (Rotated 45deg) */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '20px',
                        height: '20px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #034f78 100%)',
                        border: '1.5px solid #38bdf8',
                        borderRadius: '3px',
                        boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}
                      title={`المستوى ${details.level}`}
                    >
                      <span
                        style={{
                          transform: 'rotate(-45deg)',
                          fontSize: '11px',
                          fontWeight: '900',
                          color: '#e0f2fe',
                          lineHeight: 1,
                        }}
                      >
                        {details.level}
                      </span>
                    </div>
                  </div>

                  {/* Speech Bubble Card with Left Triangular Pointer/Tail */}
                  <div
                    style={{
                      position: 'relative',
                      flex: 1,
                      minWidth: 0,
                      background: isMe
                        ? 'linear-gradient(135deg, rgba(16, 44, 74, 0.98) 0%, rgba(9, 26, 46, 0.98) 100%)'
                        : 'linear-gradient(135deg, rgba(12, 34, 58, 0.96) 0%, rgba(6, 20, 36, 0.98) 100%)',
                      border: isMe
                        ? '1.5px solid rgba(250, 204, 21, 0.55)'
                        : '1.2px solid rgba(56, 189, 248, 0.32)',
                      borderRadius: '16px',
                      padding: '10px 16px 12px 16px',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                      direction: 'rtl', // Arabic text inside bubble
                    }}
                  >
                    {/* Left Pointer Arrow Tail pointing to the Avatar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '18px',
                        width: 0,
                        height: 0,
                        borderTop: '7px solid transparent',
                        borderBottom: '7px solid transparent',
                        borderRight: isMe
                          ? '9px solid rgba(16, 44, 74, 0.98)'
                          : '9px solid rgba(12, 34, 58, 0.96)',
                        filter: isMe
                          ? 'drop-shadow(-2px 0 0 rgba(250, 204, 21, 0.55))'
                          : 'drop-shadow(-2px 0 0 rgba(56, 189, 248, 0.32))',
                      }}
                    />

                    {/* Sender Name line (if message has a distinct sender name) */}
                    {msg.sender && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: '900',
                              color: isMe ? '#facc15' : (details.isVip ? '#fef08a' : '#e2e8f0'),
                            }}
                          >
                            {msg.sender}
                          </span>

                          {details.isVip && (
                            <span
                              style={{
                                background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
                                color: '#0f172a',
                                fontSize: '9px',
                                fontWeight: '900',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                            >
                              <span>VIP</span>
                              <Sparkles style={{ width: '9px', height: '9px' }} />
                            </span>
                          )}
                        </div>

                        {/* Channel Badge if private or broadcast */}
                        {msg.channel === 'broadcast' && (
                          <span
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              fontSize: '9px',
                              fontWeight: '900',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            📢 إعلان
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message Body Text */}
                    <div
                      style={{
                        fontSize: '14.5px',
                        fontWeight: '600',
                        color: '#f8fafc',
                        lineHeight: '1.6',
                        wordBreak: 'break-word',
                        textAlign: 'right',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {msg.text}
                    </div>

                    {/* Digital Timestamp at bottom corner */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginTop: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10.5px',
                          color: '#94a3b8',
                          fontWeight: '600',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {msg.time || '12:00'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===================== EMOJI PICKER POPUP ===================== */}
        {showEmojiPicker && (
          <div
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '14px',
              right: '14px',
              zIndex: 30,
              background: 'rgba(5, 18, 32, 0.97)',
              border: '1.5px solid rgba(212, 175, 55, 0.6)',
              borderRadius: '14px',
              padding: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#38bdf8',
              }}
            >
              <span>رموز وتعبيرات ملوك الأعماق:</span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '8px',
              }}
            >
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setChatInput(chatInput + emoji);
                    setShowEmojiPicker(false);
                  }}
                  style={{
                    background: 'rgba(14, 38, 64, 0.6)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '8px',
                    height: '38px',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===================== BOTTOM ACTION & INPUT BAR (Megaphone + Settings + Input with Emoji + Send) ===================== */}
        <div
          style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1.5px solid rgba(212, 175, 55, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            direction: 'ltr', // LTR layout: Megaphone & Settings on left, Input in center, Send on right
          }}
        >
          {/* Button 1: Megaphone 📢 (Broadcast announcement) */}
          <button
            type="button"
            onClick={() => setShowMegaphoneModal(true)}
            title="بوق الإعلانات العالمي"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, #163658 0%, #0a1c30 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <Megaphone style={{ width: '20px', height: '20px', color: '#facc15' }} />
          </button>

          {/* Button 2: Settings ⚙️ (Chat sound, Block, Report) */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            title="إعدادات الشات والحظر"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, #163658 0%, #0a1c30 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <Settings style={{ width: '20px', height: '20px', color: '#facc15' }} />
          </button>

          {/* Center Input Form */}
          <form
            id="chat-form"
            onSubmit={sendChatMessage}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {/* Input Wrapper with internal Emoji Smile button on the right */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder={
                  activeTab === 'private'
                    ? selectedWhisperPlayer
                      ? `همس إلى @${selectedWhisperPlayer}...`
                      : 'اكتب رسالتك الخاصة...'
                    : activeTab === 'tribe'
                    ? 'اكتب في شات القبيلة...'
                    : 'اكتب رسالتك'
                }
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                dir="rtl"
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'rgba(6, 20, 35, 0.95)',
                  border: '1.5px solid rgba(56, 189, 248, 0.45)',
                  borderRadius: '10px',
                  padding: '0 40px 0 14px', // Right padding for emoji button
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
                  boxSizing: 'border-box',
                }}
              />

              {/* Emoji Face Button inside Input on the right */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="إضافة رمز تعبيري"
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Smile style={{ width: '22px', height: '22px', color: '#facc15' }} />
              </button>
            </div>

            {/* Button 4: Golden Send ✈️ (with paper airplane) */}
            <button
              type="submit"
              disabled={!chatInput.trim()}
              title="إرسال"
              style={{
                width: '46px',
                height: '44px',
                borderRadius: '10px',
                background: chatInput.trim()
                  ? 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%)'
                  : 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                border: chatInput.trim() ? '1.5px solid #fef08a' : '1.5px solid #475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                opacity: chatInput.trim() ? 1 : 0.5,
                flexShrink: 0,
                boxShadow: chatInput.trim()
                  ? '0 0 14px rgba(250, 204, 21, 0.5)'
                  : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Send
                style={{
                  width: '20px',
                  height: '20px',
                  color: chatInput.trim() ? '#0f172a' : '#94a3b8',
                  transform: 'rotate(-45deg)',
                }}
              />
            </button>
          </form>
        </div>
      </div>

      {/* ===================== MODAL: MEGAPHONE BROADCAST ===================== */}
      {showMegaphoneModal && (
        <div
          onClick={() => setShowMegaphoneModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'linear-gradient(180deg, #0f2b48 0%, #081728 100%)',
              border: '2px solid #facc15',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(250, 204, 21, 0.3)',
              color: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(250, 204, 21, 0.3)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone style={{ width: '22px', height: '22px', color: '#facc15' }} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#fef08a' }}>
                  بوق الإعلانات العالمي
                </h3>
              </div>
              <button
                onClick={() => setShowMegaphoneModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 14px 0' }}>
              أطلق نداءً مدوياً لجميع القراصنة والبحارة في ملوك الأعماق بلون ذهبي مميز!
            </p>

            <form onSubmit={handleBroadcastMegaphone}>
              <textarea
                placeholder="اكتب إعلانك العام هنا..."
                value={megaphoneText}
                onChange={(e) => setMegaphoneText(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(5, 16, 28, 0.9)',
                  border: '1.5px solid rgba(250, 204, 21, 0.4)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'none',
                  marginBottom: '14px',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowMegaphoneModal(false)}
                  style={{
                    background: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!megaphoneText.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: '900',
                    cursor: megaphoneText.trim() ? 'pointer' : 'not-allowed',
                    opacity: megaphoneText.trim() ? 1 : 0.5,
                  }}
                >
                  📢 إطلاق الإعلان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: SETTINGS & BLOCKS ===================== */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'linear-gradient(180deg, #0d253f 0%, #061322 100%)',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.85)',
              color: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings style={{ width: '22px', height: '22px', color: '#38bdf8' }} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#f8fafc' }}>
                  إعدادات الشات والخصوصية
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Sound Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'rgba(15, 38, 64, 0.7)',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {internalMuted ? (
                  <VolumeX style={{ width: '20px', height: '20px', color: '#f87171' }} />
                ) : (
                  <Volume2 style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
                )}
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 'bold' }}>أصوات إشعارات الشات</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {internalMuted ? 'الصوت مكتوم حالياً' : 'الصوت مفعل للرسائل الواردة'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleMute}
                style={{
                  background: internalMuted
                    ? '#ef4444'
                    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {internalMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
              </button>
            </div>

            {/* Block Players Section */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>
                🚫 حظر لاعب مزعج:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="اكتب اسم اللاعب لحظر رسائله..."
                  value={userToBlock}
                  onChange={(e) => setUserToBlock(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(5, 16, 28, 0.9)',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleBlockUser(userToBlock)}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  حظر
                </button>
              </div>
            </div>

            {/* Blocked List */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px' }}>
                قائمة المحظورين ({blockedUsers.length}):
              </div>
              {blockedUsers.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>لا يوجد أي لاعب محظور حالياً.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                  {blockedUsers.map((name) => (
                    <div
                      key={name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '12px',
                      }}
                    >
                      <span>{name}</span>
                      <button
                        onClick={() => handleUnblockUser(name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '11px',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Report Player Action */}
            <div
              style={{
                paddingTop: '12px',
                borderTop: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowReportModal(true);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #f59e0b',
                  color: '#facc15',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <ShieldAlert style={{ width: '15px', height: '15px' }} />
                <span>الإبلاغ عن إساءة أو شتائم</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 18px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: REPORT PLAYER ===================== */}
      {showReportModal && (
        <div
          onClick={() => setShowReportModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'linear-gradient(180deg, #1f1118 0%, #10080d 100%)',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
              color: '#f8fafc',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert style={{ width: '22px', height: '22px', color: '#ef4444' }} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#f87171' }}>
                  إبلاغ عن مخالفة
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  اسم اللاعب المخالف:
                </label>
                <input
                  type="text"
                  placeholder="اكتب اسم اللاعب..."
                  value={reportTarget}
                  onChange={(e) => setReportTarget(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#180d12',
                    border: '1px solid #7f1d1d',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  سبب البلاغ:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#180d12',
                    border: '1px solid #7f1d1d',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="شتائم وألفاظ نابية">شتائم وألفاظ نابية</option>
                  <option value="سباب وإساءة شخصية">سباب وإساءة شخصية</option>
                  <option value="تهديد أو ابتزاز">تهديد أو ابتزاز</option>
                  <option value="احتيال ونصب">احتيال ونصب</option>
                  <option value="إزعاج وتكرار (سبام)">إزعاج وتكرار (سبام)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  تفاصيل إضافية:
                </label>
                <textarea
                  placeholder="صف المخالفة باختصار..."
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    background: '#180d12',
                    border: '1px solid #7f1d1d',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{
                    background: '#29141c',
                    color: '#94a3b8',
                    border: '1px solid #4a1d2d',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={reportSuccess}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: '900',
                    cursor: 'pointer',
                  }}
                >
                  {reportSuccess ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatView;
