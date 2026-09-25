import React, { useState, useEffect } from 'react';
import { GOLD_COIN_ICON, WAREHOUSE_BG, WEAPON_SMALL_MISSILE_ICON, WEAPON_MEDIUM_MISSILE_ICON, WEAPON_LARGE_MISSILE_ICON, WEAPON_MEDIA_BOMB_ICON, WEAPON_ATOMIC_BOMB_ICON, SHIP_GUARDIAN_ICON, SHIP_GUARDIAN_BG, FIXER_SMALL_ICON, FIXER_SMALL_BG, FIXER_MEDIUM_ICON, FIXER_MEDIUM_BG, FIXER_LARGE_ICON, FIXER_LARGE_BG, FIXER_LEGENDARY_ICON, FIXER_LEGENDARY_BG, SAILOR_ICON, SAILOR_BG, GOLDEN_HUNTER_ICON, GOLDEN_HUNTER_BG, MARKET_EXPERT_ICON, MARKET_EXPERT_BG, LUCK_PIRATE_ICON, LUCK_PIRATE_BG, SHIP_PILOT_ICON, SHIP_PILOT_BG, SHIP_THIEF_ICON, SHIP_THIEF_BG, WEAPONS_DATA } from '../data';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ca8a04, #854d0e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 2px 10px rgba(234, 179, 8, 0.3)',
              border: '1px solid #fef08a',
            }}
          >
            📦
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#facc15' }}>
              المخزن
            </h2>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
              - العوالم والمعدات والأسلحة وسجل المكتشفات -
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              borderRadius: '8px',
              padding: '6px 14px',
              fontWeight: 'bold',
              fontSize: '12px',
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
          background: 'rgba(9, 18, 42, 0.92)',
          borderBottom: '1px solid rgba(234, 179, 8, 0.2)',
          padding: '10px 12px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          justifyContent: 'space-around',
          backdropFilter: 'blur(6px)',
        }}
      >
        <button
          onClick={() => setActiveTab('crew')}
          style={{
            flex: 1,
            minWidth: '75px',
            padding: '9px 10px',
            borderRadius: '10px',
            border: activeTab === 'crew' ? '1.5px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
            background: activeTab === 'crew' ? 'linear-gradient(to bottom, #1d4ed8, #1e40af)' : '#0b193c',
            color: activeTab === 'crew' ? '#fef08a' : '#94a3b8',
            fontWeight: 'bold',
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'crew' ? '0 0 12px rgba(250, 204, 21, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          💡 طواقم
        </button>

        <button
          onClick={() => setActiveTab('weapons')}
          style={{
            flex: 1,
            minWidth: '75px',
            padding: '9px 10px',
            borderRadius: '10px',
            border: activeTab === 'weapons' ? '1.5px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
            background: activeTab === 'weapons' ? 'linear-gradient(to bottom, #1d4ed8, #1e40af)' : '#0b193c',
            color: activeTab === 'weapons' ? '#fef08a' : '#94a3b8',
            fontWeight: 'bold',
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'weapons' ? '0 0 12px rgba(250, 204, 21, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          🚀 أسلحة
        </button>

        <button
          onClick={() => setActiveTab('shields')}
          style={{
            flex: 1,
            minWidth: '75px',
            padding: '9px 10px',
            borderRadius: '10px',
            border: activeTab === 'shields' ? '1.5px solid #facc15' : '1px solid rgba(255,255,255,0.1)',
            background: activeTab === 'shields' ? 'linear-gradient(to bottom, #1d4ed8, #1e40af)' : '#0b193c',
            color: activeTab === 'shields' ? '#fef08a' : '#94a3b8',
            fontWeight: 'bold',
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'shields' ? '0 0 12px rgba(250, 204, 21, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
        >
          🛡️ دروع
        </button>

        <button
          onClick={() => setActiveTab('items')}
          style={{
            flex: 1,
            minWidth: '85px',
            padding: '9px 10px',
            borderRadius: '10px',
            border: activeTab === 'items' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
            background: activeTab === 'items' ? 'linear-gradient(to bottom, #0284c7, #0369a1)' : '#0b193c',
            color: activeTab === 'items' ? '#ffffff' : '#38bdf8',
            fontWeight: 'bold',
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'items' ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', padding: '10px 0' }}>
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
            ].map(item => (
              <div
                key={item.id}
                style={{
                  width: '280px',
                  height: '400px',
                  minWidth: '280px',
                  maxWidth: '280px',
                  borderRadius: '16px',
                  border: '2px solid rgba(234, 179, 8, 0.75)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.65), 0 0 16px rgba(234, 179, 8, 0.25)',
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
                      background: item.qty > 0 ? 'rgba(22, 163, 74, 0.9)' : 'rgba(220, 38, 38, 0.85)',
                      color: '#ffffff',
                      border: item.qty > 0 ? '1px solid #4ade80' : '1px solid #ef4444',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 'bold',
                      padding: '3px 10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {item.qty > 0 ? `${item.qty}x متوفر` : 'غير متوفر'}
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
                    padding: '16px 14px 12px 14px',
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
                      marginBottom: '8px',
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

                  {/* Bottom Icons: Stars, Diamond, Anchor */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      marginBottom: '10px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      border: '1px solid rgba(234, 179, 8, 0.35)',
                      borderRadius: '8px',
                    }}
                  >
                    {/* Stars (نجوم) */}
                    <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', fontSize: '12.5px' }}>
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                      <span>⭐</span>
                    </div>

                    {/* Diamond (ماس) & Anchor (مرساة) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', fontWeight: 'bold' }}>
                      <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span>💎</span>
                        <span>نادر</span>
                      </span>
                      <span style={{ color: '#facc15', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span>⚓</span>
                        <span>طاقم</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => useCrewItem(item.id, item.title)}
                    disabled={item.qty <= 0}
                    style={{
                      width: '100%',
                      padding: '9px 0',
                      borderRadius: '8px',
                      border: 'none',
                      background:
                        item.qty > 0
                          ? 'linear-gradient(to bottom, #16a34a, #15803d)'
                          : '#334155',
                      color: item.qty > 0 ? '#ffffff' : '#94a3b8',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: item.qty > 0 ? 'pointer' : 'not-allowed',
                      boxShadow:
                        item.qty > 0 ? '0 2px 10px rgba(22, 163, 74, 0.5)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.qty > 0 ? item.btnText : 'لا تمتلك'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== TAB 2: أسلحة ==================== */}
        {activeTab === 'weapons' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {WEAPONS_DATA.map(item => {
              const currentQty = weapons[item.key] || weapons[item.id] || (item.key === 'adBomb' ? weapons.emp_bomb : 0) || (item.key === 'atomicBomb' ? weapons.nuke_bomb : 0) || (item.key === 'smallRocket' ? weapons.small_missile : 0) || (item.key === 'mediumRocket' ? weapons.medium_missile : 0) || (item.key === 'largeRocket' ? weapons.large_missile : 0) || 0;
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'linear-gradient(to bottom, #0f1d3e, #0a142c)',
                    border: '1.5px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: currentQty > 0 ? '#16a34a' : 'rgba(239, 68, 68, 0.25)',
                      color: currentQty > 0 ? '#ffffff' : '#fca5a5',
                      border: currentQty > 0 ? '1px solid #4ade80' : '1px solid #ef4444',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                    }}
                  >
                    {currentQty > 0 ? `${currentQty}x` : 'لا تمتلك'}
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '115px',
                      borderRadius: '12px',
                      background: item.bgImage 
                        ? `url(${item.bgImage}) center/cover no-repeat` 
                        : 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(10,20,44,0.8) 100%)',
                      border: '1.5px solid rgba(234, 179, 8, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      margin: '8px 0 10px 0',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6)',
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
                          maxHeight: '95px', 
                          maxWidth: '95px', 
                          width: 'auto', 
                          height: 'auto', 
                          objectFit: 'contain', 
                          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.85))' 
                        }} 
                      />
                    ) : (
                      <span style={{ position: 'relative', zIndex: 2 }}>{item.icon}</span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#facc15',
                      marginBottom: '4px',
                    }}
                  >
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
                      marginBottom: '6px'
                    }}
                  >
                    ⚔️ الضرر: {item.damage.toLocaleString()}
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#fcd34d', fontWeight: 'bold', marginBottom: '6px' }}>
                    {item.costType === 'gold' ? `🪙 ${item.price.toLocaleString()} ذهب` : `💎 ${item.price} جوهرة`}
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: '#cbd5e1',
                      lineHeight: '1.35',
                      marginBottom: '12px',
                      flex: 1,
                      minHeight: '32px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {item.desc}
                  </div>

                  <button
                    onClick={() => buyOrUseWeapon(item.key, item.name, item.price, item.costType)}
                    style={{
                      width: '100%',
                      padding: '9px 0',
                      borderRadius: '10px',
                      border: 'none',
                      background:
                        currentQty > 0
                          ? 'linear-gradient(to bottom, #16a34a, #15803d)'
                          : item.costType === 'gold'
                            ? 'linear-gradient(to bottom, #ca8a04, #854d0e)'
                            : 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow:
                        currentQty > 0
                          ? '0 2px 10px rgba(22, 163, 74, 0.4)'
                          : '0 2px 10px rgba(0,0,0,0.4)',
                    }}
                  >
                    {currentQty > 0 ? 'إطلاق 🚀' : (item.costType === 'gold' ? 'شراء 🪙' : 'شراء 💎')}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== TAB 3: دروع ==================== */}
        {activeTab === 'shields' && (
          <div>
            {/* Shields Grid */}
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#facc15', marginBottom: '12px' }}>
              🛡️ دروع الحماية
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
              {[
                { id: 'shield_4h', title: 'درع 4 ساعات', desc: 'حماية لمدة 4 ساعات', icon: '🛡️', qty: shieldInventory['shield_4h'] || 0 },
                { id: 'shield_1d', title: 'درع يوم', desc: 'حماية لمدة 24 ساعة', icon: '🛡️', qty: shieldInventory['shield_1d'] || 0 },
                { id: 'shield_2d', title: 'درع يومين', desc: 'حماية لمدة 48 ساعة', icon: '🛡️', qty: shieldInventory['shield_2d'] || 0 },
              ].map(item => (
                <div
                  key={item.id}
                  style={{
                    background: 'linear-gradient(to bottom, #0f1d3e, #0a142c)',
                    border: '1.5px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '16px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: item.qty > 0 ? '#16a34a' : 'rgba(239, 68, 68, 0.25)',
                      color: item.qty > 0 ? '#ffffff' : '#fca5a5',
                      border: item.qty > 0 ? '1px solid #4ade80' : '1px solid #ef4444',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                    }}
                  >
                    {item.qty > 0 ? `${item.qty}x` : 'لا تمتلك'}
                  </div>

                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(15,29,62,0.6) 100%)',
                      border: '2px solid rgba(56, 189, 248, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '44px',
                      margin: '10px 0 8px 0',
                      boxShadow: '0 0 14px rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#facc15', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '12px', flex: 1 }}>{item.desc}</div>

                  <button
                    onClick={() => useShield(item.id, item.title)}
                    disabled={item.qty <= 0}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: '10px',
                      border: 'none',
                      background: item.qty > 0 ? 'linear-gradient(to bottom, #16a34a, #15803d)' : '#334155',
                      color: item.qty > 0 ? '#ffffff' : '#94a3b8',
                      fontWeight: 'bold',
                      fontSize: '12.5px',
                      cursor: item.qty > 0 ? 'pointer' : 'not-allowed',
                      boxShadow: item.qty > 0 ? '0 2px 10px rgba(22, 163, 74, 0.4)' : 'none',
                    }}
                  >
                    {item.qty > 0 ? 'تفعيل 🛡️' : 'لا تمتلك'}
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
                border: '1.5px solid #0284c7',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>📖</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#38bdf8' }}>
                      سجل المكتشفات الكوني (Pokedex البحرية)
                    </h3>
                    <div style={{ fontSize: '11.5px', color: '#7dd3fc', marginTop: '2px' }}>
                      الأرشيف الشامل لجميع أنواع الأسماك والمخلوقات المتاحة في أعماق المحيط
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(2, 132, 199, 0.2)',
                    border: '1px solid #38bdf8',
                    borderRadius: '20px',
                    padding: '4px 14px',
                    fontSize: '12.5px',
                    fontWeight: 'bold',
                    color: '#fef08a',
                  }}
                >
                  {discoveredCount} / {totalSpecies} نوع ({progressPercent}%)
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #a855f7, #facc15)',
                    borderRadius: '10px',
                    transition: 'width 0.5s ease-in-out',
                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)',
                  }}
                />
              </div>

              {/* Stats Chips */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '11px',
                }}
              >
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '4px 10px', borderRadius: '8px' }}>
                  ✓ كائنات تم اصطيادها: <b>{discoveredCount}</b>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 10px', borderRadius: '8px' }}>
                  🔒 لم تُكتشف بعد: <b>{totalSpecies - discoveredCount}</b>
                </div>
                <div style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', color: '#fde047', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={GOLD_COIN_ICON} alt="ذهب" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                  إجمالي قيمة المحصول المكتشف: <b>{totalValueDiscoveredGold.toLocaleString()} ذهب</b>
                </div>
              </div>
            </div>

            {/* Filter Pills & Search Input */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="🔍 ابحث عن اسم سمكة أو موطن..."
                value={pokedexSearch}
                onChange={e => setPokedexSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  background: '#09152e',
                  border: '1px solid #0284c7',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  color: '#fff',
                  fontSize: '12px',
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
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: pokedexFilter === f.key ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    background: pokedexFilter === f.key ? 'linear-gradient(to bottom, #0284c7, #0369a1)' : '#0d1d3a',
                    color: pokedexFilter === f.key ? '#fff' : '#94a3b8',
                    fontSize: '11.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grid of Creatures / Fish */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {filteredPokedex.map(fish => {
                const isDisc = fish.isDiscovered;

                return (
                  <div
                    key={fish.id}
                    onClick={() => setSelectedFishModal(fish)}
                    style={{
                      background: isDisc ? fish.bgGradient : 'linear-gradient(135deg, #090e18, #04060c)',
                      border: isDisc ? `1.5px solid ${fish.rarityColor}` : '1px dashed #475569',
                      borderRadius: '16px',
                      padding: '14px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: isDisc ? `0 4px 16px ${fish.rarityColor}33` : 'none',
                      transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                      opacity: isDisc ? 1 : 0.75,
                    }}
                  >
                    {/* Discovered / Lock Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: isDisc ? fish.rarityColor : '#334155',
                        color: isDisc ? '#000' : '#cbd5e1',
                        fontSize: '10.5px',
                        fontWeight: 'bold',
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                    >
                      {fish.rarityLabel}
                    </div>

                    {/* Times Caught Badge */}
                    {isDisc && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: 'rgba(16, 185, 129, 0.25)',
                          border: '1px solid #10b981',
                          color: '#6ee7b7',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '6px',
                        }}
                      >
                        {fish.defaultCaughtCount}x
                      </div>
                    )}

                    {/* Emoji / Silhouette */}
                    <div
                      style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: '50%',
                        background: isDisc ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.5)',
                        border: isDisc ? `2px solid ${fish.rarityColor}` : '1px solid #475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '44px',
                        margin: '18px 0 8px 0',
                        filter: isDisc ? 'none' : 'grayscale(1) blur(1px)',
                        boxShadow: isDisc ? `0 0 14px ${fish.rarityColor}55, inset 0 0 10px ${fish.rarityColor}33` : 'none',
                      }}
                    >
                      {isDisc ? fish.emoji : '🔒'}
                    </div>

                    {/* Fish Name */}
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: isDisc ? '#ffffff' : '#94a3b8',
                        marginBottom: '4px',
                        lineHeight: '1.2',
                      }}
                    >
                      {isDisc ? fish.name : 'كائن غير مكتشف'}
                    </div>

                    {/* Scientific / Level */}
                    <div
                      style={{
                        fontSize: '10px',
                        color: isDisc ? fish.rarityColor : '#64748b',
                        marginBottom: '8px',
                      }}
                    >
                      {isDisc ? fish.habitat : `يتطلب سفينة مستوى ${fish.minLevel}`}
                    </div>

                    {/* Price / Value */}
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        width: '100%',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: isDisc ? '#fde047' : '#64748b',
                        marginBottom: '8px',
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
                        padding: '5px 0',
                        borderRadius: '6px',
                        border: 'none',
                        background: isDisc
                          ? `linear-gradient(to bottom, ${fish.rarityColor}, #1e293b)`
                          : 'linear-gradient(to bottom, #334155, #1e293b)',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
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
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setSelectedFishModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #09152b 0%, #030814 100%)',
              border: `2px solid ${selectedFishModal.isDiscovered ? selectedFishModal.rarityColor : '#475569'}`,
              borderRadius: '20px',
              padding: '20px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: `0 10px 40px rgba(0,0,0,0.9), 0 0 30px ${selectedFishModal.rarityColor}33`,
              color: '#fff',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setSelectedFishModal(null)}
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Fish Large Avatar */}
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: `3px solid ${selectedFishModal.rarityColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '52px',
                margin: '10px auto 14px auto',
                boxShadow: `0 0 25px ${selectedFishModal.rarityColor}66`,
                filter: selectedFishModal.isDiscovered ? 'none' : 'grayscale(1)',
              }}
            >
              {selectedFishModal.isDiscovered ? selectedFishModal.emoji : '🔒'}
            </div>

            <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 'bold', color: selectedFishModal.rarityColor }}>
              {selectedFishModal.isDiscovered ? selectedFishModal.name : 'كائن بحري غير مكتشف'}
            </h3>

            <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
              {selectedFishModal.scientificName}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
              <span
                style={{
                  background: selectedFishModal.rarityColor,
                  color: '#000',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                الدرجة: {selectedFishModal.rarityLabel}
              </span>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                📍 الموطن: {selectedFishModal.habitat}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px' }}>
              {selectedFishModal.isDiscovered
                ? selectedFishModal.description
                : `لم يقم الكابتن باكتشاف هذا الكائن بعد. أبحر إلى أعماق أبعد باستخدام سفينة مستوى ${selectedFishModal.minLevel} أو أعلى ومحركات صيد متطورة لإضافته للأرشيف!`}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px', marginBottom: '16px' }}>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ color: '#94a3b8', display: 'block' }}>قيمة الصيد</span>
                <strong style={{ color: '#fde047' }}>🪙 {selectedFishModal.priceGold.toLocaleString()} ذهب</strong>
              </div>
              <div style={{ background: '#0f172a', padding: '8px', borderRadius: '8px', border: '1px solid #334155' }}>
                <span style={{ color: '#94a3b8', display: 'block' }}>عدد مرات الاصطياد</span>
                <strong style={{ color: '#4ade80' }}>{selectedFishModal.defaultCaughtCount} مرة</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!selectedFishModal.isDiscovered ? (
                <button
                  onClick={() => handleCatchFish(selectedFishModal.id)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to bottom, #16a34a, #15803d)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 0',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
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
                    borderRadius: '10px',
                    padding: '9px 0',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
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
                  borderRadius: '10px',
                  padding: '9px 16px',
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
    </div>
  );
}
