import React, { useState } from 'react';
import { GOLD_COIN_ICON, PIRATE_SHOP_BG, WEAPON_SMALL_MISSILE_ICON, WEAPON_MEDIUM_MISSILE_ICON, WEAPON_LARGE_MISSILE_ICON, WEAPON_MEDIA_BOMB_ICON, WEAPON_ATOMIC_BOMB_ICON, SHIP_GUARDIAN_ICON, SHIP_GUARDIAN_BG, FIXER_SMALL_ICON, FIXER_SMALL_BG, FIXER_MEDIUM_ICON, FIXER_MEDIUM_BG, FIXER_LARGE_ICON, FIXER_LARGE_BG, FIXER_LEGENDARY_ICON, FIXER_LEGENDARY_BG, SAILOR_ICON, SAILOR_BG, GOLDEN_HUNTER_ICON, GOLDEN_HUNTER_BG, MARKET_EXPERT_ICON, MARKET_EXPERT_BG, LUCK_PIRATE_ICON, LUCK_PIRATE_BG, SHIP_PILOT_ICON, SHIP_PILOT_BG, SHIP_THIEF_ICON, SHIP_THIEF_BG, CREW_SHOP_ITEMS, WEAPONS_DATA } from '../data';
import { executeFinancialTransaction, isNetworkOnline, notifyOfflineBlocked } from '../services/financialTransaction';

import rechargeShellGems from '../assets/images/recharge_shell_gems_1787165355968.jpg';
import rechargeChestGems from '../assets/images/recharge_chest_gems_1787165366961.jpg';
import rechargeBarrelGems from '../assets/images/recharge_barrel_gems_1787165379786.jpg';
import rechargeIronChest from '../assets/images/recharge_iron_chest_1787165390766.jpg';
import rechargePirateShip from '../assets/images/recharge_pirate_ship_1787165401248.jpg';
import rechargeRoyalChest from '../assets/images/recharge_royal_chest_1787165414511.jpg';

interface PirateShopProps {
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  gems: number;
  setGems: React.Dispatch<React.SetStateAction<number>>;
  redGems: number;
  setRedGems: React.Dispatch<React.SetStateAction<number>>;
  weapons: Record<string, number>;
  setWeapons: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  crewServices: Record<string, boolean>;
  setCrewServices: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  ships: any[];
  setShips: React.Dispatch<React.SetStateAction<any[]>>;
  bgTheme: string;
  setBgTheme: (theme: string) => void;
  profileTheme: string;
  setProfileTheme: (theme: string) => void;
  setActiveTab: (tab: any) => void;
  playerLevel: number;
  exp?: number;
  buyShipLevel: (spec: any) => void;
  buyWeaponItem: (itemId: string, costType: 'gold' | 'blueGems', costValue: number) => void;
  buyCrewService: (key: string, name: string, price: number) => void;
  buyShopItem: (type: 'ship' | 'net' | 'engine' | 'gold_pack', costGold: number, costGems: number) => void;
  crewInventory?: Record<string, number>;
  setCrewInventory?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  shieldInventory?: Record<string, number>;
  setShieldInventory?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handlePurchase?: (params: {
    category: 'weapon' | 'crew' | 'shield' | 'ship' | 'service' | 'item';
    itemId: string;
    itemName: string;
    costType: 'gold' | 'gems' | 'blueGems';
    price: number;
    quantity?: number;
    targetShipId?: string;
  }) => Promise<boolean>;
  buyItem?: (params: {
    category: 'weapon' | 'crew' | 'shield' | 'ship' | 'service' | 'item';
    itemId: string;
    itemName: string;
    costType: 'gold' | 'gems' | 'blueGems';
    price: number;
    quantity?: number;
    targetShipId?: string;
  }) => Promise<boolean>;
  confirmUpgradeShip?: (shipId: string, spec: any) => void;
  upgradeTargetSpec?: any;
  setUpgradeTargetSpec?: (spec: any) => void;
}

interface RechargePackage {
  id: string;
  title: string;
  price: number;
  baseGems: number;
  bonusGems: number;
  freePercent: number;
  ribbon?: string;
  image: string;
  artType: string;
  artEmoji: string;
  artSubEmoji: string;
  givesGems: number;
  givesWeapons?: { atomicBomb: number };
  theme: {
    btnGrad: string;
    btnBorder: string;
    btnShadow: string;
    tagBg: string;
    tagBorder: string;
    tagText: string;
    cardBorder: string;
    innerGlow: string;
  };
}

const RECHARGE_PACKAGES: RechargePackage[] = [
  {
    id: 'pack_1000_gems',
    title: 'عرض 1,000 جوهرة',
    price: 5.99,
    baseGems: 1000,
    bonusGems: 100,
    freePercent: 10,
    ribbon: 'الأكثر مبيعاً',
    image: rechargeShellGems,
    artType: 'shell',
    artEmoji: '🦪',
    artSubEmoji: '💎',
    givesGems: 1100,
    givesWeapons: { atomicBomb: 6 },
    theme: {
      btnGrad: 'linear-gradient(180deg, #9333ea 0%, #581c87 100%)',
      btnBorder: '#c084fc',
      btnShadow: '0 0 14px rgba(168, 85, 247, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
      tagBg: 'rgba(147, 51, 234, 0.25)',
      tagBorder: '#a855f7',
      tagText: '#e9d5ff',
      cardBorder: 'rgba(168, 85, 247, 0.45)',
      innerGlow: 'rgba(168, 85, 247, 0.15)',
    },
  },
  {
    id: 'pack_4000_gems',
    title: 'عرض 4,000 جوهرة',
    price: 15.99,
    baseGems: 4000,
    bonusGems: 450,
    freePercent: 11,
    image: rechargeChestGems,
    artType: 'chest1',
    artEmoji: '📦',
    artSubEmoji: '💎',
    givesGems: 4450,
    givesWeapons: { atomicBomb: 26 },
    theme: {
      btnGrad: 'linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)',
      btnBorder: '#60a5fa',
      btnShadow: '0 0 14px rgba(59, 130, 246, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
      tagBg: 'rgba(37, 99, 235, 0.25)',
      tagBorder: '#3b82f6',
      tagText: '#bfdbfe',
      cardBorder: 'rgba(59, 130, 246, 0.45)',
      innerGlow: 'rgba(59, 130, 246, 0.15)',
    },
  },
  {
    id: 'pack_15000_gems',
    title: 'عرض 15,000 جوهرة',
    price: 59.99,
    baseGems: 15000,
    bonusGems: 1800,
    freePercent: 12,
    image: rechargeBarrelGems,
    artType: 'barrel',
    artEmoji: '🛢️',
    artSubEmoji: '💎',
    givesGems: 16800,
    givesWeapons: { atomicBomb: 100 },
    theme: {
      btnGrad: 'linear-gradient(180deg, #0284c7 0%, #075985 100%)',
      btnBorder: '#38bdf8',
      btnShadow: '0 0 14px rgba(56, 189, 248, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
      tagBg: 'rgba(2, 132, 199, 0.25)',
      tagBorder: '#0ea5e9',
      tagText: '#bae6fd',
      cardBorder: 'rgba(56, 189, 248, 0.45)',
      innerGlow: 'rgba(56, 189, 248, 0.15)',
    },
  },
  {
    id: 'pack_35000_gems',
    title: 'عرض 35,000 جوهرة',
    price: 119.99,
    baseGems: 35000,
    bonusGems: 4800,
    freePercent: 13,
    image: rechargeIronChest,
    artType: 'chest2',
    artEmoji: '🗝️',
    artSubEmoji: '💎',
    givesGems: 39800,
    givesWeapons: { atomicBomb: 233 },
    theme: {
      btnGrad: 'linear-gradient(180deg, #059669 0%, #064e3b 100%)',
      btnBorder: '#34d399',
      btnShadow: '0 0 14px rgba(168, 85, 247, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
      tagBg: 'rgba(5, 150, 105, 0.25)',
      tagBorder: '#10b981',
      tagText: '#a7f3d0',
      cardBorder: 'rgba(16, 185, 129, 0.45)',
      innerGlow: 'rgba(16, 185, 129, 0.15)',
    },
  },
  {
    id: 'pack_75000_gems',
    title: 'عرض 75,000 جوهرة',
    price: 210.99,
    baseGems: 75000,
    bonusGems: 11000,
    freePercent: 14,
    image: rechargePirateShip,
    artType: 'ship',
    artEmoji: '⛵',
    artSubEmoji: '🏴‍☠️',
    givesGems: 86000,
    givesWeapons: { atomicBomb: 500 },
    theme: {
      btnGrad: 'linear-gradient(180deg, #ca8a04 0%, #713f12 100%)',
      btnBorder: '#facc15',
      btnShadow: '0 0 14px rgba(234, 179, 8, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
      tagBg: 'rgba(202, 138, 4, 0.25)',
      tagBorder: '#eab308',
      tagText: '#fef08a',
      cardBorder: 'rgba(234, 179, 8, 0.45)',
      innerGlow: 'rgba(234, 179, 8, 0.15)',
    },
  },
  {
    id: 'pack_165000_gems',
    title: 'عرض 165,000 جوهرة',
    price: 409.99,
    baseGems: 165000,
    bonusGems: 26000,
    freePercent: 15,
    image: rechargeRoyalChest,
    artType: 'royal_chest',
    artEmoji: '👑',
    artSubEmoji: '🧭',
    givesGems: 191000,
    givesWeapons: { atomicBomb: 1100 },
    theme: {
      btnGrad: 'linear-gradient(180deg, #dc2626 0%, #7f1d1d 100%)',
      btnBorder: '#f87171',
      btnShadow: '0 0 14px rgba(239, 68, 68, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
      tagBg: 'rgba(220, 38, 38, 0.25)',
      tagBorder: '#ef4444',
      tagText: '#fecaca',
      cardBorder: 'rgba(239, 68, 68, 0.45)',
      innerGlow: 'rgba(239, 68, 68, 0.15)',
    },
  },
];

const BACKGROUND_ITEMS = [
  { id: 'pharaohs_bay', title: 'خليج الفراعنة 🌴', priceGold: 0, isFree: true, tag: 'مركبه الآن', rarity: 'نادر' },
  { id: 'eiffel_paris', title: 'برج النيل باريس 🗼', priceGold: 7000, rarity: 'أسطوري', tag: 'مجانية' },
  { id: 'eiffel_tower', title: 'برج إيفل 🗼', priceGold: 3500, rarity: 'ملحمي', tag: 'مجانية' },
  { id: 'golden_bull', title: 'مملكة الثور الذهبية 🐂', priceGold: 7000, rarity: 'أسطوري', tag: 'مجانية' },
  { id: 'ittihad_club', title: 'نادي الاتحاد ⚽', priceGold: 5000, rarity: 'نادر', tag: 'مجانية' },
  { id: 'shabab_club', title: 'نادي الشباب ⚽', priceGold: 5000, rarity: 'نادر', tag: 'مجانية' },
  { id: 'nassr_club', title: 'نادي النصر ⚽', priceGold: 5000, rarity: 'أسطوري', tag: 'مجانية' },
  { id: 'ahli_club', title: 'نادي الأهلي ⚽', priceGold: 5000, rarity: 'أسطوري', tag: 'مجانية' },
  { id: 'madagascar', title: 'قرية مدغشقر 🏕️', priceGold: 4000, rarity: 'نادر', tag: 'مجانية' },
  { id: 'swan_lake', title: 'بحيرة البجع 🦢', priceGold: 4000, rarity: 'نادر', tag: 'مجانية' },
];

export default function PirateShop({
  gold,
  setGold,
  gems,
  setGems,
  redGems,
  setRedGems,
  weapons,
  setWeapons,
  crewServices,
  setCrewServices,
  ships,
  setShips,
  bgTheme,
  setBgTheme,
  profileTheme,
  setProfileTheme,
  setActiveTab,
  playerLevel,
  buyShipLevel,
  buyWeaponItem,
  buyCrewService,
  buyShopItem,
  crewInventory,
  setCrewInventory,
  shieldInventory,
  setShieldInventory,
  handlePurchase,
  buyItem,
}: PirateShopProps) {
  const [shopSubTab, setShopSubTab] = useState<
    'defense' | 'hamour' | 'crew_services' | 'vip' | 'backgrounds' | 'recharge'
  >('defense');
  const [hideCards, setHideCards] = useState(false);
  const [payingItem, setPayingItem] = useState<any | null>(null);
  const [paymentStep, setPaymentStep] = useState<'details' | 'loading' | 'success'>('details');

  const [cardNumber, setCardNumber] = useState('4220 5689 3110 4452');
  const [cardHolder, setCardHolder] = useState('القبطان الشجاع');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('789');

  const filteredRecharge = RECHARGE_PACKAGES;

  const handlePay = (pkg: any) => {
    if (!isNetworkOnline()) {
      notifyOfflineBlocked(`شحن باقة ${pkg.title || 'الجواهر'}`);
      return;
    }
    setPayingItem(pkg);
    setPaymentStep('details');
  };

  const handleConfirmPay = async () => {
    if (!isNetworkOnline()) {
      notifyOfflineBlocked('شحن وتأكيد الباقة');
      return;
    }
    setPaymentStep('loading');
    setTimeout(async () => {
      const addedGems = payingItem?.givesGems || 0;
      const addedGold = payingItem?.givesGold || 0;
      let nextWeapons = weapons;
      if (payingItem?.givesWeapons) {
        nextWeapons = { ...weapons };
        Object.entries(payingItem.givesWeapons).forEach(([k, v]) => {
          nextWeapons[k] = (nextWeapons[k] || 0) + (v as number);
        });
      }

      const res = await executeFinancialTransaction({
        goldDelta: addedGold,
        gemsDelta: addedGems,
        weapons: nextWeapons,
        reason: `شحن باقة (${payingItem?.title || 'باقة'})`,
        onLocalApply: () => {
          if (addedGems) setGems(prev => prev + addedGems);
          if (addedGold) setGold(prev => prev + addedGold);
          if (payingItem?.givesWeapons) setWeapons(nextWeapons);
        }
      });

      if (res.success) {
        if (typeof res.newGold === 'number') setGold(res.newGold);
        if (typeof res.newGems === 'number') setGems(res.newGems);
        if (payingItem?.givesWeapons) setWeapons(nextWeapons);
        setPaymentStep('success');
      } else {
        setPaymentStep('details');
      }
    }, 1500);
  };

  const claimVipReward = async () => {
    if (!isNetworkOnline()) {
      notifyOfflineBlocked('استلام مكافأة VIP اليومية');
      return;
    }

    const res = await executeFinancialTransaction({
      goldDelta: 10000,
      gemsDelta: 500,
      reason: 'استلام مكافأة عضو VIP اليومية',
      onLocalApply: () => {
        setGems(prev => prev + 500);
        setGold(prev => prev + 10000);
      }
    });

    if (res.success) {
      if (typeof res.newGold === 'number') setGold(res.newGold);
      if (typeof res.newGems === 'number') setGems(res.newGems);
      alert('🎁 تم استلام المكافأة اليومية كعضو VIP عبر المعاملة الذرية: +500 💎 جوهرة و +10,000 🪙 ذهب!');
    }
  };

  const buyBackground = async (bg: any) => {
    if (bg.isFree || bg.priceGold === 0) {
      setBgTheme(bg.id);
      alert(`✨ تم تجهيز خلفية [${bg.title}] بنجاح!`);
      return;
    }
    if (!isNetworkOnline()) {
      notifyOfflineBlocked(`شراء وتجهيز خلفية [${bg.title}]`);
      return;
    }
    if (gold < bg.priceGold) {
      alert(`⚠️ الذهب غير كافٍ! تحتاج إلى ${bg.priceGold.toLocaleString()} 🪙 ذهب.`);
      return;
    }

    const res = await executeFinancialTransaction({
      goldDelta: -bg.priceGold,
      reason: `شراء وتجهيز خلفية ${bg.title}`,
      onLocalApply: () => {
        setGold(prev => prev - bg.priceGold);
        setBgTheme(bg.id);
      }
    });

    if (res.success) {
      if (typeof res.newGold === 'number') setGold(res.newGold);
      setBgTheme(bg.id);
      alert(`🎉 تم شراء وتجهيز خلفية [${bg.title}] بنجاح عبر المعاملة الذرية!`);
    }
  };

  const getRewardChipStyle = (label: string) => {
    let borderColor = '#0ea5e9';
    let bgColor = 'rgba(14, 165, 233, 0.1)';
    let textColor = '#38bdf8';

    if (label.includes('جوهرة') || label.includes('💎')) {
      borderColor = '#06b6d4';
      bgColor = 'rgba(6, 182, 212, 0.1)';
      textColor = '#22d3ee';
    } else if (label.includes('إطار') || label.includes('لوحة') || label.includes('فقاعة') || label.includes('بطاقة')) {
      borderColor = '#ec4899';
      bgColor = 'rgba(236, 72, 153, 0.12)';
      textColor = '#f472b6';
    } else if (label.includes('نووية') || label.includes('قنبلة') || label.includes('صاروخ')) {
      borderColor = '#f97316';
      bgColor = 'rgba(249, 115, 22, 0.1)';
      textColor = '#fb923c';
    } else if (label.includes('درع') || label.includes('مضاد')) {
      borderColor = '#a855f7';
      bgColor = 'rgba(168, 85, 247, 0.1)';
      textColor = '#c084fc';
    } else if (label.includes('حظ') || label.includes('سارق') || label.includes('شرطي') || label.includes('تاجر')) {
      borderColor = '#10b981';
      bgColor = 'rgba(16, 185, 129, 0.1)';
      textColor = '#34d399';
    }

    return {
      border: `1.5px solid ${borderColor}`,
      background: bgColor,
      color: textColor,
      borderRadius: '6px',
      padding: '4px 8px',
      fontSize: '11px',
      fontWeight: 'bold' as const,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      whiteSpace: 'nowrap' as const,
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#0a101d',
        color: '#fff',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* High-definition Clear Shop Background Image Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${PIRATE_SHOP_BG})`,
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 1,
          filter: 'brightness(1.15) contrast(1.06)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Panoramic Store Header Banner (Translucent & Compact to Reveal Monster Face & Crown) */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          background: 'linear-gradient(180deg, rgba(2, 6, 18, 0.88) 0%, rgba(2, 6, 18, 0.45) 85%, transparent 100%)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderBottom: '1.5px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          direction: 'ltr',
          flexShrink: 0,
        }}
      >
        {/* Left Side: Circular Golden Close Button + Toggle Eye Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('harbor')}
            title="إغلاق المتجر"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #2a1a0a 0%, #0d0603 100%)',
              border: '2px solid #eab308',
              boxShadow: '0 0 10px rgba(234, 179, 8, 0.5), inset 0 0 6px rgba(234, 179, 8, 0.4), 0 4px 10px rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fde047',
              fontSize: '16px',
              fontWeight: '900',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(250, 204, 21, 0.7)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(234, 179, 8, 0.5), inset 0 0 6px rgba(234, 179, 8, 0.4), 0 4px 10px rgba(0,0,0,0.85)';
            }}
          >
            ✕
          </button>

          {/* Toggle Eye Button to Hide/Show Cards & View Full Monster Art */}
          <button
            onClick={() => setHideCards(prev => !prev)}
            title={hideCards ? "إظهار البطاقات والقوائم" : "إخفاء البطاقات لرؤية وحش الأعماق بالكامل"}
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '20px',
              background: hideCards
                ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)'
                : 'rgba(15, 23, 42, 0.85)',
              border: hideCards ? '2px solid #38bdf8' : '2px solid rgba(234, 179, 8, 0.75)',
              boxShadow: hideCards ? '0 0 14px rgba(56, 189, 248, 0.85)' : '0 2px 10px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: hideCards ? '#ffffff' : '#fde047',
              fontSize: '13px',
              fontWeight: '900',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{hideCards ? '👁️ إظهار البطاقات' : '👁️ إخفاء البطاقات'}</span>
          </button>
        </div>

        {/* Center: Majestic 3D Title "متجر الأعماق" */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            flex: 1,
            padding: '0 6px',
            direction: 'rtl',
          }}
        >
          {/* Crown with Trident Tips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '16px',
              filter: 'drop-shadow(0 2px 8px rgba(250, 204, 21, 0.9))',
              marginBottom: '-4px',
            }}
          >
            <span style={{ fontSize: '11px', color: '#fde047' }}>🔱</span>
            <span>👑</span>
            <span style={{ fontSize: '11px', color: '#fde047' }}>🔱</span>
          </div>

          {/* 3D Metallic Title Text */}
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(18px, 3.6vw, 24px)',
              fontWeight: '900',
              fontFamily: 'Cairo, sans-serif',
              background: 'linear-gradient(180deg, #ffffff 0%, #e0f2fe 30%, #7dd3fc 65%, #0369a1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 0px #022044) drop-shadow(0 4px 8px rgba(0,0,0,0.95)) drop-shadow(0 0 18px rgba(56, 189, 248, 0.85))',
              letterSpacing: '0.5px',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
            }}
          >
            متجر الأعماق
          </h1>

          {/* Slogan Subtitle */}
          <div
            style={{
              fontSize: 'clamp(8.5px, 2vw, 10.5px)',
              fontWeight: 'bold',
              color: '#bae6fd',
              textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 0 8px rgba(56, 189, 248, 0.7)',
              whiteSpace: 'nowrap',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            ادعم مغامرتك واحصل على أفضل العوائد
          </div>
        </div>

        {/* Right Side: Currency Badges (Gems and Gold) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            alignItems: 'flex-end',
            flexShrink: 0,
            direction: 'ltr',
          }}
        >
          {/* Gems Pill */}
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(6, 18, 36, 0.94) 0%, rgba(2, 8, 18, 0.98) 100%)',
              border: '1.5px solid #d4af37',
              borderRadius: '8px',
              padding: '3px 9px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)',
            }}
          >
            <span style={{ fontSize: '15px', filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.8))' }}>💎</span>
            <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.3px', fontFamily: 'Cairo, sans-serif' }}>
              {gems.toLocaleString()}
            </span>
          </div>

          {/* Gold Pill with '+' recharge button */}
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(6, 18, 36, 0.94) 0%, rgba(2, 8, 18, 0.98) 100%)',
              border: '1.5px solid #d4af37',
              borderRadius: '8px',
              padding: '3px 6px 3px 9px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)',
            }}
          >
            <img
              src={GOLD_COIN_ICON}
              alt="ذهب"
              style={{ width: '18px', height: '18px', objectFit: 'contain', filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))' }}
            />
            <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.3px', fontFamily: 'Cairo, sans-serif' }}>
              {gold.toLocaleString()}
            </span>
            <button
              onClick={() => setShopSubTab('recharge')}
              title="شحن العملات"
              style={{
                background: 'linear-gradient(180deg, #ca8a04 0%, #854d0e 100%)',
                border: '1px solid #fde047',
                borderRadius: '5px',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Horizontal Tabs (Matches exact video order: حمايه | أسلحه | طواقم | سفن | VIP | خلفيات | إطارات | شحن) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(20, 10, 4, 0.72)',
          borderBottom: '1.5px solid rgba(133, 77, 14, 0.45)',
          padding: '6px 10px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          justifyContent: 'flex-start',
          alignItems: 'center',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        {[
          { key: 'defense', label: 'حمايه', activeColor: '#a855f7' },
          { key: 'hamour', label: 'أسلحه', activeColor: '#f97316' },
          { key: 'crew_services', label: 'طواقم', activeColor: '#10b981' },
          { key: 'vip', label: 'VIP', activeColor: '#eab308' },
          { key: 'backgrounds', label: 'خلفيات', activeColor: '#10b981' },
          { key: 'recharge', label: 'شحن', activeColor: '#ef4444' },
        ].map(tab => {
          const isActive = shopSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setShopSubTab(tab.key as any);
                if (hideCards) setHideCards(false);
              }}
              style={{
                background: isActive
                  ? `linear-gradient(180deg, ${tab.activeColor} 0%, #76122d 100%)`
                  : 'rgba(45, 6, 18, 0.75)',
                color: isActive ? '#fff' : '#fda4af',
                border: isActive ? '2px solid #fff' : '1px solid rgba(124, 18, 50, 0.6)',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '14.5px',
                fontWeight: '900',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 0 12px ${tab.activeColor}e0` : 'none',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Container View Area */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          paddingBottom: '110px',
          background: 'transparent',
        }}
      >
        {/* Full View Mode Notification (When user clicks Hide Cards) */}
        {hideCards ? (
          <div
            style={{
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: '40px',
              textAlign: 'center',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                background: 'rgba(3, 10, 24, 0.82)',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '16px',
                padding: '14px 22px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.3)',
                maxWidth: '380px',
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔱 👑 🔱</div>
              <div style={{ fontSize: '15px', fontWeight: '900', color: '#e0f2fe', marginBottom: '4px' }}>
                وحش وسيد الأعماق الأسطوري
              </div>
              <div style={{ fontSize: '11.5px', color: '#93c5fd', marginBottom: '12px' }}>
                تم إخفاء جميع البطاقات لتستمتع برؤية الخلفية والوحش بكامل تفاصيلها.
              </div>
              <button
                onClick={() => setHideCards(false)}
                style={{
                  background: 'linear-gradient(180deg, #eab308 0%, #ca8a04 100%)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontSize: '12px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 179, 8, 0.5)',
                }}
              >
                👁️ إظهار البطاقات والمتجر الآن
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Monster, Crown, and 'ملوك الأعماق' Title Clearance Window (100% completely unobstructed) */}
            <div
              style={{
                height: 'clamp(490px, 59vh, 660px)',
                width: '100%',
                pointerEvents: 'none',
              }}
            />
        {/* ==================== 1. TAB: حمايه (Protection) ==================== */}
        {shopSubTab === 'defense' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(30, 27, 75, 0.82), rgba(49, 16, 63, 0.82))',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(168, 85, 247, 0.65)',
                borderRadius: '12px',
                padding: '10px 16px',
                marginBottom: '16px',
                color: '#e9d5ff',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.3)',
              }}
            >
              Protection – دروع الحماية والمضادات الساحلية
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { key: 'shield_4h', title: 'درع لمدة 4 ساعات', price: 60, costType: 'gems', desc: 'حماية 4 ساعات', icon: '🛡️' },
                { key: 'shield_1d', title: 'درع لمدة يوم', price: 280, costType: 'gems', desc: 'حماية 24 ساعة', icon: '🛡️' },
                { key: 'shield_2d', title: 'درع لمدة يومين', price: 550, costType: 'gems', desc: 'حماية 48 ساعة', icon: '🛡️' },
              ].map(item => (
                <div
                  key={item.key}
                  style={{
                    background: 'linear-gradient(to bottom, rgba(24, 9, 43, 0.76), rgba(12, 4, 23, 0.85))',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(168, 85, 247, 0.6)',
                    borderRadius: '14px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                  }}
                >
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(24, 9, 43, 0.6) 100%)',
                      border: '1.5px solid #c084fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '44px',
                      margin: '6px 0 10px 0',
                      boxShadow: '0 0 14px rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e9d5ff', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#c084fc', marginBottom: '12px', flex: 1 }}>{item.desc}</div>

                  <button
                    onClick={() => {
                      if (handlePurchase) {
                        handlePurchase({
                          category: 'shield',
                          itemId: item.key,
                          itemName: item.title,
                          costType: 'gems',
                          price: item.price
                        });
                      } else if (buyItem) {
                        buyItem({
                          category: 'shield',
                          itemId: item.key,
                          itemName: item.title,
                          costType: 'gems',
                          price: item.price
                        });
                      } else {
                        if (gems >= item.price) {
                          setGems(prev => prev - item.price);
                          if (setShieldInventory) {
                            setShieldInventory(prev => {
                              const next = { ...prev, [item.key]: (prev[item.key] || 0) + 1 };
                              try { localStorage.setItem('pirate_shield_inventory', JSON.stringify(next)); } catch (e) {}
                              return next;
                            });
                          }
                          alert(`🛡️ تم شراء [${item.title}] وإضافته للمخزن بنجاح!`);
                        } else {
                          alert(`❌ الجواهر غير كافية! تحتاج إلى ${item.price} 💎 جوهرة.`);
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(to bottom, #a855f7, #7e22ce)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 0',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    💎 {item.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 2. TAB: أسلحه (Weapons) ==================== */}
        {shopSubTab === 'hamour' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(69, 26, 3, 0.82), rgba(41, 10, 0, 0.82))',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(249, 115, 22, 0.65)',
                borderRadius: '12px',
                padding: '10px 16px',
                marginBottom: '16px',
                color: '#ffedd5',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
              }}
            >
              Weapons – ترسانة الصواريخ والقنابل المدمرة
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {WEAPONS_DATA.map(item => {
                const currentQty = weapons[item.key] || weapons[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'linear-gradient(to bottom, rgba(42, 15, 5, 0.88), rgba(20, 6, 2, 0.94))',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1.5px solid rgba(249, 115, 22, 0.65)',
                      borderRadius: '14px',
                      padding: '14px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                      position: 'relative',
                    }}
                  >
                    {/* Quantity Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: currentQty > 0 ? '#16a34a' : 'rgba(239, 68, 68, 0.3)',
                        color: currentQty > 0 ? '#ffffff' : '#fca5a5',
                        border: currentQty > 0 ? '1px solid #4ade80' : '1px solid #ef4444',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '1px 6px',
                      }}
                    >
                      {currentQty > 0 ? `${currentQty}x` : '0'}
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '96px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '4px 0 8px 0',
                        background: item.bgImage
                          ? `url(${item.bgImage}) center/cover no-repeat`
                          : 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(20, 6, 2, 0.5) 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(249, 115, 22, 0.3)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {item.bgImage && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${item.bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'brightness(0.9)',
                            zIndex: 1,
                          }}
                        />
                      )}
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          referrerPolicy="no-referrer" 
                          style={{ 
                            position: 'relative', 
                            zIndex: 2, 
                            maxHeight: '82px', 
                            maxWidth: '82px', 
                            objectFit: 'contain', 
                            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.8))' 
                          }} 
                        />
                      ) : (
                        <span style={{ position: 'relative', zIndex: 2, fontSize: '46px' }}>{item.icon}</span>
                      )}
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fdba74', marginBottom: '4px' }}>
                      {item.name}
                    </div>

                    {/* Damage Badge */}
                    <div 
                      style={{
                        fontSize: '12px',
                        color: '#fef08a',
                        fontWeight: 'bold',
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.4)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        marginBottom: '8px'
                      }}
                    >
                      ⚔️ الضرر: {item.damage.toLocaleString()}
                    </div>

                    <button
                      onClick={() => {
                        if (handlePurchase) {
                          handlePurchase({
                            category: 'weapon',
                            itemId: item.key,
                            itemName: item.name,
                            costType: item.costType === 'gold' ? 'gold' : 'blueGems',
                            price: item.price
                          });
                        } else if (buyWeaponItem) {
                          buyWeaponItem(item.key, item.costType === 'gold' ? 'gold' : 'blueGems', item.price);
                        }
                      }}
                      style={{
                        width: '100%',
                        background: item.costType === 'gold' 
                          ? 'linear-gradient(to bottom, #d97706, #b45309)'
                          : 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
                        color: '#fff',
                        border: item.costType === 'gold' ? '1px solid #fef08a' : '1px solid #93c5fd',
                        borderRadius: '10px',
                        padding: '8px 0',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                      }}
                    >
                      {item.costType === 'gold' ? `🪙 ${item.price.toLocaleString()} ذهب` : `💎 ${item.price} جوهرة`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== 3. TAB: طواقم (Ship Crew) ==================== */}
        {shopSubTab === 'crew_services' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(90deg, #022c22, #011711)',
                border: '1.5px solid #10b981',
                borderRadius: '12px',
                padding: '10px 16px',
                marginBottom: '16px',
                color: '#a7f3d0',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.3)',
              }}
            >
              Ship Crew – طاقم السفينة والخبراء البحريين
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', padding: '10px 0' }}>
              {CREW_SHOP_ITEMS.map(item => {
                const normId = item.id === 'police' ? 'cop' 
                  : item.id === 'sailors' ? 'sailor' 
                  : item.id === 'gold_fisher' ? 'golden_hunter' 
                  : (item.id === 'repairer_small' || item.id === 'smallRepair') ? 'fixer_sm'
                  : (item.id === 'repairer_medium' || item.id === 'mediumRepair') ? 'fixer_md'
                  : (item.id === 'repairer_large' || item.id === 'largeRepair') ? 'fixer_lg'
                  : (item.id === 'repairer_legendary' || item.id === 'legendaryRepair') ? 'fixer_epic'
                  : item.id;
                const assignedShip = ships.find(s => (s.assignedCrew || []).includes(normId) || (s.assignedCrew || []).includes(item.id));
                const isAssigned = !!assignedShip;

                return (
                <div
                  key={item.id}
                  style={{
                    width: '280px',
                    height: '400px',
                    minWidth: '280px',
                    maxWidth: '280px',
                    borderRadius: '16px',
                    border: isAssigned ? '2.5px solid #22c55e' : '2px solid rgba(234, 179, 8, 0.75)',
                    boxShadow: isAssigned ? '0 0 18px rgba(34, 197, 94, 0.4)' : '0 12px 30px rgba(0,0,0,0.65), 0 0 16px rgba(234, 179, 8, 0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#0a1020',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                >
                  {/* Card Background Layer */}
                  {(item as any).bgImage ? (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                      <img
                        src={(item as any).bgImage}
                        alt="خلفية"
                        referrerPolicy="no-referrer"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          filter: 'brightness(0.92) contrast(1.05)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(5, 10, 25, 0.4) 100%)',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at 50% 35%, rgba(37, 99, 235, 0.55) 0%, rgba(17, 43, 105, 0.75) 50%, rgba(10, 22, 52, 0.95) 90%)',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Character Spotlight Aura */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '220px',
                      height: '220px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(250, 204, 21, 0.28) 0%, rgba(56, 189, 248, 0.18) 55%, transparent 75%)',
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Character Person Cutout Layer */}
                  {item.image ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '280px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 3,
                        padding: '24px 8px 0px 8px',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        style={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'contain',
                          transform: 'scale(1.12)',
                          transformOrigin: 'bottom center',
                          filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.9)) drop-shadow(0 0 12px rgba(250, 204, 21, 0.45)) contrast(1.08) brightness(1.06)',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        top: '20px',
                        left: 0,
                        right: 0,
                        height: '240px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '92px',
                        filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.85))',
                        zIndex: 3,
                      }}
                    >
                      {item.icon}
                    </div>
                  )}

                  {/* Top Vignette Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '60px',
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      left: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(10, 15, 30, 0.85)',
                        color: '#fde047',
                        border: '1px solid rgba(250, 204, 21, 0.5)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '3px 8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>طاقم بحري</span>
                    </div>

                    <div
                      style={{
                        background: isAssigned
                          ? 'rgba(22, 163, 74, 0.95)'
                          : item.costType === 'gold'
                            ? 'rgba(234, 179, 8, 0.95)'
                            : 'rgba(56, 189, 248, 0.95)',
                        color: isAssigned ? '#ffffff' : item.costType === 'gold' ? '#000000' : '#ffffff',
                        border: isAssigned
                          ? '1px solid #4ade80'
                          : item.costType === 'gold'
                            ? '1px solid #fef08a'
                            : '1px solid #7dd3fc',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 'bold',
                        padding: '3px 10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      {isAssigned ? (
                        <span>✔️ مُعيّن على {assignedShip?.name || 'السفينة'}</span>
                      ) : (
                        <>
                          <span>{item.costType === 'gold' ? '🪙' : '💎'}</span>
                          <span>{item.costType === 'gold' ? item.price.toLocaleString() : item.price}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bottom Semi-Transparent Text & Controls Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(6, 10, 22, 0.98) 0%, rgba(6, 10, 22, 0.9) 70%, rgba(6, 10, 22, 0.4) 92%, rgba(6, 10, 22, 0) 100%)',
                      backdropFilter: 'blur(8px)',
                      padding: '14px 14px 12px 14px',
                      borderTop: '1px solid rgba(250, 204, 21, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'right',
                      direction: 'rtl',
                      zIndex: 10,
                    }}
                  >
                    {/* Title */}
                    <div
                      style={{
                        fontSize: '17px',
                        fontWeight: '900',
                        color: '#facc15',
                        marginBottom: '4px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{item.title}</span>
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    </div>

                    {/* Description */}
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: '#e2e8f0',
                        lineHeight: '1.4',
                        marginBottom: '6px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        minHeight: '32px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.desc}
                    </div>

                    {/* Stars and rarity */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        marginBottom: '8px',
                        background: 'rgba(0, 0, 0, 0.65)',
                        border: '1px solid rgba(234, 179, 8, 0.35)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', fontSize: '12px' }}>
                        <span>⭐</span>
                        <span>⭐</span>
                        <span>⭐</span>
                        <span>⭐</span>
                        <span>⭐</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span>💎</span>
                          <span>نادر</span>
                        </span>
                        <span style={{ color: '#fbbf24' }}>⚓</span>
                      </div>
                    </div>

                    {/* Buy or Assigned Button */}
                    {isAssigned ? (
                      <div
                        style={{
                          width: '100%',
                          background: 'rgba(22, 163, 74, 0.3)',
                          color: '#4ade80',
                          border: '1px solid #16a34a',
                          borderRadius: '8px',
                          padding: '8px 0',
                          fontSize: '13px',
                          fontWeight: '900',
                          boxShadow: '0 0 12px rgba(34, 197, 94, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>✔️</span>
                        <span>مُعيّن على {assignedShip?.name || 'السفينة'}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (handlePurchase) {
                            handlePurchase({
                              category: 'crew',
                              itemId: item.id,
                              itemName: item.title,
                              costType: item.costType === 'gold' ? 'gold' : 'gems',
                              price: item.price
                            });
                          } else if (buyCrewService) {
                            buyCrewService(item.id, item.title, item.price);
                          }
                        }}
                        style={{
                          width: '100%',
                          background: item.costType === 'gold' 
                            ? 'linear-gradient(to bottom, #f59e0b, #d97706)' 
                            : 'linear-gradient(to bottom, #0284c7, #0369a1)',
                          color: '#fff',
                          border: item.costType === 'gold' ? '1px solid #fde68a' : '1px solid #bae6fd',
                          borderRadius: '8px',
                          padding: '8px 0',
                          fontSize: '13px',
                          fontWeight: '900',
                          cursor: 'pointer',
                          boxShadow: item.costType === 'gold' ? '0 4px 12px rgba(245, 158, 11, 0.4)' : '0 4px 12px rgba(2, 132, 199, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span>توظيف وتعيين</span>
                        <span>|</span>
                        <span>{item.costType === 'gold' ? `🪙 ${item.price.toLocaleString()}` : `💎 ${item.price}`}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}

        {/* ==================== 4. TAB: VIP (Elite VIP) ==================== */}
        {shopSubTab === 'vip' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(76, 5, 25, 0.82) 0%, rgba(30, 0, 8, 0.86) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(244, 63, 94, 0.7)',
                borderRadius: '16px',
                padding: '18px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(244, 63, 94, 0.35)',
                marginBottom: '18px',
              }}
            >
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '6px' }}>👑</span>
              <h3 style={{ margin: '6px 0', fontSize: '18px', fontWeight: 'bold', color: '#f43f5e' }}>
                Elite VIP – مجلس الملوك الأسطوري
              </h3>
              <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#fda4af' }}>
                افتح مزايا كبار الشخصيات للحصول على صيد مضاعف وحصانة ملكية!
              </p>

              <button
                onClick={claimVipReward}
                style={{
                  background: 'linear-gradient(180deg, #f43f5e 0%, #be123c 100%)',
                  color: '#fff',
                  border: '1.5px solid #ffe4e6',
                  borderRadius: '10px',
                  padding: '9px 20px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(244,63,94,0.4)',
                }}
              >
                🎁 المطالبة بالهدية اليومية لـ VIP
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { rank: 'ELITE VIP 1', name: 'المرسواة البرونزية', price: 81.94, days: 50 },
                { rank: 'ELITE VIP 2', name: 'الدرع الذهبي', price: 125.06, days: 120 },
                { rank: 'ELITE VIP 3', name: 'التاج الذهبي', price: 211.31, days: 250 },
                { rank: 'ELITE VIP 4', name: 'السفينة الملكية', price: 340.69, days: 450 },
                { rank: 'ELITE VIP 5', name: 'التنين الأسطوري', price: 426.94, days: 800 },
              ].map(vip => (
                <div
                  key={vip.rank}
                  style={{
                    background: 'linear-gradient(to bottom, rgba(31, 8, 18, 0.78), rgba(13, 3, 7, 0.85))',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(244, 63, 94, 0.6)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 'bold' }}>{vip.rank}</span>
                    <h4 style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#fef08a', fontWeight: 'bold' }}>
                      {vip.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#fda4af' }}>مفعل لمدة {vip.days} يوماً</span>
                  </div>

                  <button
                    onClick={() => handlePay({ title: `${vip.rank} - ${vip.name}`, price: vip.price, givesGems: 10000 })}
                    style={{
                      background: 'linear-gradient(to bottom, #eab308, #ca8a04)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {vip.price} ر.س
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 6. TAB: خلفيات (Backgrounds) ==================== */}
        {shopSubTab === 'backgrounds' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(6, 78, 59, 0.82), rgba(2, 44, 34, 0.82))',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(16, 185, 129, 0.65)',
                borderRadius: '12px',
                padding: '10px 16px',
                marginBottom: '16px',
                color: '#a7f3d0',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              }}
            >
              Backgrounds – خلفيات الميناء والمشاهد البحرية
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {BACKGROUND_ITEMS.map(bg => (
                <div
                  key={bg.id}
                  style={{
                    background: 'linear-gradient(to bottom, rgba(6, 35, 28, 0.76), rgba(3, 20, 16, 0.85))',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: bgTheme === bg.id ? '2px solid #facc15' : '1.5px solid rgba(16, 185, 129, 0.6)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '36px', margin: '8px 0' }}>🖼️</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#6ee7b7', marginBottom: '6px' }}>
                    {bg.title}
                  </div>

                  <button
                    onClick={() => buyBackground(bg)}
                    style={{
                      width: '100%',
                      background: bgTheme === bg.id
                        ? 'linear-gradient(to bottom, #eab308, #ca8a04)'
                        : 'linear-gradient(to bottom, #10b981, #047857)',
                      color: bgTheme === bg.id ? '#000' : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 0',
                      fontSize: '11.5px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {bgTheme === bg.id ? 'مجهزة الآن ✓' : bg.isFree ? 'تجهيز مجاني' : `🪙 ${bg.priceGold.toLocaleString()}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 6. TAB: شحن (Recharge) ==================== */}
        {shopSubTab === 'recharge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Top Ocean Notice Header Banner */}
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(8, 26, 48, 0.95) 0%, rgba(3, 12, 24, 0.98) 50%, rgba(8, 26, 48, 0.95) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(56, 189, 248, 0.12)',
              }}
            >
              <span style={{ fontSize: '15px', color: '#38bdf8', opacity: 0.85 }}>⚓</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                  fontWeight: 'bold',
                  color: '#e0f2fe',
                  textAlign: 'center',
                  flex: 1,
                  justifyContent: 'center',
                  lineHeight: '1.4',
                }}
              >
                <span style={{ color: '#facc15', fontSize: '13px' }}>⚠️</span>
                <span>جميع المبالغ بالريال السعودي، يتم إضافة الجواهر إلى حسابك مباشرة بعد إتمام الدفع.</span>
              </div>
              <span style={{ fontSize: '15px', color: '#38bdf8', opacity: 0.85 }}>⚓</span>
            </div>

            {/* Quick Restore & Warning Bar */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'stretch',
              }}
            >
              <div
                onClick={() => alert('🔄 جاري فحص عمليات الشراء عبر شبكة مدى... تم استعادة ومزامنة كافة باقاتك ورصيدك بنجاح!')}
                style={{
                  flex: '0 0 auto',
                  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#38bdf8',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>🔄 استرجاع المشتريات</span>
              </div>

              <div
                style={{
                  flex: 1,
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: '#fca5a5',
                  fontSize: '10.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  lineHeight: '1.3',
                }}
              >
                ⚠️ جميع المشتريات نهائية – الجواهر رقمية وتسلم فورياً.
              </div>
            </div>

            {/* Packages Vertical List - Exactly matching user reference */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '2px' }}>
              {filteredRecharge.map(pkg => (
                <div
                  key={pkg.id}
                  style={{
                    position: 'relative',
                    direction: 'ltr',
                    background: 'linear-gradient(90deg, rgba(8, 22, 38, 0.96) 0%, rgba(3, 10, 20, 0.98) 50%, rgba(8, 22, 38, 0.96) 100%)',
                    border: `1.5px solid ${pkg.theme.cardBorder}`,
                    borderRadius: '12px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    boxShadow: `0 4px 16px rgba(0,0,0,0.85), inset 0 0 12px ${pkg.theme.innerGlow}`,
                    overflow: 'hidden',
                  }}
                >
                  {/* Diagonal Ribbon for Top Seller if present */}
                  {pkg.ribbon && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '-32px',
                        transform: 'rotate(-45deg)',
                        background: 'linear-gradient(90deg, #9333ea, #7e22ce)',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: '900',
                        padding: '2px 32px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
                        border: '1px solid #c084fc',
                        zIndex: 5,
                        letterSpacing: '0.3px',
                      }}
                    >
                      {pkg.ribbon}
                    </div>
                  )}

                  {/* Far Left Column: 3D Artwork Image Container */}
                  <div
                    style={{
                      position: 'relative',
                      width: '72px',
                      height: '60px',
                      borderRadius: '10px',
                      background: 'radial-gradient(circle, rgba(14, 38, 66, 0.95) 0%, rgba(3, 12, 24, 0.98) 100%)',
                      border: '1.5px solid rgba(56, 189, 248, 0.5)',
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9), 0 0 12px rgba(56, 189, 248, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      referrerPolicy="no-referrer"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(1.05) contrast(1.1)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, transparent 65%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Mid-Left Column: Base Amount */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '70px',
                      direction: 'rtl',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: '900',
                        color: '#ffffff',
                        fontFamily: 'Cairo, sans-serif',
                        lineHeight: 1.1,
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.4)',
                      }}
                    >
                      {pkg.baseGems.toLocaleString()}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        color: '#38bdf8',
                        fontWeight: 'bold',
                      }}
                    >
                      <span>جوهرة</span>
                      <span style={{ fontSize: '11px' }}>💎</span>
                    </div>
                  </div>

                  {/* Filigree Divider */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.35,
                      color: '#d4af37',
                      fontSize: '9px',
                    }}
                  >
                    <span>◆</span>
                  </div>

                  {/* Center Column: Bonus Gifts */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '92px',
                      direction: 'rtl',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '900',
                        color: '#facc15',
                        fontFamily: 'Cairo, sans-serif',
                        lineHeight: 1.2,
                        textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(250, 204, 21, 0.45)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + {pkg.bonusGems.toLocaleString()} جوهرة
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '10.5px',
                        color: '#fef08a',
                        fontWeight: 'bold',
                      }}
                    >
                      <span>هدية مجانية</span>
                      <span style={{ fontSize: '10.5px' }}>🎁</span>
                    </div>
                  </div>

                  {/* Filigree Divider */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.35,
                      color: '#d4af37',
                      fontSize: '9px',
                    }}
                  >
                    <span>◆</span>
                  </div>

                  {/* Far Right Column: Price Box with % Free Pill Tag & Gradient Button */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      minWidth: '95px',
                      flexShrink: 0,
                      direction: 'rtl',
                    }}
                  >
                    {/* Free Percentage Pill Tag */}
                    <div
                      style={{
                        background: pkg.theme.tagBg,
                        border: `1px solid ${pkg.theme.tagBorder}`,
                        borderRadius: '12px',
                        padding: '1px 8px',
                        fontSize: '10px',
                        fontWeight: '900',
                        color: pkg.theme.tagText,
                        boxShadow: `0 0 8px ${pkg.theme.innerGlow}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>+{pkg.freePercent}% مجاناً</span>
                    </div>

                    {/* Price Action Button */}
                    <button
                      onClick={() => handlePay(pkg)}
                      style={{
                        width: '100%',
                        background: pkg.theme.btnGrad,
                        border: `1.5px solid ${pkg.theme.btnBorder}`,
                        borderRadius: '8px',
                        padding: '5px 10px',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '900',
                        fontFamily: 'Cairo, sans-serif',
                        cursor: 'pointer',
                        boxShadow: pkg.theme.btnShadow,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <span>{pkg.price} ر.س</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Trust & Feature Bar - matching reference */}
            <div
              style={{
                marginTop: '10px',
                direction: 'ltr',
                background: 'linear-gradient(90deg, rgba(8, 26, 48, 0.95) 0%, rgba(3, 12, 24, 0.98) 50%, rgba(8, 26, 48, 0.95) 100%)',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(56, 189, 248, 0.1)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', direction: 'rtl' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold', color: '#e0f2fe' }}>
                  <span>🛡️</span>
                  <span>دفع آمن</span>
                </div>
                <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' }}>100%</span>
              </div>

              <div style={{ width: '1px', height: '22px', background: 'rgba(56, 189, 248, 0.25)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', direction: 'rtl' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold', color: '#e0f2fe' }}>
                  <span>⚡</span>
                  <span>إضافة فورية</span>
                </div>
                <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' }}>للجواهر</span>
              </div>

              <div style={{ width: '1px', height: '22px', background: 'rgba(56, 189, 248, 0.25)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', direction: 'rtl' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold', color: '#e0f2fe' }}>
                  <span>📦</span>
                  <span>أفضل العروض</span>
                </div>
                <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' }}>والباقات</span>
              </div>

              <div style={{ width: '1px', height: '22px', background: 'rgba(56, 189, 248, 0.25)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', direction: 'rtl' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold', color: '#e0f2fe' }}>
                  <span>🎧</span>
                  <span>دعم فني</span>
                </div>
                <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' }}>24/7</span>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Payment Modal */}
      {payingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#150902',
              border: '3px solid #ca8a04',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              padding: '20px',
              color: '#fff',
            }}
          >
            {paymentStep === 'details' && (
              <div>
                <h3 style={{ margin: '0 0 14px 0', color: '#fbbf24', fontSize: '16px', textAlign: 'center' }}>
                  💳 بوابة الدفع الآمنة (مدى / فيزا)
                </h3>

                <div
                  style={{
                    background: '#2c1505',
                    border: '1px solid #78350f',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '14px',
                    fontSize: '12.5px',
                  }}
                >
                  <div>الباقة: {payingItem.title}</div>
                  <strong style={{ color: '#10b981', display: 'block', marginTop: '4px', fontSize: '14px' }}>
                    المبلغ: {payingItem.price} ر.س
                  </strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', color: '#e5be9e' }}>رقم البطاقة:</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#070301',
                        border: '1px solid #4a2d18',
                        borderRadius: '6px',
                        padding: '8px',
                        color: '#fff',
                        direction: 'ltr',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '3px', color: '#e5be9e' }}>اسم حامل البطاقة:</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#070301',
                        border: '1px solid #4a2d18',
                        borderRadius: '6px',
                        padding: '8px',
                        color: '#fff',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <button
                    onClick={handleConfirmPay}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    إتمام الشحن الآمن 🔒
                  </button>
                  <button
                    onClick={() => setPayingItem(null)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'loading' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <strong style={{ fontSize: '14px', color: '#fbbf24' }}>جاري معالجة الشحن آمن عبر مدى...</strong>
              </div>
            )}

            {paymentStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>🎉</span>
                <strong style={{ fontSize: '16px', color: '#10b981', display: 'block', marginBottom: '8px' }}>
                  تمت عملية الشحن بنجاح!
                </strong>
                <button
                  onClick={() => setPayingItem(null)}
                  style={{
                    background: '#f59e0b',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '12px',
                  }}
                >
                  استلام الرصيد والعودة 🚢
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
