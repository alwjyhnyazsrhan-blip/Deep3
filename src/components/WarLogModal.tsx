import React, { useState } from 'react';
import { 
  Skull, 
  Swords, 
  Gift, 
  Flame, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Bomb, 
  AlertTriangle, 
  Trophy, 
  Clock, 
  Coins, 
  Gem, 
  Users, 
  CheckCircle2, 
  Trash2,
  Shield
} from 'lucide-react';
import { BattleReport } from '../types';

export interface AttackLogItem {
  id: string;
  attackerName: string;
  attackerAvatar: string;
  attackerLevel: number;
  time: string;
  title: string;
  description: string;
  goldLooted: number;
  shipsDamaged: number;
  isAvenged: boolean;
  date: string;
}

export interface SupportGiftItem {
  id: string;
  senderName: string;
  senderAvatar: string;
  time: string;
  type: 'crew' | 'chest' | 'armor';
  title: string;
  description: string;
  rewards: {
    gold?: number;
    gems?: number;
    crewPower?: number;
    shipHeal?: number;
  };
  claimed: boolean;
}

interface WarLogModalProps {
  onClose: () => void;
  onRevenge: (attackerName: string, attackId?: string) => void;
  onClaimGift: (gift: SupportGiftItem) => void;
  battleReports: BattleReport[];
  attackLogs: AttackLogItem[];
  supportGifts: SupportGiftItem[];
  onClearLogs?: () => void;
}

export const WarLogModal: React.FC<WarLogModalProps> = ({
  onClose,
  onRevenge,
  onClaimGift,
  battleReports,
  attackLogs,
  supportGifts,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'attacks' | 'supports' | 'all'>('attacks');

  // Filter out any mock/placeholder reports
  const realReports = (battleReports || []).filter(
    (r) => r && r.opponentName && r.opponentName !== 'قبطان معادٍ' && !r.id?.startsWith('mock_')
  );

  const pendingAttacks = (attackLogs || []).filter((a) => !a.isAvenged);
  const pendingGifts = (supportGifts || []).filter((g) => !g.claimed);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #071728 0%, #06121e 40%, #030a12 100%)',
        color: '#f8fafc',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        direction: 'rtl',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
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
          opacity: 0.4,
          zIndex: 0,
        }}
      />

      {/* Main Full-Screen Wrapper */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* ================= HEADER FULL SCREEN WIDTH ================= */}
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '16px 20px',
            background: 'linear-gradient(90deg, rgba(35, 12, 18, 0.98) 0%, rgba(14, 30, 52, 0.98) 100%)',
            borderBottom: '2px solid rgba(212, 175, 55, 0.55)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* The Skull Icon from user upload */}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #450a0a 0%, #1e1b4b 100%)',
                border: '2px solid #ef4444',
                boxShadow: '0 0 18px rgba(239, 68, 68, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src="/assets/aistudio/IMG_20261105_161911_af22379c.jpg"
                alt="Skull War Log"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: '900',
                    color: '#f8fafc',
                    letterSpacing: '-0.3px',
                  }}
                >
                  سجل الغارات والانتقام والدعوم
                </h1>
                <span
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '900',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    boxShadow: '0 0 8px #ef4444',
                  }}
                >
                  نظام الثأر 💀
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                تتبع من هاجمك أو سرقك، ورد الهجوم فوراً لتفجير محيطه، واستلم هدايا الطواقم والدعوم البحرية!
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            title="إغلاق والعودة للميناء"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1.5px solid rgba(212, 175, 55, 0.5)',
              color: '#f8fafc',
              fontSize: '18px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* ================= TABS NAVIGATION FULL WIDTH ================= */}
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            padding: '12px 20px',
            gap: '10px',
            background: 'rgba(6, 17, 30, 0.95)',
            borderBottom: '1.5px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          {/* Tab 1: غارات الأعداء (الانتقام) */}
          <button
            onClick={() => setActiveTab('attacks')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border:
                activeTab === 'attacks'
                  ? '2px solid #ef4444'
                  : '1px solid rgba(71, 85, 105, 0.5)',
              background:
                activeTab === 'attacks'
                  ? 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)'
                  : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'attacks' ? '#ffffff' : '#cbd5e1',
              fontSize: '14px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow:
                activeTab === 'attacks' ? '0 0 16px rgba(239, 68, 68, 0.5)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Swords style={{ width: '18px', height: '18px', color: '#f87171' }} />
            <span>غارات الأعداء والانتقام</span>
            {pendingAttacks.length > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  fontWeight: '900',
                }}
              >
                {pendingAttacks.length}
              </span>
            )}
          </button>

          {/* Tab 2: الدعوم والصناديق */}
          <button
            onClick={() => setActiveTab('supports')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border:
                activeTab === 'supports'
                  ? '2px solid #10b981'
                  : '1px solid rgba(71, 85, 105, 0.5)',
              background:
                activeTab === 'supports'
                  ? 'linear-gradient(180deg, #065f46 0%, #064e3b 100%)'
                  : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'supports' ? '#ffffff' : '#cbd5e1',
              fontSize: '14px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow:
                activeTab === 'supports' ? '0 0 16px rgba(16, 185, 129, 0.5)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Gift style={{ width: '18px', height: '18px', color: '#34d399' }} />
            <span>الدعوم والصناديق والطواقم</span>
            {pendingGifts.length > 0 && (
              <span
                style={{
                  background: '#10b981',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  fontWeight: '900',
                }}
              >
                {pendingGifts.length}
              </span>
            )}
          </button>

          {/* Tab 3: السجل العام للمعارك */}
          <button
            onClick={() => setActiveTab('all')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border:
                activeTab === 'all'
                  ? '2px solid #38bdf8'
                  : '1px solid rgba(71, 85, 105, 0.5)',
              background:
                activeTab === 'all'
                  ? 'linear-gradient(180deg, #0369a1 0%, #075985 100%)'
                  : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'all' ? '#ffffff' : '#cbd5e1',
              fontSize: '14px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow:
                activeTab === 'all' ? '0 0 16px rgba(56, 189, 248, 0.5)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Trophy style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
            <span>السجل العام للمعركة ({realReports.length})</span>
          </button>
        </div>

        {/* ================= CONTENT BODY FULL WIDTH ================= */}
        <div
          style={{
            flex: 1,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            padding: '20px 20px 60px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* ============= 1. ENEMY ATTACKS & REVENGE ============= */}
          {activeTab === 'attacks' && (
            <>
              {(!attackLogs || attackLogs.length === 0) ? (
                <div
                  style={{
                    width: '100%',
                    padding: '80px 20px',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.45)',
                    borderRadius: '20px',
                    border: '1.5px dashed rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                  }}
                >
                  <ShieldCheck
                    style={{ width: '64px', height: '64px', color: '#10b981' }}
                  />
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#f8fafc' }}>
                    ميناؤك وأسطولك في أمان تام 🛡️
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '440px', lineHeight: '1.6' }}>
                    لا توجد أي غارات أو هجمات مسجلة على مينائك حالياً. في حال قيام أي قبطان بقصف مينائك أو سرقتك، ستظهر غارته هنا فوراً مع خيار الانتقام الفوري لتفجير محيطه!
                  </div>
                </div>
              ) : (
                attackLogs.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: item.isAvenged
                        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(6, 15, 28, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(69, 10, 10, 0.9) 0%, rgba(20, 8, 14, 0.98) 100%)',
                      border: item.isAvenged
                        ? '1.5px solid rgba(71, 85, 105, 0.5)'
                        : '2px solid rgba(239, 68, 68, 0.75)',
                      borderRadius: '18px',
                      padding: '16px 20px',
                      boxShadow: item.isAvenged
                        ? '0 4px 14px rgba(0,0,0,0.4)'
                        : '0 8px 25px rgba(239, 68, 68, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Top Row: Attacker Info + Time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '2px solid #ef4444',
                            overflow: 'hidden',
                            background: '#0f172a',
                            boxShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src={item.attackerAvatar || '/assets/chat_avatar_2.png'}
                            alt={item.attackerName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: '#f8fafc' }}>
                              {item.attackerName}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 'bold',
                                color: '#fca5a5',
                                background: 'rgba(239, 68, 68, 0.25)',
                                border: '1px solid rgba(239, 68, 68, 0.45)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              ليفل {item.attackerLevel}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Flame style={{ width: '14px', height: '14px' }} />
                            <span>{item.title}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ width: '14px', height: '14px' }} />
                        <span>{item.time}</span>
                      </div>
                    </div>

                    {/* Description & Losses */}
                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        fontSize: '14px',
                        color: '#f1f5f9',
                        lineHeight: '1.6',
                      }}
                    >
                      <p style={{ margin: 0 }}>{item.description}</p>
                      {item.goldLooted > 0 && (
                        <div
                          style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#facc15',
                            fontWeight: 'bold',
                            fontSize: '13.5px',
                          }}
                        >
                          <Coins style={{ width: '16px', height: '16px' }} />
                          <span>الذهب المسروق: 🪙 {item.goldLooted.toLocaleString('ar-EG')} ذهب</span>
                        </div>
                      )}
                    </div>

                    {/* Revenge Action Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: item.isAvenged ? '#34d399' : '#f87171' }}>
                        {item.isAvenged ? '✅ تم الرد والانتقام وتدمير أسطولها' : '⚠️ لم يتم رد الهجوم بعد! ثأرك ينتظر'}
                      </div>

                      {item.isAvenged ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#10b981',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            padding: '8px 16px',
                            borderRadius: '10px',
                          }}
                        >
                          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                          <span>تم تدمير محيطها وثأرك كامل</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onRevenge(item.attackerName, item.id)}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                            border: '1.5px solid #fca5a5',
                            borderRadius: '12px',
                            padding: '10px 22px',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.6)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Bomb style={{ width: '18px', height: '18px' }} />
                          <span>⚡ رد الهجوم وتفجير محيطها الآن 🚀</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* ============= 2. SUPPORTS, CHESTS & CREW ============= */}
          {activeTab === 'supports' && (
            <>
              {(!supportGifts || supportGifts.length === 0) ? (
                <div
                  style={{
                    width: '100%',
                    padding: '80px 20px',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.45)',
                    borderRadius: '20px',
                    border: '1.5px dashed rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                  }}
                >
                  <Gift style={{ width: '64px', height: '64px', color: '#10b981' }} />
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#f8fafc' }}>
                    لا توجد دعوم معلقة حالياً 🎁
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '440px', lineHeight: '1.6' }}>
                    عندما يرسل لك حلفاء قبيلتك أو أصدقاؤك طواقم بحرية أو صناديق أسطورية أو دروعاً حربية، ستظهر هنا لاستلامها فوراً.
                  </div>
                </div>
              ) : (
                supportGifts.map((gift) => (
                  <div
                    key={gift.id}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: gift.claimed
                        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(6, 15, 28, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(6, 78, 59, 0.85) 0%, rgba(4, 47, 46, 0.95) 100%)',
                      border: gift.claimed
                        ? '1.5px solid rgba(71, 85, 105, 0.5)'
                        : '2px solid rgba(16, 185, 129, 0.75)',
                      borderRadius: '18px',
                      padding: '16px 20px',
                      boxShadow: gift.claimed
                        ? '0 4px 14px rgba(0,0,0,0.4)'
                        : '0 8px 25px rgba(16, 185, 129, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Top Row: Sender Info + Time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '2px solid #10b981',
                            overflow: 'hidden',
                            background: '#0f172a',
                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src={gift.senderAvatar || '/assets/chat_avatar_1.png'}
                            alt={gift.senderName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#f8fafc' }}>
                            {gift.senderName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Sparkles style={{ width: '14px', height: '14px' }} />
                            <span>{gift.title}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ width: '14px', height: '14px' }} />
                        <span>{gift.time}</span>
                      </div>
                    </div>

                    {/* Description & Rewards */}
                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        fontSize: '14px',
                        color: '#f1f5f9',
                        lineHeight: '1.6',
                      }}
                    >
                      <p style={{ margin: 0 }}>{gift.description}</p>
                      
                      {/* Rewards Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        {gift.rewards.gems && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(56, 189, 248, 0.2)',
                              border: '1px solid #38bdf8',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              color: '#38bdf8',
                            }}
                          >
                            <Gem style={{ width: '14px', height: '14px' }} />
                            <span>💎 {gift.rewards.gems.toLocaleString('ar-EG')} جوهرة</span>
                          </div>
                        )}

                        {gift.rewards.gold && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(234, 179, 8, 0.2)',
                              border: '1px solid #eab308',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              color: '#facc15',
                            }}
                          >
                            <Coins style={{ width: '14px', height: '14px' }} />
                            <span>🪙 {gift.rewards.gold.toLocaleString('ar-EG')} ذهب</span>
                          </div>
                        )}

                        {gift.rewards.crewPower && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(168, 85, 247, 0.2)',
                              border: '1px solid #a855f7',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              color: '#c084fc',
                            }}
                          >
                            <Users style={{ width: '14px', height: '14px' }} />
                            <span>👨‍✈️ قوة طاقم +{gift.rewards.crewPower}</span>
                          </div>
                        )}

                        {gift.rewards.shipHeal && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid #ef4444',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              color: '#fca5a5',
                            }}
                          >
                            <span>❤️ ترميم وإصلاح سفن +{gift.rewards.shipHeal} HP</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Claim Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      {gift.claimed ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#10b981',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            padding: '8px 16px',
                            borderRadius: '10px',
                          }}
                        >
                          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                          <span>تم الاستلام والإضافة لحسابك بنجاح</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onClaimGift(gift)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: '1.5px solid #6ee7b7',
                            borderRadius: '12px',
                            padding: '10px 22px',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.5)',
                          }}
                        >
                          <Gift style={{ width: '16px', height: '16px' }} />
                          <span>استلام الدعم والمكافأة 🎁</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* ============= 3. ALL BATTLE REPORTS (السجل العام الحقيقي) ============= */}
          {activeTab === 'all' && (
            <>
              {(!realReports || realReports.length === 0) ? (
                <div
                  style={{
                    width: '100%',
                    padding: '80px 20px',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.45)',
                    borderRadius: '20px',
                    border: '1.5px dashed rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                  }}
                >
                  <Trophy style={{ width: '64px', height: '64px', color: '#38bdf8' }} />
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#f8fafc' }}>
                    لا توجد معارك سابقة مسجلة في السجل 📜
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '440px', lineHeight: '1.6' }}>
                    سجل المعارك نظيف. قم بغزو موانئ الأعداء أو خوض المعارك البحرية وسيتسجل تاريخك الحربي هنا بدقة!
                  </div>
                </div>
              ) : (
                realReports.map((report, idx) => (
                  <div
                    key={report.id || idx}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: report.isVictory
                        ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.5) 0%, rgba(2, 44, 34, 0.7) 100%)'
                        : 'linear-gradient(135deg, rgba(69, 10, 10, 0.5) 0%, rgba(30, 8, 8, 0.7) 100%)',
                      border: report.isVictory
                        ? '1.5px solid rgba(16, 185, 129, 0.5)'
                        : '1.5px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '16px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '28px' }}>{report.isVictory ? '🏆' : '💀'}</span>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>
                          معركة ضد: {report.opponentName}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: report.isVictory ? '#34d399' : '#f87171',
                            marginTop: '2px',
                          }}
                        >
                          {report.isVictory ? 'انتصار ساحق في المعركة' : 'هزيمة وتضرر في الأسطول'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>
                      {report.goldChange !== 0 && (
                        <div style={{ color: report.goldChange > 0 ? '#facc15' : '#f87171', fontWeight: 'bold', fontSize: '13px' }}>
                          {report.goldChange > 0 ? `+${report.goldChange.toLocaleString('ar-EG')} 🪙` : `${report.goldChange.toLocaleString('ar-EG')} 🪙`}
                        </div>
                      )}
                      <div>{report.time || 'اليوم'}</div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* ================= FULL WIDTH STICKY FOOTER ================= */}
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '16px 20px',
            background: 'rgba(5, 14, 25, 0.98)',
            borderTop: '1.5px solid rgba(212, 175, 55, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
            <span>💀 قوة الانتقام تمنحك استعادة الذهب المسروق ومضاعفة نقاط الخبرة.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onClearLogs && (
              <button
                onClick={onClearLogs}
                title="مسح وتفريغ السجلات القديمة"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  color: '#f87171',
                  fontSize: '12.5px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Trash2 style={{ width: '14px', height: '14px' }} />
                <span>تفريغ السجل</span>
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                border: '1.5px solid rgba(212, 175, 55, 0.55)',
                borderRadius: '10px',
                padding: '8px 24px',
                color: '#f8fafc',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              إغلاق والعودة للميناء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarLogModal;
