export interface ShopShipSpec {
  level: number;
  name: string;
  subName: string;
  hook: number;
  cargo: number;
  heart: number;
  durationStr: string;
  power: number;
  armor: number;
  fishTypes: string[];
  price: number;
  emoji: string;
  image: string;
  rarity?: string;
  attackStat?: number;
  defenseStat?: number;
  speedStat?: number;
  capacityStat?: number;
  description?: string;
}

export interface HarborLevel {
  level: number;
  capacity: string;
  x: number;
  y: number;
}

export const HARBOR_BASE_URL = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/Aamaaq/refs/heads/main/level-";

export const getHarborImageUrl = (level: number) => {
  const currentLevel = Math.max(1, Math.min(Number(level) || 1, 35));
  const paddedLevel = String(currentLevel).padStart(2, '0');
  return `${HARBOR_BASE_URL}${paddedLevel}.png`;
};

export const FISH_HOUSE_CAPACITY_BY_LEVEL: Record<number, number> = {
  1: 100_000,
  2: 200_000,
  3: 300_000,
  4: 400_000,
  5: 500_000,
  6: 600_000,
  7: 700_000,
  8: 800_000,
  9: 900_000,
  10: 1_000_000,
  11: 1_100_000,
  12: 1_200_000,
  13: 1_300_000,
  14: 1_400_000,
  15: 1_500_000,
  16: 1_600_000,
  17: 1_700_000,
  18: 1_800_000,
  19: 1_900_000,
  20: 2_000_000,
  21: 4_000_000,
  22: 6_000_000,
  23: 8_000_000,
  24: 10_000_000,
  25: 12_000_000,
  26: 14_000_000,
  27: 16_000_000,
  28: 18_000_000,
  29: 20_000_000,
  30: 22_000_000,
  31: 24_000_000,
};

export const SHIP_CAPACITY_BY_LEVEL: Record<number, number> = {
  1: 2_000,
  2: 3_000,
  3: 4_000,
  4: 5_000,
  5: 6_000,
  6: 7_000,
  7: 8_000,
  8: 9_000,
  9: 10_000,
  10: 12_000,
  11: 14_000,
  12: 16_000,
  13: 18_000,
  14: 20_000,
  15: 23_000,
  16: 26_000,
  17: 29_000,
  18: 32_000,
  19: 36_000,
  20: 40_000,
  21: 45_000,
  22: 50_000,
  23: 55_000,
  24: 60_000,
  25: 65_000,
  26: 70_000,
  27: 75_000,
  28: 80_000,
  29: 85_000,
  30: 90_000,
  31: 100_000,
};

export const getFishHouseCapacity = (level: number): number => {
  const currentLvl = Math.max(1, Math.min(Number(level) || 1, 31));
  return FISH_HOUSE_CAPACITY_BY_LEVEL[currentLvl] || 100_000;
};

export const getShipCapacity = (level: number): number => {
  const currentLvl = Math.max(1, Math.min(Number(level) || 1, 35));
  if (currentLvl > 31) {
    // Extended scaling for submarines
    return 100_000 + (currentLvl - 31) * 25_000;
  }
  return SHIP_CAPACITY_BY_LEVEL[currentLvl] || 2_000;
};

export interface ShipData {
  level: number;
  name: string;
  description?: string;
  storageCapacity: number;
  storageWithLucky: number;
  withoutCrewFishing: number;
  sailorFishing: number;
  withoutCrewFill: string;
  withoutCrewPlusLucky: string;
  sailor: string;
  sailorPlusLucky: string;
  fishTypes: string[];
}

export const shipsData: ShipData[] = [
  { level: 1, name: "قارب الصياد", storageCapacity: 2000, storageWithLucky: 4000, withoutCrewFishing: 10, sailorFishing: 5, withoutCrewFill: "2س 50د", withoutCrewPlusLucky: "1س 30د", sailor: "1س 30د", sailorPlusLucky: "25د", fishTypes: ["السردين"] },
  { level: 2, name: "قارب شراعي صغير", storageCapacity: 3000, storageWithLucky: 6000, withoutCrewFishing: 10, sailorFishing: 5, withoutCrewFill: "3س 50د", withoutCrewPlusLucky: "2س", sailor: "2س", sailorPlusLucky: "1س", fishTypes: ["الأنشوجة"] },
  { level: 3, name: "مركب شراعي", storageCapacity: 4000, storageWithLucky: 8000, withoutCrewFishing: 12, sailorFishing: 6, withoutCrewFill: "5س", withoutCrewPlusLucky: "2س 36د", sailor: "2س 36د", sailorPlusLucky: "1س 18د", fishTypes: ["الماكريل"] },
  { level: 4, name: "مركب شراعي متوسط", storageCapacity: 5000, storageWithLucky: 10000, withoutCrewFishing: 12, sailorFishing: 6, withoutCrewFill: "5س 24د", withoutCrewPlusLucky: "2س 48د", sailor: "2س 48د", sailorPlusLucky: "1س 24د", fishTypes: ["البلطي"] },
  { level: 5, name: "سفينة تجارية صغيرة", storageCapacity: 6000, storageWithLucky: 12000, withoutCrewFishing: 15, sailorFishing: 7.5, withoutCrewFill: "7س", withoutCrewPlusLucky: "3س 30د", sailor: "3س 30د", sailorPlusLucky: "1س 45د", fishTypes: ["الشعري"] },
  { level: 6, name: "سفينة تجارية متوسطة", storageCapacity: 7000, storageWithLucky: 14000, withoutCrewFishing: 15, sailorFishing: 7.5, withoutCrewFill: "7س 15د", withoutCrewPlusLucky: "3س 45د", sailor: "3س 45د", sailorPlusLucky: "1س 52.5د", fishTypes: ["الكنعد"] },
  { level: 7, name: "سفينة حربية خفيفة", storageCapacity: 8000, storageWithLucky: 16000, withoutCrewFishing: 18, sailorFishing: 9, withoutCrewFill: "9س", withoutCrewPlusLucky: "4س 30د", sailor: "4س 30د", sailorPlusLucky: "2س 15د", fishTypes: ["الهامور"] },
  { level: 8, name: "سفينة حربية متوسطة", storageCapacity: 9000, storageWithLucky: 18000, withoutCrewFishing: 18, sailorFishing: 9, withoutCrewFill: "9س", withoutCrewPlusLucky: "4س 30د", sailor: "4س 30د", sailorPlusLucky: "2س 15د", fishTypes: ["السلمون"] },
  { level: 9, name: "سفينة ملكية", storageCapacity: 10000, storageWithLucky: 20000, withoutCrewFishing: 20, sailorFishing: 10, withoutCrewFill: "10س", withoutCrewPlusLucky: "5س", sailor: "5س", sailorPlusLucky: "2س 30د", fishTypes: ["التونة"] },
  { level: 10, name: "سفينة أسطول", storageCapacity: 12000, storageWithLucky: 24000, withoutCrewFishing: 20, sailorFishing: 10, withoutCrewFill: "9س 20د", withoutCrewPlusLucky: "4س 40د", sailor: "4س 40د", sailorPlusLucky: "2س 20د", fishTypes: ["أبو سيف"] },
  { level: 11, name: "سفينة أسطورية", storageCapacity: 14000, storageWithLucky: 28000, withoutCrewFishing: 12.5, sailorFishing: 12.5, withoutCrewFill: "11س 15د", withoutCrewPlusLucky: "5س 50د", sailor: "5س 50د", sailorPlusLucky: "2س 55د", fishTypes: ["البوري", "السيجان"] },
  { level: 12, name: "سفينة التنين", storageCapacity: 16000, storageWithLucky: 32000, withoutCrewFishing: 12.5, sailorFishing: 12.5, withoutCrewFill: "10س 25د", withoutCrewPlusLucky: "5س 25د", sailor: "5س 25د", sailorPlusLucky: "2س 42.5د", fishTypes: ["الناجل", "الحريد"] },
  { level: 13, name: "سفينة الإمبراطور", storageCapacity: 18000, storageWithLucky: 36000, withoutCrewFishing: 15, sailorFishing: 15, withoutCrewFill: "12س 30د", withoutCrewPlusLucky: "6س 30د", sailor: "6س 30د", sailorPlusLucky: "3س 15د", fishTypes: ["الصافي", "القاروص"] },
  { level: 14, name: "سفينة التيتان", storageCapacity: 20000, storageWithLucky: 40000, withoutCrewFishing: 15, sailorFishing: 15, withoutCrewFill: "12س", withoutCrewPlusLucky: "6س", sailor: "6س", sailorPlusLucky: "3س", fishTypes: ["الحمرا", "البياض"] },
  { level: 15, name: "سفينة المحيط العظيم", storageCapacity: 23000, storageWithLucky: 46000, withoutCrewFishing: 17.5, sailorFishing: 17.5, withoutCrewFill: "12س 50د", withoutCrewPlusLucky: "6س 25د", sailor: "6س 25د", sailorPlusLucky: "3س 12.5د", fishTypes: ["السيبيطي", "النهاش"] },
  { level: 16, name: "سفينة الأساطير", storageCapacity: 26000, storageWithLucky: 52000, withoutCrewFishing: 17.5, sailorFishing: 17.5, withoutCrewFill: "12س 15د", withoutCrewPlusLucky: "6س 7.5د", sailor: "6س 7.5د", sailorPlusLucky: "3س 12.5د", fishTypes: ["الشعم", "القرفان"] },
  { level: 17, name: "سفينة الملوك", storageCapacity: 29000, storageWithLucky: 58000, withoutCrewFishing: 20, sailorFishing: 20, withoutCrewFill: "13س 20د", withoutCrewPlusLucky: "6س 40د", sailor: "6س 40د", sailorPlusLucky: "3س 20د", fishTypes: ["الطرباني", "الكوفر"] },
  { level: 18, name: "سفينة الفاتح", storageCapacity: 32000, storageWithLucky: 64000, withoutCrewFishing: 20, sailorFishing: 20, withoutCrewFill: "12س 40د", withoutCrewPlusLucky: "6س 20د", sailor: "6س 20د", sailorPlusLucky: "3س 20د", fishTypes: ["العقام", "الجش"] },
  { level: 19, name: "سفينة النصر", storageCapacity: 36000, storageWithLucky: 72000, withoutCrewFishing: 22.5, sailorFishing: 22.5, withoutCrewFill: "13س 30د", withoutCrewPlusLucky: "6س 45د", sailor: "6س 45د", sailorPlusLucky: "3س 22.5د", fishTypes: ["الدراك", "الزبيدي"] },
  { level: 20, name: "سفينة المجد", storageCapacity: 40000, storageWithLucky: 80000, withoutCrewFishing: 22.5, sailorFishing: 22.5, withoutCrewFill: "12س 45د", withoutCrewPlusLucky: "6س 22.5د", sailor: "6س 22.5د", sailorPlusLucky: "3س 22.5د", fishTypes: ["الناجل الأحمر", "التونة الزرقاء"] },
  { level: 21, name: "سفينة الأرواح", storageCapacity: 45000, storageWithLucky: 90000, withoutCrewFishing: 25, sailorFishing: 25, withoutCrewFill: "1ي 1س", withoutCrewPlusLucky: "12س 30د", sailor: "12س 30د", sailorPlusLucky: "6س 15د", fishTypes: ["ماهي ماهي", "البراكودا", "الوقار"] },
  { level: 22, name: "سفينة الظلام", storageCapacity: 50000, storageWithLucky: 100000, withoutCrewFishing: 25, sailorFishing: 25, withoutCrewFill: "1ي 9س 20د", withoutCrewPlusLucky: "16س 40د", sailor: "16س 40د", sailorPlusLucky: "8س 20د", fishTypes: ["الهلبوت", "التونة الصفراء", "المارلن الأبيض"] },
  { level: 23, name: "سفينة البحرية الملكية", storageCapacity: 55000, storageWithLucky: 110000, withoutCrewFishing: 26, sailorFishing: 26, withoutCrewFill: "1ي 18س 28د", withoutCrewPlusLucky: "21س 40د", sailor: "21س 40د", sailorPlusLucky: "10س 50د", fishTypes: ["الشفنين", "المارلن الأسود", "المارلن الأزرق"] },
  { level: 24, name: "سفينة المحيط الأزرق", storageCapacity: 60000, storageWithLucky: 120000, withoutCrewFishing: 26, sailorFishing: 26, withoutCrewFill: "2ي 32د", withoutCrewPlusLucky: "1ي 16س", sailor: "1ي 16س", sailorPlusLucky: "12س 8د", fishTypes: ["سمكة نابليون", "التونة كبيرة العين", "سمكة الشراع"] },
  { level: 25, name: "سفينة الرعد", storageCapacity: 65000, storageWithLucky: 130000, withoutCrewFishing: 27, sailorFishing: 27, withoutCrewFill: "2ي 7س 48د", withoutCrewPlusLucky: "1ي 3س 54د", sailor: "1ي 3س 54د", sailorPlusLucky: "13س 57د", fishTypes: ["قرش الشعاب", "قرش الليمون", "قرش المطرقة"] },
  { level: 26, name: "سفينة التنين الذهبي", storageCapacity: 70000, storageWithLucky: 140000, withoutCrewFishing: 27, sailorFishing: 27, withoutCrewFill: "2ي 12س 18د", withoutCrewPlusLucky: "1ي 6س 9د", sailor: "1ي 6س 9د", sailorPlusLucky: "15س 18د", fishTypes: ["القرش الأزرق", "قرش الثور", "قرش النمر"] },
  { level: 27, name: "سفينة الإعصار", storageCapacity: 75000, storageWithLucky: 150000, withoutCrewFishing: 28, sailorFishing: 28, withoutCrewFill: "2ي 19س 12د", withoutCrewPlusLucky: "1ي 9س 36د", sailor: "1ي 9س 36د", sailorPlusLucky: "16س 48د", fishTypes: ["قرش ماكو", "القرش المحيطي", "القرش الأبيض"] },
  { level: 28, name: "سفينة القيصر", storageCapacity: 80000, storageWithLucky: 160000, withoutCrewFishing: 28, sailorFishing: 28, withoutCrewFill: "2ي 22س", withoutCrewPlusLucky: "1ي 11س 28د", sailor: "1ي 11س 28د", sailorPlusLucky: "17س 44د", fishTypes: ["شيطان البحر", "سمكة الشمس", "قرش الحوت"] },
  { level: 29, name: "سفينة أساطير البحر", storageCapacity: 85000, storageWithLucky: 170000, withoutCrewFishing: 29, sailorFishing: 29, withoutCrewFill: "3ي 4س 22د", withoutCrewPlusLucky: "1ي 14س 11د", sailor: "1ي 14س 11د", sailorPlusLucky: "19س 20د", fishTypes: ["الحوت الأبيض", "الحوت الأحدب", "حوت العنبر"] },
  { level: 30, name: "سفينة سيد البحار", storageCapacity: 90000, storageWithLucky: 180000, withoutCrewFishing: 29, sailorFishing: 29, withoutCrewFill: "3ي 7س 16د", withoutCrewPlusLucky: "1ي 15س 38د", sailor: "1ي 15س 38د", sailorPlusLucky: "19س 49د", fishTypes: ["الحوت الرمادي", "الحوت مقوس الرأس", "الحوت الأزرق"] },
  { level: 31, name: "سفينة ملوك المحيط", description: "مفخرة ملوك المحيط الخارقة والنهائية", storageCapacity: 100000, storageWithLucky: 200000, withoutCrewFishing: 30, sailorFishing: 30, withoutCrewFill: "3ي 8س", withoutCrewPlusLucky: "1ي 16س", sailor: "1ي 16س", sailorPlusLucky: "20س", fishTypes: ["الحوت القاتل", "الحوت الأسطوري", "الحوت الصيني"] }
];

export const getShipDataByLevel = (level: number): ShipData | undefined => {
  return shipsData.find((ship) => ship.level === level);
};

export const SHOP_SHIPS: ShopShipSpec[] = [
  { level: 0, name: 'قارب خشبي متهالك', subName: 'قارب خشبي متهالك للمبتدئين وبداية المغامرة', hook: 25, cargo: 2000, heart: 200, durationStr: '00:30', power: 5, armor: 5, fishTypes: ['السردين'], price: 0, emoji: '🛶', image: "/ships/ship_00.webp" },
  { level: 1, name: 'قارب الصياد', subName: 'قارب صيد خشبي تقليدي', hook: 50, cargo: 2000, heart: 500, durationStr: '01:00', power: 10, armor: 10, fishTypes: ['السردين'], price: 400, emoji: '🛶', image: "/ships/ship_01.webp" },
  { level: 2, name: 'قارب شراعي صغير', subName: 'قارب شراعي خفيف سريع', hook: 100, cargo: 3000, heart: 1000, durationStr: '09:14', power: 20, armor: 20, fishTypes: ['الأنشوجة'], price: 1500, emoji: '⛵', image: "/ships/ship_02.webp" },
  { level: 3, name: 'مركب شراعي', subName: 'مركب شراعي متين للبحار القريبة', hook: 200, cargo: 4000, heart: 2000, durationStr: '17:29', power: 40, armor: 40, fishTypes: ['الماكريل'], price: 4000, emoji: '⛵', image: "/ships/ship_03.webp" },
  { level: 4, name: 'مركب شراعي متوسط', subName: 'مركب شراعي عريض ومستقر', hook: 400, cargo: 5000, heart: 4000, durationStr: '25:43', power: 80, armor: 80, fishTypes: ['البلطي'], price: 9000, emoji: '⛵', image: "/ships/ship_04.webp" },
  { level: 5, name: 'سفينة تجارية صغيرة', subName: 'سفينة تجارية بحجم مدمج للربح السريع', hook: 800, cargo: 6000, heart: 8000, durationStr: '33:58', power: 160, armor: 160, fishTypes: ['الشعري'], price: 18000, emoji: '🚢', image: "/ships/ship_05.webp" },
  { level: 6, name: 'سفينة تجارية متوسطة', subName: 'سفينة تجارية بسعة تخزين مضاعفة', hook: 1500, cargo: 7000, heart: 15000, durationStr: '42:12', power: 300, armor: 300, fishTypes: ['الكنعد'], price: 35000, emoji: '🚢', image: "/ships/ship_06.webp" },
  { level: 7, name: 'سفينة حربية خفيفة', subName: 'حراقة سريعة ومسلحة بمدافع خفيفة', hook: 3000, cargo: 8000, heart: 30000, durationStr: '50:27', power: 600, armor: 600, fishTypes: ['الهامور'], price: 60000, emoji: '⚔️', image: "/ships/ship_07.webp" },
  { level: 8, name: 'سفينة حربية متوسطة', subName: 'فرقاطة حديدية للهجوم والدفاع المتوازن', hook: 6000, cargo: 9000, heart: 60000, durationStr: '58:41', power: 1200, armor: 1200, fishTypes: ['السلمون'], price: 100000, emoji: '⚔️', image: "/ships/ship_08.webp" },
  { level: 9, name: 'سفينة ملكية', subName: 'سفينة التاج المزينة بأفخم الأخشاب', hook: 10000, cargo: 10000, heart: 100000, durationStr: '1h 6m', power: 2000, armor: 2000, fishTypes: ['التونة'], price: 160000, emoji: '👑', image: "/ships/ship_09.webp" },
  { level: 10, name: 'سفينة أسطول', subName: 'سفينة قيادة الأساطيل البحرية الكبرى', hook: 20000, cargo: 12000, heart: 200000, durationStr: '1h 15m', power: 4000, armor: 4000, fishTypes: ['أبو سيف'], price: 250000, emoji: '⚓', image: "/ships/ship_10.webp" },
  { level: 11, name: 'سفينة أسطورية', subName: 'سفينة خارقة يتردد صداها في البحار السبعة', hook: 40000, cargo: 14000, heart: 400000, durationStr: '1h 23m', power: 8000, armor: 8000, fishTypes: ['البوري', 'السيجان'], price: 380000, emoji: '🌌', image: "/ships/ship_11.webp" },
  { level: 12, name: 'سفينة التنين', subName: 'مدمرة مصممة على شكل رأس تنين مهيب', hook: 80000, cargo: 16000, heart: 800000, durationStr: '1h 31m', power: 16000, armor: 16000, fishTypes: ['الناجل', 'الحريد'], price: 550000, emoji: '🐉', image: "/ships/ship_12.webp" },
  { level: 13, name: 'سفينة الإمبراطور', subName: 'سفينة الحرب والسطوة الإمبراطورية العظمى', hook: 160000, cargo: 18000, heart: 1600000, durationStr: '1h 39m', power: 32000, armor: 32000, fishTypes: ['الصافي', 'القاروص'], price: 750000, emoji: '🔱', image: "/ships/ship_13.webp" },
  { level: 14, name: 'سفينة التيتان', subName: 'جبل عائم من الفولاذ الحربي المدمر', hook: 320000, cargo: 20000, heart: 3200000, durationStr: '1h 48m', power: 64000, armor: 64000, fishTypes: ['الحمرا', 'البياض'], price: 1000000, emoji: '🏛️', image: "/ships/ship_14.webp" },
  { level: 15, name: 'سفينة المحيط العظيم', subName: 'حاكمة المحيطات العميقة والرياح العاتية', hook: 640000, cargo: 23000, heart: 6400000, durationStr: '1h 56m', power: 128000, armor: 128000, fishTypes: ['السيبيطي', 'النهاش'], price: 1250000, emoji: '🌊', image: "/ships/ship_15.webp" },
  { level: 16, name: 'سفينة الأساطير', subName: 'درع الأساطير الحصين ضد كافة المخاطر', hook: 1280000, cargo: 26000, heart: 12800000, durationStr: '2h 4m', power: 256000, armor: 256000, fishTypes: ['الشعم', 'القرفان'], price: 1450000, emoji: '🛡️', image: "/ships/ship_16.webp" },
  { level: 17, name: 'سفينة الملوك', subName: 'جوهرة الأسطول المخصصة لملوك السلالات البحرية', hook: 2560000, cargo: 29000, heart: 25600000, durationStr: '2h 12m', power: 512000, armor: 512000, fishTypes: ['الطرباني', 'الكوفر'], price: 1650000, emoji: '👑', image: "/ships/ship_17.webp" },
  { level: 18, name: 'سفينة الفاتح', subName: 'سفينة الفاتح الأسطورية', hook: 5120000, cargo: 32000, heart: 51200000, durationStr: '2h 20m', power: 102400, armor: 102400, fishTypes: ['العقام', 'الجش'], price: 1800000, emoji: '🎖️', image: "/ships/ship_18.webp", rarity: 'ملحمي', description: 'سفينة الفتح العظيم، تقود طلائع الحرب لفتح الممرات البحرية المغلقة وتأمين مسارات الصيد...' },
  { level: 19, name: 'سفينة النصر', subName: 'راية النصر التي لا تنكس في معركة', hook: 10240000, cargo: 36000, heart: 102400000, durationStr: '2h 28m', power: 204800, armor: 204800, fishTypes: ['الدراك', 'الزبيدي'], price: 2100000, emoji: '🏆', image: "/ships/ship_19.webp", rarity: 'ملحمي', description: 'سفينة النصر المجيد، ترفع راية الفوز في كافة المعارك وتجلب غنائم طائلة للحاكم.' },
  { level: 20, name: 'سفينة المجد', subName: 'شعلة المجد الخالدة في أعالي البحار', hook: 20480000, cargo: 40000, heart: 204800000, durationStr: '2h 36m', power: 409600, armor: 409600, fishTypes: ['الناجل الأحمر', 'التونة الزرقاء'], price: 2500000, emoji: '✨', image: "/ships/ship_20.webp", rarity: 'ملحمي', description: 'سفينة متوهجة بأنوار المجد، ترهب وحوش المحيط السحيق وتملك متانة لا تضاهى لتخزين الذهب.' },
  { level: 21, name: 'سفينة الأرواح', subName: 'سفينة الأرواح الهائمة الأسطورية', hook: 40960000, cargo: 45000, heart: 409600000, durationStr: '2h 44m', power: 819200, armor: 819200, fishTypes: ['ماهي ماهي', 'البراكودا', 'الوقار'], price: 2900000, emoji: '👻', image: "/ships/ship_21.webp", rarity: 'ملحمي', description: 'سفينة مهيبة غامضة تسري كالشبح في أعتم الليالي، ويخشى الأعداء مواجهتها في عرض المحيط.' },
  { level: 22, name: 'سفينة الظلام', subName: 'شبح الظلام الهامس الحالك', hook: 81920000, cargo: 50000, heart: 819200000, durationStr: '2h 52m', power: 1638400, armor: 1638400, fishTypes: ['الهلبوت', 'التونة الصفراء', 'المارلن الأبيض'], price: 3400000, emoji: '🖤', image: "/ships/ship_22.webp", rarity: 'ملحمي', description: 'سفينة مظلمة غامضة تسير بصمت كالشبح في أعماق البحار، قادرة على مباغتة الأعداء بضربات مدمرة...' },
  { level: 23, name: 'سفينة البحرية الملكية', subName: 'حامية العرش البحري والعدالة المطلقة', hook: 163840000, cargo: 55000, heart: 1638400000, durationStr: '3h 0m', power: 3276800, armor: 3276800, fishTypes: ['الشفنين', 'المارلن الأسود', 'المارلن الأزرق'], price: 3800000, emoji: '🛡️', image: "/ships/ship_23.webp", rarity: 'ملحمي', description: 'فخر البحرية الملكية الحصين والمجهز بأحدث المدافع الثقيلة لتدمير قراصنة البحار السبعة...' },
  { level: 24, name: 'سفينة المحيط الأزرق', subName: 'سفينة تجتاح الموج الأزرق الهائج', hook: 327680000, cargo: 60000, heart: 3276800000, durationStr: '3h 8m', power: 6553600, armor: 6553600, fishTypes: ['سمكة نابليون', 'التونة كبيرة العين', 'سمكة الشراع'], price: 4200000, emoji: '🌊', image: "/ships/ship_24.webp", rarity: 'أسطوري', description: 'سفينة أسطورية تجتاح المحيط وتصمد أمام أكبر الوحوش البحرية والأمواج العاتية...' },
  { level: 25, name: 'سفينة الرعد', subName: 'غضب الصواعق المبرق في عرض البحر', hook: 655360000, cargo: 65000, heart: 6553600000, durationStr: '3h 16m', power: 13107200, armor: 13107200, fishTypes: ['قرش الشعاب', 'قرش الليمون', 'قرش المطرقة'], price: 4800000, emoji: '⚡', image: "/ships/ship_25.webp", rarity: 'أسطوري', description: 'تضرب كالصاعقة الخاطفة وتتحرك بسرعة فائقة لتفتك بكل من يقف في طريقها...' },
  { level: 26, name: 'سفينة التنين الذهبي', subName: 'التنين الذهبي المجنح حارس الكنز', hook: 1310720000, cargo: 70000, heart: 13107200000, durationStr: '3h 24m', power: 26214400, armor: 26214400, fishTypes: ['القرش الأزرق', 'قرش الثور', 'قرش النمر'], price: 5500000, emoji: '🐉', image: "/ships/ship_26.webp", rarity: 'أسطوري', description: 'سفينة التنين الذهبي المجنح، تحرس الكنوز العظيمة وتتمتع بقوة خيالية وسعة تخزين عملاقة للغاية...' },
  { level: 27, name: 'سفينة الإعصار', subName: 'سفينة الإعصار والبرق العاصف', hook: 2621440000, cargo: 75000, heart: 26214400000, durationStr: '3h 32m', power: 52428800, armor: 52428800, fishTypes: ['قرش ماكو', 'القرش المحيطي', 'القرش الأبيض'], price: 6200000, emoji: '⛈️', image: "/ships/ship_27.webp", rarity: 'أسطوري', description: 'تمخر عباب أعنف الأعاصير والعواصف دون تردد، زارعاً الرعب في قلوب المهاجمين...' },
  { level: 28, name: 'سفينة القيصر', subName: 'الحصن القيصري المصفح الفخم', hook: 5242880000, cargo: 80000, heart: 52428800000, durationStr: '3h 40m', power: 104857600, armor: 104857600, fishTypes: ['شيطان البحر', 'سمكة الشمس', 'قرش الحوت'], price: 7000000, emoji: '👑', image: "/ships/ship_28.webp", rarity: 'أسطوري', description: 'بنيت لتكون قلعة عائمة غير قابلة للاختراق، تحمي كنوز الإمبراطورية وتجمع الذهب بلا حدود...' },
  { level: 29, name: 'سفينة أساطير البحر', subName: 'ملحمة أساطير البحر الغابرة', hook: 10485760000, cargo: 85000, heart: 104857600000, durationStr: '3h 48m', power: 209715200, armor: 209715200, fishTypes: ['الحوت الأبيض', 'الحوت الأحدب', 'حوت العنبر'], price: 8000000, emoji: '🔱', image: "/ships/ship_29.webp", rarity: 'أسطوري', description: 'سفينة حيكت حولها مئات الأساطير، تكتسح مياه المحيط بمهابة وجبروت وتجذب أندر الكائنات...' },
  { level: 30, name: 'سفينة سيد البحار', subName: 'الحاكم والمسيطر الأوحد على أعماق المحيط', hook: 20971520000, cargo: 90000, heart: 209715200000, durationStr: '3h 56m', power: 419430400, armor: 419430400, fishTypes: ['الحوت الرمادي', 'الحوت مقوس الرأس', 'الحوت الأزرق'], price: 9500000, emoji: '🌊', image: "/ships/ship_30.webp", rarity: 'أسطوري', description: 'يرتجف المحيط خوفاً من هدير محركاتها وقوتها التدميرية المطلقة وسعتها العملاقة للذهب...' },
  { level: 31, name: 'سفينة ملوك المحيط', subName: 'مفخرة ملوك المحيط الخارقة والنهائية', hook: 41943040000, cargo: 100000, heart: 419430400000, durationStr: '4h 5m', power: 838860800, armor: 838860800, fishTypes: ['الحوت القاتل', 'الحوت الأسطوري', 'الحوت الصيني'], price: 12000000, emoji: '👑', image: "/ships/ship_31.webp", rarity: 'أسطورة', description: 'أعظم سفينة صُنعت في التاريخ، قوة دمار شامل وسعة ذهب أسطورية غير متناهية تمثل التتويج الأقصى لأي قبطان محترف للبحار السبعة الكبرى...' },
  { level: 32, name: 'غواصة الأعماق الأسطورية 32', subName: 'الغواصة الحربية الخارقة حارسة الهاوية والأعماق السحيقة', hook: 83886080000, cargo: 125000, heart: 838860800000, durationStr: '4h 15m', power: 1677721600, armor: 1677721600, fishTypes: ['الحوت القاتل', 'الحوت الأسطوري', 'الحوت الصيني'], price: 15000000, emoji: '🤿', image: "/ships/ship_32.webp", rarity: 'أسطورة', description: 'غواصة الأعماق السحيقة التكتيكية الفائقة، قادرة على الهبوط لأعمق نقاط البحر الميت وجمع أغلى المرجانيات والكنوز الغارقة مع صيانة ذاتية مستمرة وقوة تدميرية هائلة.' },
  { level: 33, name: 'غواصة الأعماق الأسطورية 33', subName: 'غواصة الأعماق الأسطورية (المستوى الثاني المطور)', hook: 167772160000, cargo: 150000, heart: 1677721600000, durationStr: '4h 30m', power: 3355443200, armor: 3355443200, fishTypes: ['الحوت القاتل', 'الحوت الأسطوري', 'الحوت الصيني'], price: 25000000, emoji: '🤿', image: "/ships/ship_33.webp", rarity: 'أسطورة', description: 'المستوى الثاني الخارق والمطور لغواصة الأعماق الأسطورية، مجهزة بهيكل معدني معزز وقوة شفط بصرية هائلة لجمع نوادر المحيط السحيق.' },
  { level: 34, name: 'غواصة الأعماق الأسطورية 34', subName: 'غواصة الأعماق الأسطورية (المستوى الثالث المطوّر)', hook: 335544320000, cargo: 175000, heart: 3355443200000, durationStr: '4h 45m', power: 6710886400, armor: 6710886400, fishTypes: ['الحوت القاتل', 'الحوت الأسطوري', 'الحوت الصيني'], price: 40000000, emoji: '🤿', image: "/ships/ship_34.webp", rarity: 'أسطورة', description: 'المستوى الثالث الخارق والأعظم على الإطلاق لغواصة الأعماق الأسطورية، مصفحة كلياً بالتيتانيوم المهجن مع أنظمة صيد نووية متطورة لكشف أسرار قاع المحيط.' },
  { level: 35, name: 'غواصة الأعماق الأسطورية 35', subName: 'غواصة الأعماق الأسطورية (المستوى الرابع المطوّر)', hook: 671088640000, cargo: 200000, heart: 6710886400000, durationStr: '5h 0m', power: 13421772800, armor: 13421772800, fishTypes: ['الحوت القاتل', 'الحوت الأسطوري', 'الحوت الصيني'], price: 60000000, emoji: '🤿', image: "/ships/ship_35.webp", rarity: 'أسطورة', description: 'المستوى الرابع الخارق والنهائي لغواصة الأعماق الأسطورية، مدمجة بنواة طاقة بلازما متكاملة وهيكل من مادة الفايرونيوم الصلبة لتحدي أقسى ظروف الجاذبية في قاع الهاوية.' }
];

export interface FishHouseLevel {
  level: number;
  capacity: number;
  cost: number;
}

export const FISH_HOUSE_BASE_URL = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/FISH/refs/heads/main/level-";

export const getFishHouseImageUrl = (level: number) => {
  const currentLevel = Math.max(1, Math.min(Number(level) || 1, 35));
  const formattedLevelNum = String(currentLevel).padStart(2, '0');
  return `${FISH_HOUSE_BASE_URL}${formattedLevelNum}.png`;
};

export const FISH_HOUSE_LEVELS: FishHouseLevel[] = Array.from({ length: 31 }, (_, i) => {
  const lvl = i + 1;
  return {
    level: lvl,
    capacity: getFishHouseCapacity(lvl),
    cost: lvl * 500,
  };
});

export const GOLD_COIN_ICON = "/icons/res/gold-coin.webp";
export const GEM_ICON = "/icons/res/gem.webp";
export const PIRATE_SHOP_BG = "/backgrounds/pirate_shop_bg.webp";
export const WAREHOUSE_BG = "/backgrounds/warehouse_bg.webp";
export const SHIP_BACKGROUND_IMAGE = "/backgrounds/ship_bg.webp";
export const WEAPON_SMALL_MISSILE_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/weapon-missile-small.png";
export const WEAPON_SMALL_MISSILE_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/03_small_rocket_background_no_weapon.png";
export const WEAPON_MEDIUM_MISSILE_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/weapon-missile-medium.png";
export const WEAPON_MEDIUM_MISSILE_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/04_medium_rocket_background_no_weapon.png";
export const WEAPON_LARGE_MISSILE_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/weapon-missile-large.png";
export const WEAPON_LARGE_MISSILE_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/05_large_rocket_background_no_weapon.png";
export const WEAPON_MEDIA_BOMB_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/weapon-media-bomb.png";
export const WEAPON_MEDIA_BOMB_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/01_explosive_chest_background_no_weapon.png";
export const WEAPON_ATOMIC_BOMB_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/weapon-atomic-bomb.png";
export const WEAPON_ATOMIC_BOMB_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/02_sea_mine_background_no_weapon.png";

export interface WeaponItemData {
  id: string;
  key: string;
  name: string;
  damage: number;
  price: number;
  costType: 'gems' | 'gold';
  icon: string;
  image: string;
  bgImage?: string;
  desc: string;
}

export const WEAPONS_DATA: WeaponItemData[] = [
  {
    id: 'adBomb',
    key: 'adBomb',
    name: 'رسالة التفجير',
    damage: 20000,
    price: 50,
    costType: 'gems',
    icon: '📡',
    image: WEAPON_MEDIA_BOMB_ICON,
    bgImage: WEAPON_MEDIA_BOMB_BG,
    desc: 'رسالة تفجيرية فتاكة تلحق 20,000 ضرر بأسطول العدو',
  },
  {
    id: 'atomicBomb',
    key: 'atomicBomb',
    name: 'قنبلة الموت الأسود',
    damage: 70000,
    price: 150,
    costType: 'gems',
    icon: '💣',
    image: WEAPON_ATOMIC_BOMB_ICON,
    bgImage: WEAPON_ATOMIC_BOMB_BG,
    desc: 'قنبلة الموت الأسود الكاسحة تلحق 70,000 ضرر وتدمر الميناء بالكامل',
  },
  {
    id: 'smallRocket',
    key: 'smallRocket',
    name: 'صاروخ صغير',
    damage: 1000,
    price: 100000,
    costType: 'gold',
    icon: '🚀',
    image: WEAPON_SMALL_MISSILE_ICON,
    bgImage: WEAPON_SMALL_MISSILE_BG,
    desc: 'صاروخ صغير وسريع لتوجيه ضربة مباشرة تلحق 1,000 ضرر',
  },
  {
    id: 'mediumRocket',
    key: 'mediumRocket',
    name: 'صاروخ المتوسط',
    damage: 5000,
    price: 200000,
    costType: 'gold',
    icon: '🚀',
    image: WEAPON_MEDIUM_MISSILE_ICON,
    bgImage: WEAPON_MEDIUM_MISSILE_BG,
    desc: 'صاروخ متوسط القوة يخترق الدروع ويلحق 5,000 ضرر بهيكل السفينة',
  },
  {
    id: 'largeRocket',
    key: 'largeRocket',
    name: 'صاروخ كبير',
    damage: 100000,
    price: 300000,
    costType: 'gold',
    icon: '🚀',
    image: WEAPON_LARGE_MISSILE_ICON,
    bgImage: WEAPON_LARGE_MISSILE_BG,
    desc: 'صاروخ كبير فتاك يزلزل الدفاعات ويلحق 100,000 ضرر',
  },
];
export const SHIP_GUARDIAN_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/ship-guardian-cutout.png";
export const SHIP_GUARDIAN_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/pirate-card-background-extracted.jpg.png";
export const FIXER_SMALL_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-small-mechanic.png";
export const FIXER_SMALL_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-small-mechanic.jpg.png";
export const FIXER_MEDIUM_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-mid-mechanic.png";
export const FIXER_MEDIUM_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-mid-mechanic.jpg.png";
export const FIXER_LARGE_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-big-mechanic.png";
export const FIXER_LARGE_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-big-mechanic.jpg.png";
export const FIXER_LEGENDARY_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-legendary-mechanic.png";
export const FIXER_LEGENDARY_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-legendary-mechanic.jpg.png";
export const SAILOR_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-sailor.png";
export const SAILOR_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-sailor.jpg.png";
export const GOLDEN_HUNTER_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-golden-hunter.png";
export const GOLDEN_HUNTER_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-golden-hunter.jpg%20(1).png";
export const MARKET_EXPERT_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-market-expert.png";
export const MARKET_EXPERT_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-market-expert.jpg.png";
export const LUCK_PIRATE_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-luck-pirate.png";
export const LUCK_PIRATE_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-luck-pirate.jpg%20(1).png";
export const SHIP_PILOT_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-ship-pilot.png";
export const SHIP_PILOT_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-ship-pilot.jpg.png";
export const SHIP_THIEF_ICON = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/person-ship-thief.png";
export const SHIP_THIEF_BG = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/bg-ship-thief.jpg.png";

export interface CrewMemberSpec {
  id: string;
  title: string;
  desc: string;
  price: number;
  costType: 'gold' | 'gems';
  icon: string;
  image?: string;
  bgImage?: string;
}

export const CREW_SHOP_ITEMS: CrewMemberSpec[] = [
  {
    id: 'thief',
    title: 'السارق (حرامي السفن)',
    desc: 'يمكّن سفنك من التسلل والسرقة من أساطيل الآخرين، إلا إذا كان الهدف يمتلك شرطياً لحمايته',
    price: 30,
    costType: 'gems',
    icon: '🥷',
    image: SHIP_THIEF_ICON,
    bgImage: SHIP_THIEF_BG,
  },
  {
    id: 'guide',
    title: 'مرشد السفينة',
    desc: 'يتوقع ويوحد نوع سمك واحد تجلبه وتصطاده جميع سفن الأسطول في رحلات الصيد',
    price: 600000,
    costType: 'gold',
    icon: '🧭',
    image: SHIP_PILOT_ICON,
    bgImage: SHIP_PILOT_BG,
  },
  {
    id: 'luck',
    title: 'الحظ السعيد',
    desc: 'يضاعف صيد السفينة من الأسماك بنسبة 100% (مثال: صيد 2,000 يصبح 4,000 سمكة)',
    price: 60,
    costType: 'gems',
    icon: '🍀',
    image: LUCK_PIRATE_ICON,
    bgImage: LUCK_PIRATE_BG,
  },
  {
    id: 'cop',
    title: 'الشرطي (حامي السفن)',
    desc: 'يحمي سفنك وأسطولك بالكامل من سرقة أي شخص آخر ويحبط محاولات التسلل بنسبة 100%',
    price: 35,
    costType: 'gems',
    icon: '👮‍♂️',
    image: SHIP_GUARDIAN_ICON,
    bgImage: SHIP_GUARDIAN_BG,
  },
  {
    id: 'sailor',
    title: 'البحار',
    desc: 'يسرع صيد السفن ويقلص مدة رحلات الصيد بنسبة 50% (مثال: 50 دقيقة تصبح 25 دقيقة)',
    price: 550000,
    costType: 'gold',
    icon: '⚓',
    image: SAILOR_ICON,
    bgImage: SAILOR_BG,
  },
  {
    id: 'fixer_sm',
    title: 'مصلح صغير',
    desc: 'يصلح ويزيد 500 نقطة طاقة وهيكل للسفينة مباشرة من الصفر',
    price: 200000,
    costType: 'gold',
    icon: '🛠️',
    image: FIXER_SMALL_ICON,
    bgImage: FIXER_SMALL_BG,
  },
  {
    id: 'fixer_md',
    title: 'مصلح وسط',
    desc: 'يصلح نصف طاقة السفينة (50%)، أو يعطي 1,000 نقطة مباشرة إذا كانت طاقة السفينة 0',
    price: 700000,
    costType: 'gold',
    icon: '🔨',
    image: FIXER_MEDIUM_ICON,
    bgImage: FIXER_MEDIUM_BG,
  },
  {
    id: 'fixer_lg',
    title: 'مصلح كبير',
    desc: 'يصلح سفينة واحدة بالكامل 100% ويعيد كامل طاقتها وهيكلها مهما كان الضرر',
    price: 1200000,
    costType: 'gold',
    icon: '⚙️',
    image: FIXER_LARGE_ICON,
    bgImage: FIXER_LARGE_BG,
  },
  {
    id: 'fixer_epic',
    title: 'مصلح أسطوري',
    desc: 'يصلح ويرفع كامل طاقة وهيكل جميع سفن الأسطول دفعة واحدة 100% بنقرة واحدة',
    price: 200,
    costType: 'gems',
    icon: '👑',
    image: FIXER_LEGENDARY_ICON,
    bgImage: FIXER_LEGENDARY_BG,
  },
  {
    id: 'market_expert',
    title: 'خبير الأسواق',
    desc: 'يزيد أرباح بيع الأسماك والموارد في السوق بنسبة +25%',
    price: 900,
    costType: 'gems',
    icon: '📈',
    image: MARKET_EXPERT_ICON,
    bgImage: MARKET_EXPERT_BG,
  },
  {
    id: 'golden_hunter',
    title: 'الصياد الذهبي',
    desc: 'صيد وجمع تلقائي ذكي ومستمر للأسماك على مدار الساعة دون توقف!',
    price: 1000,
    costType: 'gems',
    icon: '🔱',
    image: GOLDEN_HUNTER_ICON,
    bgImage: GOLDEN_HUNTER_BG,
  },
];

export interface FishRewardItem {
  fullName: string;
  valPerFish: number;
  emoji: string;
}

export const FISH_REWARD_DATA: Record<string, FishRewardItem> = {
  // المستوى 1
  'السردين': { fullName: 'السردين 🐟', valPerFish: 1, emoji: '🐟' },
  'سردين': { fullName: 'السردين 🐟', valPerFish: 1, emoji: '🐟' },

  // المستوى 2
  'الأنشوجة': { fullName: 'الأنشوجة 🐟', valPerFish: 2, emoji: '🐟' },
  'أنشوجة': { fullName: 'الأنشوجة 🐟', valPerFish: 2, emoji: '🐟' },

  // المستوى 3
  'الماكريل': { fullName: 'الماكريل 🐟', valPerFish: 3, emoji: '🐟' },
  'ماكريل': { fullName: 'الماكريل 🐟', valPerFish: 3, emoji: '🐟' },

  // المستوى 4
  'البلطي': { fullName: 'البلطي 🐟', valPerFish: 4, emoji: '🐟' },
  'بلطي': { fullName: 'البلطي 🐟', valPerFish: 4, emoji: '🐟' },

  // المستوى 5
  'الشعري': { fullName: 'الشعري 🐟', valPerFish: 5, emoji: '🐟' },
  'شعري': { fullName: 'الشعري 🐟', valPerFish: 5, emoji: '🐟' },

  // المستوى 6
  'الكنعد': { fullName: 'الكنعد 🐟', valPerFish: 6, emoji: '🐟' },
  'كنعد': { fullName: 'الكنعد 🐟', valPerFish: 6, emoji: '🐟' },

  // المستوى 7
  'الهامور': { fullName: 'الهامور 🐠', valPerFish: 7, emoji: '🐠' },
  'هامور': { fullName: 'الهامور 🐠', valPerFish: 7, emoji: '🐠' },

  // المستوى 8
  'السلمون': { fullName: 'السلمون 🐟', valPerFish: 8, emoji: '🐟' },
  'سلمون': { fullName: 'السلمون 🐟', valPerFish: 8, emoji: '🐟' },

  // المستوى 9
  'التونة': { fullName: 'التونة 🐟', valPerFish: 9, emoji: '🐟' },
  'تونة': { fullName: 'التونة 🐟', valPerFish: 9, emoji: '🐟' },

  // المستوى 10
  'أبو سيف': { fullName: 'أبو سيف ⚔️', valPerFish: 10, emoji: '⚔️' },

  // المستوى 11
  'البوري': { fullName: 'البوري 🐟', valPerFish: 10, emoji: '🐟' },
  'بوري': { fullName: 'البوري 🐟', valPerFish: 10, emoji: '🐟' },
  'السيجان': { fullName: 'السيجان 🐠', valPerFish: 11, emoji: '🐠' },
  'سيجان': { fullName: 'السيجان 🐠', valPerFish: 11, emoji: '🐠' },

  // المستوى 12
  'الناجل': { fullName: 'الناجل 🐠', valPerFish: 11, emoji: '🐠' },
  'ناجل': { fullName: 'الناجل 🐠', valPerFish: 11, emoji: '🐠' },
  'الحريد': { fullName: 'الحريد 🐠', valPerFish: 12, emoji: '🐠' },
  'حريد': { fullName: 'الحريد 🐠', valPerFish: 12, emoji: '🐠' },

  // المستوى 13
  'الصافي': { fullName: 'الصافي 🐟', valPerFish: 12, emoji: '🐟' },
  'صافي': { fullName: 'الصافي 🐟', valPerFish: 12, emoji: '🐟' },
  'القاروص': { fullName: 'القاروص 🐟', valPerFish: 13, emoji: '🐟' },
  'قاروص': { fullName: 'القاروص 🐟', valPerFish: 13, emoji: '🐟' },

  // المستوى 14
  'الحمرا': { fullName: 'الحمرا 🐟', valPerFish: 13, emoji: '🐟' },
  'حمرا': { fullName: 'الحمرا 🐟', valPerFish: 13, emoji: '🐟' },
  'البياض': { fullName: 'البياض 🐟', valPerFish: 14, emoji: '🐟' },
  'بياض': { fullName: 'البياض 🐟', valPerFish: 14, emoji: '🐟' },

  // المستوى 15
  'السيبيطي': { fullName: 'السيبيطي 🐟', valPerFish: 14, emoji: '🐟' },
  'سيبيطي': { fullName: 'السيبيطي 🐟', valPerFish: 14, emoji: '🐟' },
  'النهاش': { fullName: 'النهاش 🐟', valPerFish: 15, emoji: '🐟' },
  'نهاش': { fullName: 'النهاش 🐟', valPerFish: 15, emoji: '🐟' },

  // المستوى 16
  'الشعم': { fullName: 'الشعم 🐟', valPerFish: 15, emoji: '🐟' },
  'شعم': { fullName: 'الشعم 🐟', valPerFish: 15, emoji: '🐟' },
  'القرفان': { fullName: 'القرفان 🐠', valPerFish: 16, emoji: '🐠' },
  'قرفان': { fullName: 'القرفان 🐠', valPerFish: 16, emoji: '🐠' },

  // المستوى 17
  'الطرباني': { fullName: 'الطرباني 🐟', valPerFish: 16, emoji: '🐟' },
  'طرباني': { fullName: 'الطرباني 🐟', valPerFish: 16, emoji: '🐟' },
  'الكوفر': { fullName: 'الكوفر 🐟', valPerFish: 17, emoji: '🐟' },
  'كوفر': { fullName: 'الكوفر 🐟', valPerFish: 17, emoji: '🐟' },

  // المستوى 18
  'العقام': { fullName: 'العقام 🐟', valPerFish: 17, emoji: '🐟' },
  'عقام': { fullName: 'العقام 🐟', valPerFish: 17, emoji: '🐟' },
  'الجش': { fullName: 'الجش 🐟', valPerFish: 18, emoji: '🐟' },
  'جش': { fullName: 'الجش 🐟', valPerFish: 18, emoji: '🐟' },

  // المستوى 19
  'الدراك': { fullName: 'الدراك 🐟', valPerFish: 18, emoji: '🐟' },
  'دراك': { fullName: 'الدراك 🐟', valPerFish: 18, emoji: '🐟' },
  'الزبيدي': { fullName: 'الزبيدي 🐠', valPerFish: 19, emoji: '🐠' },
  'زبيدي': { fullName: 'الزبيدي 🐠', valPerFish: 19, emoji: '🐠' },

  // المستوى 20
  'الناجل الأحمر': { fullName: 'الناجل الأحمر 🐠', valPerFish: 19, emoji: '🐠' },
  'التونة الزرقاء': { fullName: 'التونة الزرقاء 🐟', valPerFish: 20, emoji: '🐟' },

  // المستوى 21
  'ماهي ماهي': { fullName: 'ماهي ماهي 🐠', valPerFish: 19, emoji: '🐠' },
  'البراكودا': { fullName: 'البراكودا 🦈', valPerFish: 20, emoji: '🦈' },
  'براكودا': { fullName: 'البراكودا 🦈', valPerFish: 20, emoji: '🦈' },
  'الوقار': { fullName: 'الوقار 🐟', valPerFish: 21, emoji: '🐟' },
  'وقار': { fullName: 'الوقار 🐟', valPerFish: 21, emoji: '🐟' },

  // المستوى 22
  'الهلبوت': { fullName: 'الهلبوت 🐠', valPerFish: 20, emoji: '🐠' },
  'هلبوت': { fullName: 'الهلبوت 🐠', valPerFish: 20, emoji: '🐠' },
  'التونة الصفراء': { fullName: 'التونة الصفراء 🐟', valPerFish: 21, emoji: '🐟' },
  'المارلن الأبيض': { fullName: 'المارلن الأبيض 🦈', valPerFish: 22, emoji: '🦈' },

  // المستوى 23
  'الشفنين': { fullName: 'الشفنين 🐡', valPerFish: 21, emoji: '🐡' },
  'شفنين': { fullName: 'الشفنين 🐡', valPerFish: 21, emoji: '🐡' },
  'المارلن الأسود': { fullName: 'المارلن الأسود 🦈', valPerFish: 22, emoji: '🦈' },
  'المارلن الأزرق': { fullName: 'المارلن الأزرق 🦈', valPerFish: 23, emoji: '🦈' },

  // المستوى 24
  'سمكة نابليون': { fullName: 'سمكة نابليون 🐠', valPerFish: 22, emoji: '🐠' },
  'التونة كبيرة العين': { fullName: 'التونة كبيرة العين 🐟', valPerFish: 23, emoji: '🐟' },
  'سمكة الشراع': { fullName: 'سمكة الشراع ⛵', valPerFish: 24, emoji: '⛵' },

  // المستوى 25
  'قرش الشعاب': { fullName: 'قرش الشعاب 🦈', valPerFish: 23, emoji: '🦈' },
  'قرش الليمون': { fullName: 'قرش الليمون 🦈', valPerFish: 24, emoji: '🦈' },
  'قرش المطرقة': { fullName: 'قرش المطرقة 🦈', valPerFish: 25, emoji: '🦈' },

  // المستوى 26
  'القرش الأزرق': { fullName: 'القرش الأزرق 🦈', valPerFish: 24, emoji: '🦈' },
  'قرش الثور': { fullName: 'قرش الثور 🦈', valPerFish: 25, emoji: '🦈' },
  'قرش النمر': { fullName: 'قرش النمر 🦈', valPerFish: 26, emoji: '🦈' },

  // المستوى 27
  'قرش ماكو': { fullName: 'قرش ماكو 🦈', valPerFish: 25, emoji: '🦈' },
  'القرش المحيطي': { fullName: 'القرش المحيطي 🦈', valPerFish: 26, emoji: '🦈' },
  'القرش الأبيض': { fullName: 'القرش الأبيض 🦈', valPerFish: 27, emoji: '🦈' },

  // المستوى 28
  'شيطان البحر': { fullName: 'شيطان البحر 🐡', valPerFish: 26, emoji: '🐡' },
  'سمكة الشمس': { fullName: 'سمكة الشمس ☀️', valPerFish: 27, emoji: '☀️' },
  'قرش الحوت': { fullName: 'قرش الحوت 🐋', valPerFish: 28, emoji: '🐋' },

  // المستوى 29
  'الحوت الأبيض': { fullName: 'الحوت الأبيض 🐋', valPerFish: 27, emoji: '🐋' },
  'الحوت الأحدب': { fullName: 'الحوت الأحدب 🐋', valPerFish: 28, emoji: '🐋' },
  'حوت العنبر': { fullName: 'حوت العنبر 🐋', valPerFish: 29, emoji: '🐋' },

  // المستوى 30
  'الحوت الرمادي': { fullName: 'الحوت الرمادي 🐋', valPerFish: 28, emoji: '🐋' },
  'الحوت مقوس الرأس': { fullName: 'الحوت مقوس الرأس 🐋', valPerFish: 29, emoji: '🐋' },
  'الحوت الأزرق': { fullName: 'الحوت الأزرق 🐋', valPerFish: 30, emoji: '🐋' },

  // المستوى 31
  'الحوت القاتل': { fullName: 'الحوت القاتل 🐬', valPerFish: 29, emoji: '🐬' },
  'الحوت الأسطوري': { fullName: 'الحوت الأسطوري 🌌', valPerFish: 30, emoji: '🌌' },
  'الحوت الصيني': { fullName: 'الحوت الصيني 🐉', valPerFish: 31, emoji: '🐉' },
};
