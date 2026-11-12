import React, { useState, useEffect } from 'react';
import { GOLD_COIN_ICON, WAREHOUSE_BG, WEAPON_SMALL_MISSILE_ICON, WEAPON_MEDIUM_MISSILE_ICON, WEAPON_LARGE_MISSILE_ICON, WEAPON_MEDIA_BOMB_ICON, WEAPON_ATOMIC_BOMB_ICON, SHIP_GUARDIAN_ICON, SHIP_GUARDIAN_BG, FIXER_SMALL_ICON, FIXER_SMALL_BG, FIXER_MEDIUM_ICON, FIXER_MEDIUM_BG, FIXER_LARGE_ICON, FIXER_LARGE_BG, FIXER_LEGENDARY_ICON, FIXER_LEGENDARY_BG, SAILOR_ICON, SAILOR_BG, GOLDEN_HUNTER_ICON, GOLDEN_HUNTER_BG, MARKET_EXPERT_ICON, MARKET_EXPERT_BG, LUCK_PIRATE_ICON, LUCK_PIRATE_BG, SHIP_PILOT_ICON, SHIP_PILOT_BG, SHIP_THIEF_ICON, SHIP_THIEF_BG, WEAPONS_DATA, CREW_SHOP_ITEMS } from '../data';

interface InventoryComponentProps {
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  gems: number;
  setGems: React.Dispatch<React.SetStateAction<number>>;
  weapons: Record<string, number>;
  setWeapons: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  crewServices: Record<string, boolean>;
  setCrewServices: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
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
  onClose?: () => void;
}

export interface PokedexFish {
  id: string;
  name: string;
  scientificName: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'royal';
  rarityLabel: string;
  rarityColor: string;
  bgGradient: string;
  priceGold: number;
  priceGems?: number;
  minLevel: number;
  habitat: string;
  emoji: string;
  description: string;
  expBonus: number;
  defaultCaughtCount: number;
  isDiscovered: boolean;
}

const INITIAL_POKEDEX_CATALOG: PokedexFish[] = [
  {
    id: 'sardine',
    name: 'سردين الفضة',
    scientificName: 'Sardina pilchardus',
    rarity: 'common',
    rarityLabel: 'شائع',
    rarityColor: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    priceGold: 50,
    minLevel: 1,
    habitat: 'الشواطئ الضحلة والقريبة',
    emoji: '🐟',
    description: 'أسماك صغيرة فضية تعيش في أسراب ضخمة قرب السواحل، تشكل القوت الأساسي للصيادين المبتدئين.',
    expBonus: 10,
    defaultCaughtCount: 34,
    isDiscovered: true,
  },
  {
    id: 'anchovy',
    name: 'أنشوجة الشاطئ',
    scientificName: 'Engraulidae',
    rarity: 'common',
    rarityLabel: 'شائع',
    rarityColor: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    priceGold: 80,
    minLevel: 1,
    habitat: 'خليج القراصنة المفتوح',
    emoji: '🐟',
    description: 'أسماك دقيقة ناعمة تكثر في المياه الدافئة، تتميز برائحة جذابة للأسماك الأكبر حجماً.',
    expBonus: 15,
    defaultCaughtCount: 22,
    isDiscovered: true,
  },
  {
    id: 'herring',
    name: 'رنجة البحار',
    scientificName: 'Clupea harengus',
    rarity: 'common',
    rarityLabel: 'شائع',
    rarityColor: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    priceGold: 150,
    minLevel: 2,
    habitat: 'المياه القريبة والإنارة البحرية',
    emoji: '🐟',
    description: 'سمكة برونزية متوهجة تحت أشعة الشمس، يفضلها الطهاة في الموانئ الساحلية.',
    expBonus: 25,
    defaultCaughtCount: 18,
    isDiscovered: true,
  },
  {
    id: 'mullet',
    name: 'بوري الرمال الذهبية',
    scientificName: 'Mugil cephalus',
    rarity: 'common',
    rarityLabel: 'شائع',
    rarityColor: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    priceGold: 300,
    minLevel: 3,
    habitat: 'السواحل المشمسة والمرافئ',
    emoji: '🐟',
    description: 'سمكة قوية وقشرية تقفز فوق الماء عند اكتمال القمر، ذات قيمة تجارية جيدة للأسواق.',
    expBonus: 40,
    defaultCaughtCount: 15,
    isDiscovered: true,
  },
  {
    id: 'shrimp',
    name: 'روبيان المرجان الأحمر',
    scientificName: 'Penaeus monodon',
    rarity: 'common',
    rarityLabel: 'شائع',
    rarityColor: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #1e293b, #0f172a)',
    priceGold: 500,
    minLevel: 4,
    habitat: 'الشعاب المرجانية الساحلية',
    emoji: '🦐',
    description: 'مخلوق قشري ذو مجسات طوال ولون أحمر قانٍ، يتغذى عليه أغلب كائنات المحيط.',
    expBonus: 60,
    defaultCaughtCount: 19,
    isDiscovered: true,
  },
  {
    id: 'crab',
    name: 'سلطعون المخلب الفولاذي',
    scientificName: 'Brachyura Titanus',
    rarity: 'uncommon',
    rarityLabel: 'غير شائع',
    rarityColor: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)',
    priceGold: 1000,
    minLevel: 5,
    habitat: 'قاع الصخور والمغارات البحرية',
    emoji: '🦀',
    description: 'سلطعون قوي مع درع قشري يضاهي الصلابة الفولاذية، يتطلب شباك صيد قوية لرفعه.',
    expBonus: 100,
    defaultCaughtCount: 11,
    isDiscovered: true,
  },
  {
    id: 'mackerel',
    name: 'ماكريل المحيط الأزرق',
    scientificName: 'Scomber scombrus',
    rarity: 'uncommon',
    rarityLabel: 'غير شائع',
    rarityColor: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)',
    priceGold: 2200,
    minLevel: 6,
    habitat: 'تيارات المحيط المفتوح',
    emoji: '🐟',
    description: 'سمكة سريعة للغاية بخطوط مموجة داكنة على ظهرها، تسبح في التيارات القوية.',
    expBonus: 180,
    defaultCaughtCount: 9,
    isDiscovered: true,
  },
  {
    id: 'bass',
    name: 'قاروص الممرات المائية',
    scientificName: 'Dicentrarchus labrax',
    rarity: 'uncommon',
    rarityLabel: 'غير شائع',
    rarityColor: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, #0c4a6e, #0369a1)',
    priceGold: 4500,
    minLevel: 7,
    habitat: 'الممرات المائية العميقة',
    emoji: '🐟',
    description: 'سمك مفترس حذر وصعب الصيد، يتطلب خطاف صيد متين وصبراً من البحار.',
    expBonus: 300,
    defaultCaughtCount: 7,
    isDiscovered: true,
  },
  {
    id: 'salmon',
    name: 'سلمون الشلالات الوردي',
    scientificName: 'Oncorhynchus nerka',
    rarity: 'rare',
    rarityLabel: 'نادر',
    rarityColor: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #581c87, #3b0764)',
    priceGold: 9500,
    minLevel: 8,
    habitat: 'الأنهار ومناصب المصبات العميقة',
    emoji: '🐟',
    description: 'سباح ماهر يسبح ضد التيار المقاوم، لحمه وردي مشبع وقيمته الوفيرة تغري التجار.',
    expBonus: 500,
    defaultCaughtCount: 6,
    isDiscovered: true,
  },
  {
    id: 'snapper',
    name: 'نهاش الشعاب المرجانية',
    scientificName: 'Lutjanus campechanus',
    rarity: 'rare',
    rarityLabel: 'نادر',
    rarityColor: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #581c87, #3b0764)',
    priceGold: 18000,
    minLevel: 9,
    habitat: 'الشعاب المرجانية العميقة',
    emoji: '🐠',
    description: 'سمكة حمراء زاهية تعيش بين شقوق الكهوف البحرية، تمتاز بأنياب حادة.',
    expBonus: 850,
    defaultCaughtCount: 4,
    isDiscovered: true,
  },
  {
    id: 'squid',
    name: 'حبار الظلام المضيء',
    scientificName: 'Vampyroteuthis infernalis',
    rarity: 'rare',
    rarityLabel: 'نادر',
    rarityColor: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #581c87, #3b0764)',
    priceGold: 35000,
    minLevel: 10,
    habitat: 'الهاوية المظلمة',
    emoji: '🦑',
    description: 'حبار يبعث إشارات ضوئية فسفورية في أعمق طبقات المحيط للتخفي والجذب.',
    expBonus: 1400,
    defaultCaughtCount: 3,
    isDiscovered: true,
  },
  {
    id: 'cod',
    name: 'سمك القَـدّ الملكي',
    scientificName: 'Gadus morhua',
    rarity: 'rare',
    rarityLabel: 'نادر',
    rarityColor: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #581c87, #3b0764)',
    priceGold: 70000,
    minLevel: 12,
    habitat: 'البحار الشمالية الجليدية',
    emoji: '🐟',
    description: 'سمكة ضخمة تتأقلم مع أشد مياه المحيط برودة، تحتوي على زيت بحري نفيض.',
    expBonus: 2200,
    defaultCaughtCount: 2,
    isDiscovered: true,
  },
  {
    id: 'hamour',
    name: 'الهامور الأسطوري الفاخر',
    scientificName: 'Epinephelus marginatus',
    rarity: 'epic',
    rarityLabel: 'نادر جداً',
    rarityColor: '#f97316',
    bgGradient: 'linear-gradient(135deg, #7c2d12, #431407)',
    priceGold: 150000,
    minLevel: 14,
    habitat: 'خليج الملوك والشعاب الكبرى',
    emoji: '🐠',
    description: 'سيد الشعاب المرجانية، سمكة عملاقة تتطلب محركات وسفن قوية لسحبها من الأعماق.',
    expBonus: 4000,
    defaultCaughtCount: 2,
    isDiscovered: true,
  },
  {
    id: 'tuna',
    name: 'التونة الملكية الذهبية',
    scientificName: 'Thunnus thynnus',
    rarity: 'epic',
    rarityLabel: 'نادر جداً',
    rarityColor: '#f97316',
    bgGradient: 'linear-gradient(135deg, #7c2d12, #431407)',
    priceGold: 320000,
    minLevel: 16,
    habitat: 'المحيط المفتوح العاصف',
    emoji: '🐟',
    description: 'عملاق القوة والسرعة في المحيط المفتوح، وزنها يتجاوز المئات ويشتريها الأمراء بأغلى الأسعار.',
    expBonus: 7500,
    defaultCaughtCount: 1,
    isDiscovered: true,
  },
  {
    id: 'sailfish',
    name: 'أبو شراع البرق السريع',
    scientificName: 'Istiophorus platypterus',
    rarity: 'epic',
    rarityLabel: 'ملحمي',
    rarityColor: '#f97316',
    bgGradient: 'linear-gradient(135deg, #7c2d12, #431407)',
    priceGold: 750000,
    minLevel: 18,
    habitat: 'العواصف المدارية المفتوحة',
    emoji: '🗡️',
    description: 'أسرع كائن بحري على وجه الأرض، رمح زعانفه يمزق الشباك العادية بسهولة.',
    expBonus: 12000,
    defaultCaughtCount: 1,
    isDiscovered: true,
  },
  {
    id: 'dragonfish',
    name: 'سمك التنين البركاني',
    scientificName: 'Stomiidae Vulcano',
    rarity: 'epic',
    rarityLabel: 'ملحمي',
    rarityColor: '#f97316',
    bgGradient: 'linear-gradient(135deg, #7c2d12, #431407)',
    priceGold: 1800000,
    minLevel: 20,
    habitat: 'الفوهات البراكينية البحرية',
    emoji: '🐉',
    description: 'سمكة نادرة تعيش قرب الحمم الحرارية الباردة لقاع المحيط، حرارتاها تشع نواراً.',
    expBonus: 25000,
    defaultCaughtCount: 1,
    isDiscovered: true,
  },
  {
    id: 'white_shark',
    name: 'القرش الأبيض المفترس',
    scientificName: 'Carcharodon carcharias',
    rarity: 'epic',
    rarityLabel: 'ملحمي',
    rarityColor: '#f97316',
    bgGradient: 'linear-gradient(135deg, #7c2d12, #431407)',
    priceGold: 4000000,
    minLevel: 22,
    habitat: 'خندق الموت والمحيطات السحيقة',
    emoji: '🦈',
    description: 'ملك الافتراس في المياه المفتوحة، حضوره يثير رعب السفن ومجرد اصطياده إنجاز أسطوري.',
    expBonus: 50000,
    defaultCaughtCount: 1,
    isDiscovered: true,
  },
  {
    id: 'lantern_fish',
    name: 'سمكة الفانوس الكونية',
    scientificName: 'Anomalopidae Cosmicus',
    rarity: 'legendary',
    rarityLabel: 'أسطوري',
    rarityColor: '#facc15',
    bgGradient: 'linear-gradient(135deg, #713f12, #361a04)',
    priceGold: 10000000,
    priceGems: 25,
    minLevel: 25,
    habitat: 'الهاوية الكونية المظلمة',
    emoji: '🏮',
    description: 'سمكة غريبة تملك فانوساً ضوئياً يحتوي على طاقة المجرّة، تُجذب بواسطة السفن الأسطورية الفخمة.',
    expBonus: 100000,
    defaultCaughtCount: 0,
    isDiscovered: false,
  },
  {
    id: 'kraken',
    name: 'أخطبوط الكراكن الأسطوري',
    scientificName: 'Architeuthis Titanus',
    rarity: 'legendary',
    rarityLabel: 'أسطوري',
    rarityColor: '#facc15',
    bgGradient: 'linear-gradient(135deg, #713f12, #361a04)',
    priceGold: 25000000,
    priceGems: 50,
    minLevel: 28,
    habitat: 'مثلث برمودا وبحر الظلمات',
    emoji: '🐙',
    description: 'وحش الميثولوجيا القديمة، يبتلع السفن بأكملها بمجرد تحريك مجساته الضخمة في الأعماق.',
    expBonus: 250000,
    defaultCaughtCount: 0,
    isDiscovered: false,
  },
  {
    id: 'megalodon',
    name: 'قرش الميجالودون الخارق',
    scientificName: 'Otodus megalodon',
    rarity: 'legendary',
    rarityLabel: 'أسطوري',
    rarityColor: '#facc15',
    bgGradient: 'linear-gradient(135deg, #713f12, #361a04)',
    priceGold: 60000000,
    priceGems: 100,
    minLevel: 30,
    habitat: 'قاع التاريخ والغواصات الحربية',
    emoji: '🦈',
    description: 'أكبر مفترس عرفه التاريخ، أنيابه بحجم الإنسان الكامل وحراشفه تكسر الفولاذ.',
    expBonus: 500000,
    defaultCaughtCount: 0,
    isDiscovered: false,
  },
  {
    id: 'killer_orca',
    name: 'الأوركا المدمرة',
    scientificName: 'Orcinus orca Rex',
    rarity: 'legendary',
    rarityLabel: 'أسطوري',
    rarityColor: '#facc15',
    bgGradient: 'linear-gradient(135deg, #713f12, #361a04)',
    priceGold: 120000000,
    priceGems: 150,
    minLevel: 31,
    habitat: 'المحيط المتجمد الأقصى',
    emoji: '🐋',
    description: 'حوت الموت المحارب، يتنقل في مجموعات ذكية جداً ويدمر السفن التجارية الضخمة.',
    expBonus: 1000000,
    defaultCaughtCount: 0,
    isDiscovered: false,
  },
  {
    id: 'blue_whale',
    name: 'الحوت الأزرق العملاق',
    scientificName: 'Balaenoptera musculus',
    rarity: 'mythic',
    rarityLabel: 'أسطورة',
    rarityColor: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #831843, #500724)',
    priceGold: 300000000,
    priceGems: 300,
    minLevel: 32,
    habitat: 'مركز قلب المحيط الكوني',
    emoji: '🐋',
    description: 'أضخم المخلوقات الحية في الكون، ضربة واحدة من ذيله تحرك الأمواج العاتية كالإعصار.',
    expBonus: 2500000,
    defaultCaughtCount: 0,
    isDiscovered: false,
  },
  {
    id: 'moby_dick',
    name: 'الحوت الأبيض الأسطوري',
    scientificName: 'Physeter macrocephalus Blanc',
    rarity: 'mythic',
    rarityLabel: 'أسطورة',
    rarityColor: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #831843, #500724)',
    priceGold: 650000000,
    priceGems: 600,
    minLevel: 33,
    habitat: 'بحر الأساطير المفقودة',
    emoji: '🐋',
    description: 'الحوت الأبيض الذي تسبب في تحطم مئات أساطيل القراصنة، حلمه الوحيد الصمود في الأعماق.',
    expBonus: 5000000,
    defaultCaughtCount: 0,
    isDiscovered: false,
  },
  {
    id: 'mermaid',
    name: 'حورية البحر الفردوسية',
    scientificName: 'Sirena Celeste',
    rarity: 'royal',
    rarityLabel: 'أسطورة خيالية',
    rarityColor: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, #881337, #4c0519)',
    priceGold: 1200000000,
    priceGems: 1200,
    minLevel: 34,
    habitat: 'جزيرة الأحلام والزمرد',
    emoji: '🧜‍♀️',
    description: 'كائن أسطوري خارق ذو صوت ساحر يمنح البحار الذي يكتشفه ثروة ملكية لا تنتهي وصوتاً للبحار.',
    expBonus: 10000000,
    defaultCaughtCount: 0,
    isDiscovered: false,
  },
  {
    id: 'abyssal_dragon',
    name: 'تنين المحيط السحيق',
    scientificName: 'Draco Abyssalis',
    rarity: 'royal',
    rarityLabel: 'ملكي خيالي',
    rarityColor: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, #881337, #4c0519)',
    priceGold: 3000000000,
    priceGems: 3000,
    minLevel: 35,
    habitat: 'نقطة الهاوية القصوى - المستوى 35',
    emoji: '🐲',
    description: 'أعظم واندر كائنات الأعماق السحيقة، تنين الأسطورة الذي يحرس الهاوية النهائية للمحيط.',
    expBonus: 25000000,
    defaultCaughtCount: 0,
    isDiscovered: false,
  },
];

export default function InventoryComponent({
  gold,
  setGold,
  gems,
  setGems,
  weapons,
  setWeapons,
  crewServices,
  setCrewServices,
  crewInventory: propCrewInventory,
  setCrewInventory: propSetCrewInventory,
  shieldInventory: propShieldInventory,
  setShieldInventory: propSetShieldInventory,
  handlePurchase,
  onClose,
}: InventoryComponentProps) {
  const [activeTab, setActiveTab] = useState<'crew' | 'weapons' | 'shields' | 'items'>('crew');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local inventory quantities fallback for crew buffs & shields
  const [localCrewInventory, setLocalCrewInventory] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('pirate_crew_inventory');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      guide: 1,
      luck: 1,
      sailor: 0,
      thief: 1,
      cop: 1,
      merchant: 0,
      fixer_sm: 0,
      fixer_md: 0,
      fixer_lg: 0,
      fixer_epic: 0,
      market_expert: 1,
      gold_fisher: 1,
    };
  });

  const [localShieldInventory, setLocalShieldInventory] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('pirate_shield_inventory');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      shield_4h: 1,
      shield_1d: 0,
      shield_2d: 0,
      anti_nuke: 0,
      anti_emp: 0,
      disable_anti_range: 0,
      disable_anti_core: 0,
    };
  });

  const crewInventory = propCrewInventory || localCrewInventory;
  const setCrewInventory = propSetCrewInventory || setLocalCrewInventory;

  const shieldInventory = propShieldInventory || localShieldInventory;
  const setShieldInventory = propSetShieldInventory || setLocalShieldInventory;

  const [invWeaponBuyMultipliers, setInvWeaponBuyMultipliers] = useState<Record<string, number>>({});
  const [globalInvWeaponMultiplier, setGlobalInvWeaponMultiplier] = useState<number>(1);
  const [invCrewBuyMultipliers, setInvCrewBuyMultipliers] = useState<Record<string, number>>({});
  const [globalInvCrewMultiplier, setGlobalInvCrewMultiplier] = useState<number>(1);

  // Pokedex / Discovery Log state
  const [pokedexData, setPokedexData] = useState<PokedexFish[]>(() => {
    try {
      const saved = localStorage.getItem('aamaaq_pokedex_collection');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_POKEDEX_CATALOG;
  });

  // Save to localStorage when pokedexData updates
  useEffect(() => {
    try {
      localStorage.setItem('aamaaq_pokedex_collection', JSON.stringify(pokedexData));
    } catch (e) {
      console.error(e);
    }
  }, [pokedexData]);

  // Pokedex filter & search
  const [pokedexFilter, setPokedexFilter] = useState<'all' | 'discovered' | 'undiscovered' | 'common' | 'rare' | 'legendary'>('all');
  const [pokedexSearch, setPokedexSearch] = useState('');
  const [selectedFishModal, setSelectedFishModal] = useState<PokedexFish | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const useCrewItem = (id: string, name: string) => {
    const qty = crewInventory[id] || (id === 'cop' ? crewInventory.police : 0) || (id === 'sailor' ? crewInventory.sailors : 0) || (id === 'gold_fisher' ? crewInventory.golden_hunter : 0) || (id === 'golden_hunter' ? crewInventory.gold_fisher : 0) || 0;
    if (qty <= 0) {
      showToast(`⚠️ لا تمتلك [${name}]! يمكن شراؤه من المتجر.`);
      return;
    }
    setCrewInventory(prev => {
      const next = {
        ...prev,
        [id]: Math.max(0, (prev[id] || 0) - 1),
        ...(id === 'cop' ? { police: Math.max(0, (prev.police || prev.cop || 0) - 1) } : {}),
        ...(id === 'police' ? { cop: Math.max(0, (prev.cop || prev.police || 0) - 1) } : {}),
        ...(id === 'sailor' ? { sailors: Math.max(0, (prev.sailors || prev.sailor || 0) - 1) } : {}),
        ...(id === 'sailors' ? { sailor: Math.max(0, (prev.sailor || prev.sailors || 0) - 1) } : {}),
        ...(id === 'gold_fisher' ? { golden_hunter: Math.max(0, (prev.golden_hunter || prev.gold_fisher || 0) - 1) } : {}),
        ...(id === 'golden_hunter' ? { gold_fisher: Math.max(0, (prev.gold_fisher || prev.golden_hunter || 0) - 1) } : {})
      };
      localStorage.setItem('pirate_crew_inventory', JSON.stringify(next));
      return next;
    });

    setCrewServices(prev => {
      const next = {
        ...prev,
        [id]: true,
        ...(id === 'cop' ? { police: true } : {}),
        ...(id === 'police' ? { cop: true } : {}),
        ...(id === 'sailor' ? { sailors: true } : {}),
        ...(id === 'sailors' ? { sailor: true } : {}),
        ...(id === 'gold_fisher' ? { golden_hunter: true } : {}),
        ...(id === 'golden_hunter' ? { gold_fisher: true } : {})
      };
      localStorage.setItem('pirate_crew_services', JSON.stringify(next));
      return next;
    });
    showToast(`✅ تم استخدام [${name}] بنجاح وتفعيل خصائصه في أسطولك!`);
  };

  const buyOrUseWeapon = async (id: string, name: string, price: number, costType: 'gold' | 'gems' = 'gold') => {
    const currentQty = weapons[id] || (id === 'adBomb' ? weapons.emp_bomb : 0) || (id === 'emp_bomb' ? weapons.adBomb : 0) || (id === 'atomicBomb' ? weapons.nuke_bomb : 0) || (id === 'nuke_bomb' ? weapons.atomicBomb : 0) || (id === 'smallRocket' ? weapons.small_missile : 0) || (id === 'small_missile' ? weapons.smallRocket : 0) || (id === 'mediumRocket' ? weapons.medium_missile : 0) || (id === 'medium_missile' ? weapons.mediumRocket : 0) || (id === 'largeRocket' ? weapons.large_missile : 0) || (id === 'large_missile' ? weapons.largeRocket : 0) || 0;
    if (currentQty > 0) {
      setWeapons(prev => {
        const next = {
          ...prev,
          [id]: Math.max(0, (prev[id] || 0) - 1),
          ...(id === 'adBomb' ? { emp_bomb: Math.max(0, (prev.emp_bomb || prev.adBomb || 0) - 1) } : {}),
          ...(id === 'emp_bomb' ? { adBomb: Math.max(0, (prev.adBomb || prev.emp_bomb || 0) - 1) } : {}),
          ...(id === 'atomicBomb' ? { nuke_bomb: Math.max(0, (prev.nuke_bomb || prev.atomicBomb || 0) - 1) } : {}),
          ...(id === 'nuke_bomb' ? { atomicBomb: Math.max(0, (prev.atomicBomb || prev.nuke_bomb || 0) - 1) } : {}),
          ...(id === 'smallRocket' ? { small_missile: Math.max(0, (prev.small_missile || prev.smallRocket || 0) - 1) } : {}),
          ...(id === 'small_missile' ? { smallRocket: Math.max(0, (prev.smallRocket || prev.small_missile || 0) - 1) } : {}),
          ...(id === 'mediumRocket' ? { medium_missile: Math.max(0, (prev.medium_missile || prev.mediumRocket || 0) - 1) } : {}),
          ...(id === 'medium_missile' ? { mediumRocket: Math.max(0, (prev.mediumRocket || prev.medium_missile || 0) - 1) } : {}),
          ...(id === 'largeRocket' ? { large_missile: Math.max(0, (prev.large_missile || prev.largeRocket || 0) - 1) } : {}),
          ...(id === 'large_missile' ? { largeRocket: Math.max(0, (prev.largeRocket || prev.large_missile || 0) - 1) } : {})
        };
        localStorage.setItem('pirate_weapons', JSON.stringify(next));
        return next;
      });
      showToast(`🚀 تم إطلاق [${name}] على الأهداف بنجاح!`);
    } else {
      if (handlePurchase) {
        await handlePurchase({
          category: 'weapon',
          itemId: id,
          itemName: name,
          costType: costType === 'gold' ? 'gold' : 'gems',
          price
        });
      } else {
        if (costType === 'gems') {
          if (gems >= price) {
            setGems(prev => prev - price);
            setWeapons(prev => {
              const next = {
                ...prev,
                [id]: (prev[id] || 0) + 1,
                ...(id === 'adBomb' ? { emp_bomb: (prev.emp_bomb || 0) + 1 } : {}),
                ...(id === 'atomicBomb' ? { nuke_bomb: (prev.nuke_bomb || 0) + 1 } : {}),
                ...(id === 'smallRocket' ? { small_missile: (prev.small_missile || 0) + 1 } : {}),
                ...(id === 'mediumRocket' ? { medium_missile: (prev.medium_missile || 0) + 1 } : {}),
                ...(id === 'largeRocket' ? { large_missile: (prev.large_missile || 0) + 1 } : {})
              };
              localStorage.setItem('pirate_weapons', JSON.stringify(next));
              return next;
            });
            showToast(`💎 تم شراء [${name}] بمبلغ ${price} جوهرة!`);
          } else {
            showToast(`❌ الجواهر غير كافية! تحتاج إلى ${price} 💎 جوهرة.`);
          }
        } else {
          if (gold >= price) {
            setGold(prev => prev - price);
            setWeapons(prev => {
              const next = {
                ...prev,
                [id]: (prev[id] || 0) + 1,
                ...(id === 'adBomb' ? { emp_bomb: (prev.emp_bomb || 0) + 1 } : {}),
                ...(id === 'atomicBomb' ? { nuke_bomb: (prev.nuke_bomb || 0) + 1 } : {}),
                ...(id === 'smallRocket' ? { small_missile: (prev.small_missile || 0) + 1 } : {}),
                ...(id === 'mediumRocket' ? { medium_missile: (prev.medium_missile || 0) + 1 } : {}),
                ...(id === 'largeRocket' ? { large_missile: (prev.large_missile || 0) + 1 } : {})
              };
              localStorage.setItem('pirate_weapons', JSON.stringify(next));
              return next;
            });
            showToast(`🪙 تم شراء [${name}] بمبلغ ${price.toLocaleString()} ذهب!`);
          } else {
            showToast(`❌ الذهب غير كافٍ! تحتاج إلى ${price.toLocaleString()} 🪙 ذهب.`);
          }
        }
      }
    }
  };

  const buyWeaponDirectly = async (id: string, name: string, unitPrice: number, costType: 'gold' | 'gems', quantity: number = 1) => {
    const totalPrice = unitPrice * quantity;
    if (handlePurchase) {
      await handlePurchase({
        category: 'weapon',
        itemId: id,
        itemName: name,
        costType: costType === 'gold' ? 'gold' : 'gems',
        price: totalPrice,
        quantity
      });
    } else {
      if (costType === 'gems') {
        if (gems >= totalPrice) {
          setGems(prev => prev - totalPrice);
          setWeapons(prev => {
            const next = {
              ...prev,
              [id]: (prev[id] || 0) + quantity,
              ...(id === 'adBomb' ? { emp_bomb: (prev.emp_bomb || 0) + quantity } : {}),
              ...(id === 'atomicBomb' ? { nuke_bomb: (prev.nuke_bomb || 0) + quantity } : {}),
              ...(id === 'smallRocket' ? { small_missile: (prev.small_missile || 0) + quantity } : {}),
              ...(id === 'mediumRocket' ? { medium_missile: (prev.medium_missile || 0) + quantity } : {}),
              ...(id === 'largeRocket' ? { large_missile: (prev.large_missile || 0) + quantity } : {})
            };
            localStorage.setItem('pirate_weapons', JSON.stringify(next));
            return next;
          });
          showToast(`💎 تم شراء (${quantity}x) من [${name}] بمبلغ ${totalPrice} جوهرة!`);
        } else {
          showToast(`❌ الجواهر غير كافية! تحتاج إلى ${totalPrice} 💎 جوهرة.`);
        }
      } else {
        if (gold >= totalPrice) {
          setGold(prev => prev - totalPrice);
          setWeapons(prev => {
            const next = {
              ...prev,
              [id]: (prev[id] || 0) + quantity,
              ...(id === 'adBomb' ? { emp_bomb: (prev.emp_bomb || 0) + quantity } : {}),
              ...(id === 'atomicBomb' ? { nuke_bomb: (prev.nuke_bomb || 0) + quantity } : {}),
              ...(id === 'smallRocket' ? { small_missile: (prev.small_missile || 0) + quantity } : {}),
              ...(id === 'mediumRocket' ? { medium_missile: (prev.medium_missile || 0) + quantity } : {}),
              ...(id === 'largeRocket' ? { large_missile: (prev.large_missile || 0) + quantity } : {})
            };
            localStorage.setItem('pirate_weapons', JSON.stringify(next));
            return next;
          });
          showToast(`🪙 تم شراء (${quantity}x) من [${name}] بمبلغ ${totalPrice.toLocaleString()} ذهب!`);
        } else {
          showToast(`❌ الذهب غير كافٍ! تحتاج إلى ${totalPrice.toLocaleString()} 🪙 ذهب.`);
        }
      }
    }
  };

  const buyCrewDirectly = async (id: string, name: string, unitPrice: number, costType: 'gold' | 'gems', quantity: number = 1) => {
    const totalPrice = unitPrice * quantity;
    if (handlePurchase) {
      await handlePurchase({
        category: 'crew',
        itemId: id,
        itemName: name,
        costType: costType === 'gold' ? 'gold' : 'gems',
        price: totalPrice,
        quantity
      });
    } else {
      if (costType === 'gems') {
        if (gems >= totalPrice) {
          setGems(prev => prev - totalPrice);
          setCrewInventory(prev => {
            const next = {
              ...prev,
              [id]: (prev[id] || 0) + quantity
            };
            localStorage.setItem('pirate_crew_inventory', JSON.stringify(next));
            return next;
          });
          showToast(`💎 تم شراء وتوظيف (${quantity}x) من [${name}] بمبلغ ${totalPrice} جوهرة!`);
        } else {
          showToast(`❌ الجواهر غير كافية! تحتاج إلى ${totalPrice} 💎 جوهرة.`);
        }
      } else {
        if (gold >= totalPrice) {
          setGold(prev => prev - totalPrice);
          setCrewInventory(prev => {
            const next = {
              ...prev,
              [id]: (prev[id] || 0) + quantity
            };
            localStorage.setItem('pirate_crew_inventory', JSON.stringify(next));
            return next;
          });
          showToast(`🪙 تم شراء وتوظيف (${quantity}x) من [${name}] بمبلغ ${totalPrice.toLocaleString()} ذهب!`);
        } else {
          showToast(`❌ الذهب غير كافٍ! تحتاج إلى ${totalPrice.toLocaleString()} 🪙 ذهب.`);
        }
      }
    }
  };

  const useShield = (id: string, name: string) => {
    const qty = shieldInventory[id] || 0;
    if (qty <= 0) {
      showToast(`⚠️ لا تمتلك [${name}]! يمكنك شراؤه من متجر الحصون.`);
      return;
    }
    setShieldInventory(prev => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) };
      localStorage.setItem('pirate_shield_inventory', JSON.stringify(next));
      return next;
    });
    showToast(`🛡️ تم تفعيل درع الحماية [${name}] وتأمينه على مينائك!`);
  };

  // Toggle/Catch Fish in Pokedex
  const handleCatchFish = (fishId: string) => {
    setPokedexData(prev =>
      prev.map(fish => {
        if (fish.id === fishId) {
          const newCount = (fish.defaultCaughtCount || 0) + 1;
          return {
            ...fish,
            isDiscovered: true,
            defaultCaughtCount: newCount,
          };
        }
        return fish;
      })
    );

    const target = pokedexData.find(f => f.id === fishId);
    if (target) {
      showToast(`🎉 مبروك! تم تسجيل صيد جديدة لـ [${target.name}] في سجل المكتشفات (+${target.expBonus} خبرة)!`);
      if (selectedFishModal && selectedFishModal.id === fishId) {
        setSelectedFishModal(prev =>
          prev ? { ...prev, isDiscovered: true, defaultCaughtCount: (prev.defaultCaughtCount || 0) + 1 } : null
        );
      }
    }
  };

  // Stats for Pokedex
  const totalSpecies = pokedexData.length;
  const discoveredCount = pokedexData.filter(f => f.isDiscovered).length;
  const progressPercent = Math.round((discoveredCount / totalSpecies) * 100);
  const totalValueDiscoveredGold = pokedexData
    .filter(f => f.isDiscovered)
    .reduce((sum, f) => sum + f.priceGold * (f.defaultCaughtCount || 1), 0);

  // Filtered list
  const filteredPokedex = pokedexData.filter(fish => {
    // Category filter
    if (pokedexFilter === 'discovered' && !fish.isDiscovered) return false;
    if (pokedexFilter === 'undiscovered' && fish.isDiscovered) return false;
    if (pokedexFilter === 'common' && fish.rarity !== 'common' && fish.rarity !== 'uncommon') return false;
    if (pokedexFilter === 'rare' && fish.rarity !== 'rare' && fish.rarity !== 'epic') return false;
    if (pokedexFilter === 'legendary' && fish.rarity !== 'legendary' && fish.rarity !== 'mythic' && fish.rarity !== 'royal') return false;

    // Search query
    if (pokedexSearch.trim() !== '') {
      const q = pokedexSearch.toLowerCase().trim();
      const matchName = fish.name.toLowerCase().includes(q);
      const matchHabitat = fish.habitat.toLowerCase().includes(q);
      const matchRarity = fish.rarityLabel.toLowerCase().includes(q);
      return matchName || matchHabitat || matchRarity;
    }

    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#060b18',
        color: '#f8fafc',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* High-definition Warehouse Background Image Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${WAREHOUSE_BG})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 1,
          filter: 'brightness(1.06) contrast(1.03)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Toast notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
            border: '2px solid #facc15',
            boxShadow: '0 10px 30px rgba(0,0,0,0.9), 0 0 15px rgba(250, 204, 21, 0.4)',
            borderRadius: '10px',
            padding: '10px 22px',
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#fef08a',
            textAlign: 'center',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(9, 14, 26, 0.92))',
          borderBottom: '2px solid rgba(234, 179, 8, 0.4)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ca8a04, #854d0e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              boxShadow: '0 2px 12px rgba(234, 179, 8, 0.4)',
              border: '1.5px solid #fef08a',
            }}
          >
            📦
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#facc15', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
              المخزن
            </h2>
            <div style={{ fontSize: '15px', color: '#93c5fd', marginTop: '2px', fontWeight: 'bold' }}>
              - العوالم والمعدات والأسلحة وسجل المكتشفات -
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1.5px solid #ef4444',
              color: '#fca5a5',
              borderRadius: '10px',
              padding: '8px 18px',
              fontWeight: '900',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            إغلاق ✖
          </button>
        )}
      </div>

      {/* Top Filter Tabs Bar (طواقم | أسلحة | دروع | سجل المكتشفات) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(9, 18, 42, 0.95)',
          borderBottom: '2px solid rgba(234, 179, 8, 0.3)',
          padding: '12px 14px',
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          justifyContent: 'space-around',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          onClick={() => setActiveTab('crew')}
          style={{
            flex: 1,
            minWidth: '110px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: activeTab === 'crew' ? '2px solid #facc15' : '1.5px solid rgba(255,255,255,0.15)',
            background: activeTab === 'crew' ? 'linear-gradient(to bottom, #1d4ed8, #1e40af)' : '#0b193c',
            color: activeTab === 'crew' ? '#fef08a' : '#cbd5e1',
            fontWeight: '900',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: activeTab === 'crew' ? '0 0 16px rgba(250, 204, 21, 0.45)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          💡 طواقم
        </button>

        <button
          onClick={() => setActiveTab('weapons')}
          style={{
            flex: 1,
            minWidth: '110px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: activeTab === 'weapons' ? '2px solid #facc15' : '1.5px solid rgba(255,255,255,0.15)',
            background: activeTab === 'weapons' ? 'linear-gradient(to bottom, #1d4ed8, #1e40af)' : '#0b193c',
            color: activeTab === 'weapons' ? '#fef08a' : '#cbd5e1',
            fontWeight: '900',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: activeTab === 'weapons' ? '0 0 16px rgba(250, 204, 21, 0.45)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          🚀 أسلحة
        </button>

        <button
          onClick={() => setActiveTab('shields')}
          style={{
            flex: 1,
            minWidth: '110px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: activeTab === 'shields' ? '2px solid #facc15' : '1.5px solid rgba(255,255,255,0.15)',
            background: activeTab === 'shields' ? 'linear-gradient(to bottom, #1d4ed8, #1e40af)' : '#0b193c',
            color: activeTab === 'shields' ? '#fef08a' : '#cbd5e1',
            fontWeight: '900',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: activeTab === 'shields' ? '0 0 16px rgba(250, 204, 21, 0.45)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          🛡️ دروع
        </button>

        <button
          onClick={() => setActiveTab('items')}
          style={{
            flex: 1,
            minWidth: '130px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: activeTab === 'items' ? '2px solid #38bdf8' : '1.5px solid rgba(255,255,255,0.15)',
            background: activeTab === 'items' ? 'linear-gradient(to bottom, #0284c7, #0369a1)' : '#0b193c',
            color: activeTab === 'items' ? '#ffffff' : '#7dd3fc',
            fontWeight: '900',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: activeTab === 'items' ? '0 0 16px rgba(56, 189, 248, 0.45)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          🐟 سجل المكتشفات
        </button>
      </div>

      {/* Main Tab Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          flex: 1,
          overflowY: 'auto',
          padding: '14px',
          paddingBottom: '100px',
          background: 'transparent',
        }}
      >
        {/* ==================== TAB 1: طواقم ==================== */}
        {activeTab === 'crew' && (
          <div>
            {/* GLOBAL CREW MULTIPLIER & CUSTOM INPUT BANNER IN INVENTORY */}
            <div
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #1e1b4b, #312e81, #1e1b4b)',
                border: '2px solid #818cf8',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.65)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#e0e7ff', letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                👥 طاقم السفينة والخبراء البحريين (تحديد كمية الاستخدام والشراء 3 أو 4 أو أي عدد)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '15px', color: '#c7d2fe', fontWeight: 'bold' }}>⚡ كمية التحديد لأفراد الطاقم:</span>
                {[1, 3, 4, 5, 10].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setGlobalInvCrewMultiplier(m);
                      const updated: Record<string, number> = {};
                      ['guide', 'luck', 'sailor', 'thief', 'cop', 'fixer_sm', 'fixer_md', 'fixer_lg', 'fixer_epic', 'market_expert', 'gold_fisher'].forEach(k => { updated[k] = m; });
                      setInvCrewBuyMultipliers(updated);
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      border: globalInvCrewMultiplier === m ? '2px solid #fde047' : '1px solid rgba(255,255,255,0.25)',
                      background: globalInvCrewMultiplier === m ? 'linear-gradient(to bottom, #4f46e5, #3730a3)' : 'rgba(0,0,0,0.55)',
                      color: globalInvCrewMultiplier === m ? '#ffffff' : '#c7d2fe',
                      boxShadow: globalInvCrewMultiplier === m ? '0 0 12px rgba(129, 140, 248, 0.7)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m}x
                  </button>
                ))}

                {/* خانة كمية مخصصة لأفراد الطاقم في المخزن */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.65)', padding: '4px 10px', borderRadius: '10px', border: '1.5px solid #818cf8' }}>
                  <span style={{ fontSize: '14px', color: '#c7d2fe', fontWeight: 'bold' }}>✏️ خانة كمية مخصصة:</span>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={globalInvCrewMultiplier}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const next = isNaN(val) || val < 1 ? 1 : val;
                      setGlobalInvCrewMultiplier(next);
                      const updated: Record<string, number> = {};
                      ['guide', 'luck', 'sailor', 'thief', 'cop', 'fixer_sm', 'fixer_md', 'fixer_lg', 'fixer_epic', 'market_expert', 'gold_fisher'].forEach(k => { updated[k] = next; });
                      setInvCrewBuyMultipliers(updated);
                    }}
                    style={{ width: '70px', height: '30px', background: '#0f172a', color: '#facc15', border: '1.5px solid #818cf8', borderRadius: '6px', textAlign: 'center', fontWeight: '900', fontSize: '16px' }}
                    title="اكتب أي كمية تريدها لأفراد الطاقم"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(430px, 1fr))', gap: '24px', justifyContent: 'center', padding: '10px 0' }}>
            {[
              {
                id: 'guide',
                title: 'مرشد السفن',
                desc: 'يكشف نوع الأسماك في الجولة الحالية ويضاعف نقاط الخبرة المكتسبة',
                icon: '🧭',
                image: SHIP_PILOT_ICON,
                bgImage: SHIP_PILOT_BG,
                qty: crewInventory['guide'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'luck',
                title: 'الحظ السعيد',
                desc: 'يضاعف نقاط الحظ المزدوج والفرص النادرة في كل عملية صيد بحرية',
                icon: '🍀',
                image: LUCK_PIRATE_ICON,
                bgImage: LUCK_PIRATE_BG,
                qty: crewInventory['luck'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'sailor',
                title: 'البحار المغامر',
                desc: 'يقوم بتقليص وقت رحلات الصيد السريعة بنسبة 50% فورا',
                icon: '⚓',
                image: SAILOR_ICON,
                bgImage: SAILOR_BG,
                qty: crewInventory['sailor'] || crewInventory['sailors'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'thief',
                title: 'حرامي السفن',
                desc: 'يرفع درجة سرقة السرعة والتسلل لغزو الموانئ بنسبة 80%',
                icon: '🥷',
                image: SHIP_THIEF_ICON,
                bgImage: SHIP_THIEF_BG,
                qty: crewInventory['thief'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'cop',
                title: 'حارس السفن',
                desc: 'يقبض على اللصوص ويحمي سفينتك ومرفأك من الغزو بنسبة 100%',
                icon: '👮‍♂️',
                image: SHIP_GUARDIAN_ICON,
                bgImage: SHIP_GUARDIAN_BG,
                qty: crewInventory['cop'] || crewInventory['police'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'fixer_sm',
                title: 'مصلح صغير',
                desc: 'يصلح ويزيد 500 نقطة طاقة وهيكل للسفينة مباشرة من الصفر',
                icon: '🛠️',
                image: FIXER_SMALL_ICON,
                bgImage: FIXER_SMALL_BG,
                qty: crewInventory['fixer_sm'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'fixer_md',
                title: 'مصلح وسط',
                desc: 'يصلح نصف طاقة السفينة (50%)، أو يعطي 1,000 نقطة مباشرة إذا كانت طاقة السفينة 0',
                icon: '🔨',
                image: FIXER_MEDIUM_ICON,
                bgImage: FIXER_MEDIUM_BG,
                qty: crewInventory['fixer_md'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'fixer_lg',
                title: 'مصلح كبير',
                desc: 'يصلح سفينة واحدة بالكامل 100% ويعيد كامل طاقتها وهيكلها مهما كان الضرر',
                icon: '⚙️',
                image: FIXER_LARGE_ICON,
                bgImage: FIXER_LARGE_BG,
                qty: crewInventory['fixer_lg'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'fixer_epic',
                title: 'مصلح أسطوري',
                desc: 'يصلح ويرفع كامل طاقة وهيكل جميع سفن الأسطول دفعة واحدة 100% بنقرة واحدة',
                icon: '👑',
                image: FIXER_LEGENDARY_ICON,
                bgImage: FIXER_LEGENDARY_BG,
                qty: crewInventory['fixer_epic'] || 0,
                btnText: 'استخدام',
              },
              {
                id: 'market_expert',
                title: 'خبير الأسواق',
                desc: 'يزيد أرباح بيع الأسماك والموارد في السوق بنسبة +25%',
                icon: '📈',
                image: MARKET_EXPERT_ICON,
                bgImage: MARKET_EXPERT_BG,
                qty: crewInventory['market_expert'] || 0,
                btnText: 'تفعيل',
              },
              {
                id: 'gold_fisher',
                title: 'الصياد الذهبي',
                desc: 'يحصل على صيد مضاعف بوقت قياسي لمدة 24 ساعة متواصلة',
                icon: '🪙',
                image: GOLDEN_HUNTER_ICON,
                bgImage: GOLDEN_HUNTER_BG,
                qty: crewInventory['gold_fisher'] || crewInventory['golden_hunter'] || 0,
                btnText: 'تفعيل',
              },
            ].map(item => {
              const spec = CREW_SHOP_ITEMS.find(c => c.id === item.id || (item.id === 'sailor' && c.id === 'sailors') || (item.id === 'cop' && c.id === 'police') || (item.id === 'gold_fisher' && c.id === 'golden_hunter'));
              const selectedCrewQty = invCrewBuyMultipliers[item.id] || globalInvCrewMultiplier || 1;
              const unitPrice = spec ? spec.price : 100000;
              const costType = (spec ? spec.costType : 'gold') as 'gold' | 'gems';
              const totalCost = unitPrice * selectedCrewQty;

              return (
              <div
                key={item.id}
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  minHeight: '580px',
                  borderRadius: '18px',
                  border: item.qty > 0 ? '3px solid #22c55e' : '2.5px solid rgba(234, 179, 8, 0.85)',
                  boxShadow: item.qty > 0 ? '0 0 22px rgba(34, 197, 94, 0.45)' : '0 12px 30px rgba(0,0,0,0.7), 0 0 18px rgba(234, 179, 8, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0a1020',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  margin: '0 auto',
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
                    width: '280px',
                    height: '280px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(250, 204, 21, 0.32) 0%, rgba(56, 189, 248, 0.2) 55%, transparent 75%)',
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
                      height: '310px',
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
                        filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.9)) drop-shadow(0 0 14px rgba(250, 204, 21, 0.5)) contrast(1.08) brightness(1.06)',
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
                      height: '260px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '110px',
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
                    height: '70px',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                />

                {/* Top Badges (ENLARGED QUANTITY BADGE & PRICE) */}
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
                  {/* ENLARGED QUANTITY BADGE */}
                  <div
                    style={{
                      background: item.qty > 0 ? 'linear-gradient(135deg, #15803d, #166534)' : 'rgba(239, 68, 68, 0.45)',
                      color: item.qty > 0 ? '#ffffff' : '#fca5a5',
                      border: item.qty > 0 ? '2.5px solid #4ade80' : '2px solid #ef4444',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '900',
                      padding: '5px 12px',
                      boxShadow: item.qty > 0 ? '0 0 14px rgba(74, 222, 128, 0.7)' : 'none',
                      letterSpacing: '0.5px',
                      textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                    }}
                  >
                    {item.qty > 0 ? `${item.qty}x متوفر` : '0x غير متوفر'}
                  </div>

                  {spec && (
                    <div
                      style={{
                        background: costType === 'gold' ? 'rgba(234, 179, 8, 0.95)' : 'rgba(56, 189, 248, 0.95)',
                        color: costType === 'gold' ? '#000000' : '#ffffff',
                        border: costType === 'gold' ? '2px solid #fef08a' : '2px solid #7dd3fc',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: '900',
                        padding: '5px 12px',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {costType === 'gold' ? `🪙 ${unitPrice.toLocaleString()}` : `💎 ${unitPrice}`}
                    </div>
                  )}
                </div>

                {/* Bottom Semi-Transparent Text & Controls Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(6, 10, 22, 0.99) 0%, rgba(6, 10, 22, 0.96) 85%, rgba(6, 10, 22, 0.6) 96%, rgba(6, 10, 22, 0) 100%)',
                    backdropFilter: 'blur(10px)',
                    padding: '14px 16px 12px 16px',
                    borderTop: '1.5px solid rgba(250, 204, 21, 0.35)',
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
                      fontSize: '22px',
                      fontWeight: '900',
                      color: '#facc15',
                      marginBottom: '4px',
                      textShadow: '0 2px 5px rgba(0,0,0,0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{item.title}</span>
                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  </div>

                  {/* Description */}
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#f1f5f9',
                      lineHeight: '1.45',
                      marginBottom: '6px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.95)',
                      minHeight: '44px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontWeight: '500'
                    }}
                  >
                    {item.desc}
                  </div>

                  {/* Stars, Diamond, Anchor */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 10px',
                      marginBottom: '8px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: '1.5px solid rgba(234, 179, 8, 0.4)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', fontSize: '15px' }}>
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                      <span style={{ color: '#38bdf8' }}>💎 نادر</span>
                      <span style={{ color: '#facc15' }}>⚓ طاقم</span>
                    </div>
                  </div>

                  {/* QUANTITY BOX & CONTROLS (خانة إضافة الكمية حسب رغبتك) */}
                  <div style={{ width: '100%', marginBottom: '8px', background: 'rgba(0,0,0,0.6)', padding: '7px 8px', borderRadius: '10px', border: '1.5px solid rgba(129, 140, 248, 0.5)' }}>
                    <div style={{ fontSize: '14px', color: '#c7d2fe', marginBottom: '5px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🔢 خانة تحديد الكمية:</span>
                      <span style={{ color: '#facc15', fontWeight: '900', fontSize: '16px' }}>{selectedCrewQty}x فرد</span>
                    </div>

                    {/* Stepper + Direct Input Field */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = Math.max(1, selectedCrewQty - 1);
                          setInvCrewBuyMultipliers(prev => ({ ...prev, [item.id]: next }));
                        }}
                        style={{
                          width: '36px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1.5px solid rgba(255,255,255,0.3)',
                          background: 'rgba(239, 68, 68, 0.6)',
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={selectedCrewQty}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const next = isNaN(val) || val < 1 ? 1 : val;
                          setInvCrewBuyMultipliers(prev => ({ ...prev, [item.id]: next }));
                        }}
                        style={{
                          width: '75px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '2px solid #818cf8',
                          background: '#090d16',
                          color: '#facc15',
                          textAlign: 'center',
                          fontSize: '17px',
                          fontWeight: '900',
                          padding: '0 4px'
                        }}
                        title="أدخل أي كمية تريدها"
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = selectedCrewQty + 1;
                          setInvCrewBuyMultipliers(prev => ({ ...prev, [item.id]: next }));
                        }}
                        style={{
                          width: '36px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1.5px solid rgba(255,255,255,0.3)',
                          background: 'rgba(34, 197, 94, 0.6)',
                          color: '#ffffff',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Presets: 1, 3, 4, 5, 10 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
                      {[1, 3, 4, 5, 10].map(multiplier => {
                        const isSelected = selectedCrewQty === multiplier;
                        return (
                          <button
                            key={multiplier}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInvCrewBuyMultipliers(prev => ({ ...prev, [item.id]: multiplier }));
                            }}
                            style={{
                              fontSize: '13px',
                              fontWeight: 'bold',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: isSelected ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.25)',
                              background: isSelected ? 'linear-gradient(to bottom, #4f46e5, #3730a3)' : 'rgba(0, 0, 0, 0.55)',
                              color: isSelected ? '#ffffff' : '#c7d2fe',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {multiplier}x
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons: Use and/or Buy More */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {item.qty > 0 && (
                      <button
                        onClick={() => useCrewItem(item.id, item.title)}
                        style={{
                          width: '100%',
                          padding: '10px 0',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(to bottom, #16a34a, #15803d)',
                          color: '#ffffff',
                          fontWeight: '900',
                          fontSize: '16px',
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(22, 163, 74, 0.5)',
                        }}
                      >
                        {item.btnText} ({item.qty}x متوفر)
                      </button>
                    )}

                    <button
                      onClick={() => buyCrewDirectly(item.id, item.title, unitPrice, costType, selectedCrewQty)}
                      style={{
                        width: '100%',
                        padding: '10px 0',
                        borderRadius: '10px',
                        border: costType === 'gold' ? '1.5px solid #fde047' : '1.5px solid #7dd3fc',
                        background: costType === 'gold'
                          ? 'linear-gradient(to bottom, #ca8a04, #854d0e)'
                          : 'linear-gradient(to bottom, #0284c7, #0369a1)',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '15px',
                        cursor: 'pointer',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '17px' }}>🛒</span>
                      <span>
                        شراء وتوظيف ({selectedCrewQty}x) بـ {totalCost.toLocaleString()} {costType === 'gold' ? '🪙' : '💎'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          </div>
        )}

        {/* ==================== TAB 2: أسلحة ==================== */}
        {activeTab === 'weapons' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(90deg, #1e1b4b, #172554, #1e1b4b)',
                border: '2px solid #3b82f6',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '20px',
                color: '#eff6ff',
                textAlign: 'center',
                boxShadow: '0 4px 18px rgba(59, 130, 246, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#93c5fd', letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                🚀 ترسانة الأسلحة والصواريخ (تكبير العدد وخانة الكمية حسب رغبتك)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '15px', color: '#facc15', fontWeight: 'bold' }}>⚡ كمية الشراء السريعة للأسلحة:</span>
                {[1, 3, 4, 5, 10, 50, 100].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setGlobalInvWeaponMultiplier(m);
                      const updated: Record<string, number> = {};
                      WEAPONS_DATA.forEach(w => { updated[w.key] = m; });
                      setInvWeaponBuyMultipliers(updated);
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      border: globalInvWeaponMultiplier === m ? '2px solid #fde047' : '1px solid rgba(255,255,255,0.25)',
                      background: globalInvWeaponMultiplier === m ? 'linear-gradient(to bottom, #2563eb, #1d4ed8)' : 'rgba(0,0,0,0.55)',
                      color: globalInvWeaponMultiplier === m ? '#ffffff' : '#e2e8f0',
                      boxShadow: globalInvWeaponMultiplier === m ? '0 0 12px rgba(59, 130, 246, 0.7)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m}x
                  </button>
                ))}

                {/* خانة كتابة أي كمية تريدها للكل */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.65)', padding: '4px 10px', borderRadius: '10px', border: '1.5px solid #3b82f6' }}>
                  <span style={{ fontSize: '14px', color: '#93c5fd', fontWeight: 'bold' }}>✏️ خانة كمية مخصصة:</span>
                  <input
                    type="number"
                    min="1"
                    max="99999"
                    value={globalInvWeaponMultiplier}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const next = isNaN(val) || val < 1 ? 1 : val;
                      setGlobalInvWeaponMultiplier(next);
                      const updated: Record<string, number> = {};
                      WEAPONS_DATA.forEach(w => { updated[w.key] = next; });
                      setInvWeaponBuyMultipliers(updated);
                    }}
                    style={{ width: '70px', height: '30px', background: '#0a142c', color: '#facc15', border: '1.5px solid #3b82f6', borderRadius: '6px', textAlign: 'center', fontWeight: '900', fontSize: '16px' }}
                    title="اكتب أي كمية تريدها للأسلحة"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WEAPONS_DATA.map(item => {
                const currentQty = weapons[item.key] || weapons[item.id] || (item.key === 'adBomb' ? weapons.emp_bomb : 0) || (item.key === 'atomicBomb' ? weapons.nuke_bomb : 0) || (item.key === 'smallRocket' ? weapons.small_missile : 0) || (item.key === 'mediumRocket' ? weapons.medium_missile : 0) || (item.key === 'largeRocket' ? weapons.large_missile : 0) || 0;
                const selectedQty = invWeaponBuyMultipliers[item.key] || globalInvWeaponMultiplier || 1;
                const totalCost = item.price * selectedQty;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'linear-gradient(to bottom, #0f1d3e, #0a142c)',
                      border: '2px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '18px',
                      padding: '18px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                      position: 'relative',
                    }}
                  >
                    {/* ENLARGED QUANTITY BADGE (تكبير عدد الأسلحة المملوكة) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: currentQty > 0 ? 'linear-gradient(135deg, #15803d, #166534)' : 'rgba(239, 68, 68, 0.4)',
                        color: currentQty > 0 ? '#ffffff' : '#fca5a5',
                        border: currentQty > 0 ? '2.5px solid #4ade80' : '2px solid #ef4444',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '900',
                        padding: '4px 12px',
                        boxShadow: currentQty > 0 ? '0 0 14px rgba(74, 222, 128, 0.75)' : 'none',
                        zIndex: 10,
                        letterSpacing: '0.5px'
                      }}
                    >
                      {currentQty > 0 ? `${currentQty.toLocaleString()}x` : '0x'}
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '140px',
                        borderRadius: '14px',
                        background: item.bgImage 
                          ? `url(${item.bgImage}) center/cover no-repeat` 
                          : 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(10,20,44,0.85) 100%)',
                        border: '2px solid rgba(234, 179, 8, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '60px',
                        margin: '10px 0 14px 0',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7)',
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
                            filter: 'brightness(0.95)',
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
                            maxHeight: '120px', 
                            maxWidth: '120px', 
                            width: 'auto', 
                            height: 'auto', 
                            objectFit: 'contain', 
                            filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.9))' 
                          }} 
                        />
                      ) : (
                        <span style={{ position: 'relative', zIndex: 2 }}>{item.icon}</span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: '900',
                        color: '#facc15',
                        marginBottom: '6px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.9)'
                      }}
                    >
                      {item.name}
                    </div>

                    {/* ENLARGED PROMINENT COUNTER BAR */}
                    <div 
                      style={{
                        width: '100%',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        color: currentQty > 0 ? '#86efac' : '#94a3b8',
                        background: currentQty > 0 ? 'rgba(22, 101, 52, 0.55)' : 'rgba(0,0,0,0.5)',
                        border: currentQty > 0 ? '2px solid rgba(74, 222, 128, 0.6)' : '1px solid rgba(148, 163, 184, 0.25)',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: currentQty > 0 ? '0 0 10px rgba(74, 222, 128, 0.3)' : 'none'
                      }}
                    >
                      <span>لديك حالياً:</span>
                      <strong style={{ fontSize: '18px', color: currentQty > 0 ? '#4ade80' : '#f87171' }}>
                        {currentQty.toLocaleString()} قذيفة
                      </strong>
                    </div>

                    {/* Damage Badge */}
                    <div 
                      style={{
                        fontSize: '15px',
                        color: '#fef08a',
                        fontWeight: '900',
                        background: 'rgba(234, 179, 8, 0.2)',
                        border: '1.5px solid rgba(234, 179, 8, 0.5)',
                        borderRadius: '8px',
                        padding: '4px 12px',
                        marginBottom: '8px'
                      }}
                    >
                      ⚔️ الضرر: {item.damage.toLocaleString()}
                    </div>

                    <div style={{ fontSize: '16px', color: '#fcd34d', fontWeight: '900', marginBottom: '8px' }}>
                      {item.costType === 'gold' ? `🪙 ${item.price.toLocaleString()} ذهب` : `💎 ${item.price} جوهرة`}
                    </div>

                    <div
                      style={{
                        fontSize: '15px',
                        color: '#e2e8f0',
                        lineHeight: '1.45',
                        marginBottom: '12px',
                        flex: 1,
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        textAlign: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.desc}
                    </div>

                    {/* QUANTITY BOX & CONTROLS (خانة إضافة الكمية حسب رغبتك) */}
                    <div style={{ width: '100%', marginBottom: '10px', background: 'rgba(0,0,0,0.5)', padding: '8px 6px', borderRadius: '10px', border: '1.5px solid rgba(59, 130, 246, 0.5)' }}>
                      <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🔢 خانة الكمية:</span>
                        <span style={{ color: '#facc15', fontWeight: '900', fontSize: '16px' }}>{selectedQty}x</span>
                      </div>

                      {/* Stepper + Direct Input Field */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = Math.max(1, selectedQty - 1);
                            setInvWeaponBuyMultipliers(prev => ({ ...prev, [item.key]: next }));
                          }}
                          style={{
                            width: '36px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1.5px solid rgba(255,255,255,0.3)',
                            background: 'rgba(239, 68, 68, 0.6)',
                            color: '#ffffff',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="1"
                          max="99999"
                          value={selectedQty}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const next = isNaN(val) || val < 1 ? 1 : val;
                            setInvWeaponBuyMultipliers(prev => ({ ...prev, [item.key]: next }));
                          }}
                          style={{
                            width: '75px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '2px solid #60a5fa',
                            background: '#0a142c',
                            color: '#facc15',
                            textAlign: 'center',
                            fontSize: '17px',
                            fontWeight: '900',
                            padding: '0 4px'
                          }}
                          title="أدخل أي كمية تريد شراءها"
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = selectedQty + 1;
                            setInvWeaponBuyMultipliers(prev => ({ ...prev, [item.key]: next }));
                          }}
                          style={{
                            width: '36px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1.5px solid rgba(255,255,255,0.3)',
                            background: 'rgba(34, 197, 94, 0.6)',
                            color: '#ffffff',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Quick Presets: 1, 3, 4, 5, 10, 50 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        {[1, 3, 4, 5, 10, 50].map(multiplier => {
                          const isSelected = selectedQty === multiplier;
                          return (
                            <button
                              key={multiplier}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInvWeaponBuyMultipliers(prev => ({ ...prev, [item.key]: multiplier }));
                              }}
                              style={{
                                fontSize: '13px',
                                fontWeight: 'bold',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                border: isSelected ? '2px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.25)',
                                background: isSelected ? 'linear-gradient(to bottom, #2563eb, #1e40af)' : 'rgba(0, 0, 0, 0.55)',
                                color: isSelected ? '#ffffff' : '#d1d5db',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {multiplier}x
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ACTION BUTTONS: LAUNCH AND/OR BUY IN BULK */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentQty > 0 && (
                        <button
                          onClick={() => buyOrUseWeapon(item.key, item.name, item.price, item.costType)}
                          style={{
                            width: '100%',
                            padding: '11px 0',
                            borderRadius: '12px',
                            border: '2px solid #4ade80',
                            background: 'linear-gradient(to bottom, #16a34a, #15803d)',
                            color: '#ffffff',
                            fontWeight: '900',
                            fontSize: '17px',
                            cursor: 'pointer',
                            boxShadow: '0 3px 12px rgba(22, 163, 74, 0.5)',
                          }}
                        >
                          إطلاق قذيفة 🚀
                        </button>
                      )}

                      <button
                        onClick={() => buyWeaponDirectly(item.key, item.name, item.price, item.costType, selectedQty)}
                        style={{
                          width: '100%',
                          padding: '11px 0',
                          borderRadius: '12px',
                          border: item.costType === 'gold' ? '1.5px solid #fde047' : '1.5px solid #93c5fd',
                          background: item.costType === 'gold'
                            ? 'linear-gradient(to bottom, #ca8a04, #854d0e)'
                            : 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
                          color: '#ffffff',
                          fontWeight: '900',
                          fontSize: '16px',
                          cursor: 'pointer',
                          boxShadow: '0 3px 12px rgba(0,0,0,0.5)',
                        }}
                      >
                        {item.costType === 'gold' 
                          ? `شراء (${selectedQty}x) بـ ${totalCost.toLocaleString()} ذهب 🪙` 
                          : `شراء (${selectedQty}x) بـ ${totalCost.toLocaleString()} جوهرة 💎`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: دروع ==================== */}
        {activeTab === 'shields' && (
          <div>
            {/* Shields Grid */}
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#facc15', marginBottom: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              🛡️ دروع الحماية
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { id: 'shield_4h', title: 'درع 4 ساعات', desc: 'حماية كاملة للسفينة من جميع الهجمات لمدة 4 ساعات', icon: '🛡️', qty: shieldInventory['shield_4h'] || 0 },
                { id: 'shield_1d', title: 'درع يوم كامل', desc: 'حماية كاملة للسفينة من جميع الهجمات لمدة 24 ساعة', icon: '🛡️', qty: shieldInventory['shield_1d'] || 0 },
                { id: 'shield_2d', title: 'درع يومين', desc: 'حماية كاملة للسفينة من جميع الهجمات لمدة 48 ساعة', icon: '🛡️', qty: shieldInventory['shield_2d'] || 0 },
              ].map(item => (
                <div
                  key={item.id}
                  style={{
                    background: 'linear-gradient(to bottom, #0f1d3e, #0a142c)',
                    border: '2px solid rgba(59, 130, 246, 0.45)',
                    borderRadius: '20px',
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: item.qty > 0 ? '#16a34a' : 'rgba(239, 68, 68, 0.3)',
                      color: item.qty > 0 ? '#ffffff' : '#fca5a5',
                      border: item.qty > 0 ? '1.5px solid #4ade80' : '1.5px solid #ef4444',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '900',
                      padding: '4px 12px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    }}
                  >
                    {item.qty > 0 ? `${item.qty}x متوفر` : 'لا تمتلك'}
                  </div>

                  <div
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(15,29,62,0.7) 100%)',
                      border: '3px solid rgba(56, 189, 248, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '58px',
                      margin: '18px 0 14px 0',
                      boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#facc15', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '16px', color: '#cbd5e1', marginBottom: '18px', flex: 1, lineHeight: '1.45' }}>
                    {item.desc}
                  </div>

                  <button
                    onClick={() => useShield(item.id, item.title)}
                    disabled={item.qty <= 0}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: '12px',
                      border: 'none',
                      background: item.qty > 0 ? 'linear-gradient(to bottom, #16a34a, #15803d)' : '#334155',
                      color: item.qty > 0 ? '#ffffff' : '#94a3b8',
                      fontWeight: '900',
                      fontSize: '17px',
                      cursor: item.qty > 0 ? 'pointer' : 'not-allowed',
                      boxShadow: item.qty > 0 ? '0 4px 14px rgba(22, 163, 74, 0.5)' : 'none',
                    }}
                  >
                    {item.qty > 0 ? 'تفعيل الدرع 🛡️' : 'غير متوفر'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: سجل المكتشفات (Pokedex / Discovery Log) ==================== */}
        {activeTab === 'items' && (
          <div>
            {/* Top Banner & Progress Summary */}
            <div
              style={{
                background: 'linear-gradient(135deg, #03203c 0%, #081121 100%)',
                border: '2px solid #0284c7',
                borderRadius: '18px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '36px' }}>📖</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#38bdf8', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                      سجل المكتشفات الكوني (Pokedex البحرية)
                    </h3>
                    <div style={{ fontSize: '15px', color: '#bae6fd', marginTop: '4px' }}>
                      الأرشيف الشامل لجميع أنواع الأسماك والمخلوقات المتاحة في أعماق المحيط
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(2, 132, 199, 0.3)',
                    border: '1.5px solid #38bdf8',
                    borderRadius: '24px',
                    padding: '6px 18px',
                    fontSize: '16px',
                    fontWeight: '900',
                    color: '#fef08a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}
                >
                  {discoveredCount} / {totalSpecies} نوع ({progressPercent}%)
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '14px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #a855f7, #facc15)',
                    borderRadius: '12px',
                    transition: 'width 0.5s ease-in-out',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.9)',
                  }}
                />
              </div>

              {/* Stats Chips */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  fontSize: '15px',
                }}
              >
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1.5px solid #10b981', color: '#6ee7b7', padding: '6px 14px', borderRadius: '10px', fontWeight: 'bold' }}>
                  ✓ كائنات تم اصطيادها: <b style={{ fontSize: '17px', color: '#a7f3d0' }}>{discoveredCount}</b>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1.5px solid #ef4444', color: '#fca5a5', padding: '6px 14px', borderRadius: '10px', fontWeight: 'bold' }}>
                  🔒 لم تُكتشف بعد: <b style={{ fontSize: '17px', color: '#fecaca' }}>{totalSpecies - discoveredCount}</b>
                </div>
                <div style={{ background: 'rgba(234, 179, 8, 0.2)', border: '1.5px solid #eab308', color: '#fde047', padding: '6px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <img src={GOLD_COIN_ICON} alt="ذهب" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                  إجمالي قيمة المحصول المكتشف: <b style={{ fontSize: '17px', color: '#fef08a' }}>{totalValueDiscoveredGold.toLocaleString()} ذهب</b>
                </div>
              </div>
            </div>

            {/* Filter Pills & Search Input */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="🔍 ابحث عن اسم سمكة أو موطن..."
                value={pokedexSearch}
                onChange={e => setPokedexSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '220px',
                  background: '#09152e',
                  border: '1.5px solid #0284c7',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />

              {[
                { key: 'all', label: `الكل (${totalSpecies})` },
                { key: 'discovered', label: `المكتشفة ✓ (${discoveredCount})` },
                { key: 'undiscovered', label: `لم تُكتشف 🔒 (${totalSpecies - discoveredCount})` },
                { key: 'common', label: 'شائع 🐟' },
                { key: 'rare', label: 'نادر 🐠' },
                { key: 'legendary', label: 'أسطوري 🐉' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setPokedexFilter(f.key as any)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: pokedexFilter === f.key ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
                    background: pokedexFilter === f.key ? 'linear-gradient(to bottom, #0284c7, #0369a1)' : '#0d1d3a',
                    color: pokedexFilter === f.key ? '#fff' : '#cbd5e1',
                    fontSize: '15px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: pokedexFilter === f.key ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grid of Creatures / Fish */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredPokedex.map(fish => {
                const isDisc = fish.isDiscovered;

                return (
                  <div
                    key={fish.id}
                    onClick={() => setSelectedFishModal(fish)}
                    style={{
                      background: isDisc ? fish.bgGradient : 'linear-gradient(135deg, #090e18, #04060c)',
                      border: isDisc ? `2px solid ${fish.rarityColor}` : '1.5px dashed #475569',
                      borderRadius: '18px',
                      padding: '18px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: isDisc ? `0 6px 20px ${fish.rarityColor}33` : 'none',
                      transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                      opacity: isDisc ? 1 : 0.8,
                    }}
                  >
                    {/* Discovered / Lock Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: isDisc ? fish.rarityColor : '#334155',
                        color: isDisc ? '#000' : '#cbd5e1',
                        fontSize: '13px',
                        fontWeight: '900',
                        padding: '3px 10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                      }}
                    >
                      {fish.rarityLabel}
                    </div>

                    {/* Times Caught Badge */}
                    {isDisc && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: 'rgba(16, 185, 129, 0.3)',
                          border: '1.5px solid #10b981',
                          color: '#6ee7b7',
                          fontSize: '13px',
                          fontWeight: '900',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                      >
                        {fish.defaultCaughtCount}x
                      </div>
                    )}

                    {/* Emoji / Silhouette */}
                    <div
                      style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '50%',
                        background: isDisc ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.5)',
                        border: isDisc ? `2.5px solid ${fish.rarityColor}` : '1.5px solid #475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '56px',
                        margin: '22px 0 12px 0',
                        filter: isDisc ? 'none' : 'grayscale(1) blur(1px)',
                        boxShadow: isDisc ? `0 0 18px ${fish.rarityColor}55, inset 0 0 12px ${fish.rarityColor}33` : 'none',
                      }}
                    >
                      {isDisc ? fish.emoji : '🔒'}
                    </div>

                    {/* Fish Name */}
                    <div
                      style={{
                        fontSize: '19px',
                        fontWeight: '900',
                        color: isDisc ? '#ffffff' : '#94a3b8',
                        marginBottom: '6px',
                        lineHeight: '1.3',
                        textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                      }}
                    >
                      {isDisc ? fish.name : 'كائن غير مكتشف'}
                    </div>

                    {/* Scientific / Level */}
                    <div
                      style={{
                        fontSize: '14px',
                        color: isDisc ? fish.rarityColor : '#94a3b8',
                        marginBottom: '10px',
                        fontWeight: 'bold',
                      }}
                    >
                      {isDisc ? fish.habitat : `يتطلب سفينة مستوى ${fish.minLevel}`}
                    </div>

                    {/* Price / Value */}
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        width: '100%',
                        fontSize: '15px',
                        fontWeight: '900',
                        color: isDisc ? '#fde047' : '#94a3b8',
                        marginBottom: '12px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      }}
                    >
                      {isDisc
                        ? `🪙 ${fish.priceGold.toLocaleString()}${fish.priceGems ? ` | 💎 ${fish.priceGems}` : ''}`
                        : '🔒 القيمة مجهولة'}
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedFishModal(fish);
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 0',
                        borderRadius: '10px',
                        border: 'none',
                        background: isDisc
                          ? `linear-gradient(to bottom, ${fish.rarityColor}, #1e293b)`
                          : 'linear-gradient(to bottom, #334155, #1e293b)',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      {isDisc ? 'عرض التفاصيل 🔍' : 'كشف اللغز 🔒'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal for Fish / Creature */}
      {selectedFishModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 350,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedFishModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #09152b 0%, #030814 100%)',
              border: `2px solid ${selectedFishModal.isDiscovered ? selectedFishModal.rarityColor : '#475569'}`,
              borderRadius: '24px',
              padding: '26px 22px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: `0 12px 48px rgba(0,0,0,0.9), 0 0 35px ${selectedFishModal.rarityColor}33`,
              color: '#fff',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setSelectedFishModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              ✕
            </button>

            {/* Fish Large Avatar */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: `3px solid ${selectedFishModal.rarityColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '70px',
                margin: '12px auto 16px auto',
                boxShadow: `0 0 30px ${selectedFishModal.rarityColor}66`,
                filter: selectedFishModal.isDiscovered ? 'none' : 'grayscale(1)',
              }}
            >
              {selectedFishModal.isDiscovered ? selectedFishModal.emoji : '🔒'}
            </div>

            <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '900', color: selectedFishModal.rarityColor, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {selectedFishModal.isDiscovered ? selectedFishModal.name : 'كائن بحري غير مكتشف'}
            </h3>

            <div style={{ fontSize: '15px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '14px' }}>
              {selectedFishModal.scientificName}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: selectedFishModal.rarityColor,
                  color: '#000',
                  padding: '4px 14px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '900',
                }}
              >
                الدرجة: {selectedFishModal.rarityLabel}
              </span>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1.5px solid #38bdf8',
                  color: '#38bdf8',
                  padding: '4px 14px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '900',
                }}
              >
                📍 الموطن: {selectedFishModal.habitat}
              </span>
            </div>

            <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '18px', background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '14px', textAlign: 'right', border: '1px solid rgba(255,255,255,0.08)' }}>
              {selectedFishModal.isDiscovered
                ? selectedFishModal.description
                : `لم يقم الكابتن باكتشاف هذا الكائن بعد. أبحر إلى أعماق أبعد باستخدام سفينة مستوى ${selectedFishModal.minLevel} أو أعلى ومحركات صيد متطورة لإضافته للأرشيف!`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '15px', marginBottom: '20px' }}>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1.5px solid #334155' }}>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '14px', marginBottom: '4px' }}>قيمة الصيد</span>
                <strong style={{ color: '#fde047', fontSize: '18px' }}>🪙 {selectedFishModal.priceGold.toLocaleString()} ذهب</strong>
              </div>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1.5px solid #334155' }}>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '14px', marginBottom: '4px' }}>عدد مرات الاصطياد</span>
                <strong style={{ color: '#4ade80', fontSize: '18px' }}>{selectedFishModal.defaultCaughtCount} مرة</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {!selectedFishModal.isDiscovered ? (
                <button
                  onClick={() => handleCatchFish(selectedFishModal.id)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to bottom, #16a34a, #15803d)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 0',
                    fontSize: '16px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(22, 163, 74, 0.4)',
                  }}
                >
                  🎣 تسـجيل اكتشاف سمكة جديدة
                </button>
              ) : (
                <button
                  onClick={() => handleCatchFish(selectedFishModal.id)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to bottom, #0284c7, #0369a1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 0',
                    fontSize: '16px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  🎣 زيادة عدد الاصطياد (+1)
                </button>
              )}

              <button
                onClick={() => setSelectedFishModal(null)}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 22px',
                  fontSize: '16px',
                  fontWeight: '900',
                  cursor: 'pointer',
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
