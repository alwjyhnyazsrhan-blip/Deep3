import React from 'react';

interface ShipImageProps {
  level: number;
  width?: number;
  plain?: boolean;
  fill?: boolean;
}

export interface CardRect {
  imageUrl: string;
  x: number;       // pixel X in original sheet
  y: number;       // pixel Y in original sheet
  width: number;   // pixel width in original sheet
  height: number;  // pixel height in original sheet
  sheetWidth: number;
  sheetHeight: number;
}

export const getShipCardRect = (level: number): CardRect => {
  const URL_1_TO_17 = 'https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG-20260705-WA0016.jpg';
  const URL_18_TO_31 = 'https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/IMG-20260705-WA0017.jpg';

  if (level <= 17) {
    const sheetWidth = 1149;
    const sheetHeight = 1369;
    
    // Precise grid for Levels 1-17
    const marginLeft = 13;
    const gapX = 6.5;
    const cardWidth = 181.5;
    
    const marginTop = 76;
    const gapY = 10;
    const cardHeight = 387;

    const idx = level - 1;
    const row = Math.floor(idx / 6);
    const col = idx % 6;

    return {
      imageUrl: URL_1_TO_17,
      x: marginLeft + col * (cardWidth + gapX),
      y: marginTop + row * (cardHeight + gapY),
      width: cardWidth,
      height: cardHeight,
      sheetWidth,
      sheetHeight,
    };
  } else {
    const sheetWidth = 1536;
    const sheetHeight = 1024;
    
    // Precise grid for Levels 18-31
    const marginLeft = 16;
    const gapX = 8;
    const cardWidth = 244;
    
    const marginTop = 60;
    const gapY = 10;
    const cardHeight = 298;

    if (level === 30) {
      // Level 30 is a wide card spanning the left half (3 columns wide)
      const wideCardWidth = 3 * cardWidth + 2 * gapX; // 748
      return {
        imageUrl: URL_18_TO_31,
        x: marginLeft,
        y: marginTop + 2 * (cardHeight + gapY),
        width: wideCardWidth,
        height: cardHeight,
        sheetWidth,
        sheetHeight,
      };
    } else if (level === 31) {
      // Level 31 is a wide card spanning the right half (3 columns wide)
      const wideCardWidth = 3 * cardWidth + 2 * gapX; // 748
      return {
        imageUrl: URL_18_TO_31,
        x: marginLeft + 3 * (cardWidth + gapX), // 16 + 3 * 252 = 772
        y: marginTop + 2 * (cardHeight + gapY),
        width: wideCardWidth,
        height: cardHeight,
        sheetWidth,
        sheetHeight,
      };
    } else {
      const idx = level - 18;
      const row = Math.floor(idx / 6);
      const col = idx % 6;

      return {
        imageUrl: URL_18_TO_31,
        x: marginLeft + col * (cardWidth + gapX),
        y: marginTop + row * (cardHeight + gapY),
        width: cardWidth,
        height: cardHeight,
        sheetWidth,
        sheetHeight,
      };
    }
  }
};

export const FISHERMAN_BOAT_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/ship_01.png";
export const SMALL_SAILBOAT_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/ship_02.png";
export const SAILBOAT_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/ship_03.png";
export const SUBMARINE_BASIC_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/submarine_6_saudi_classic.png";
export const SUBMARINE_UPGRADE_1_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/submarine_1_gold_saudi%20(1).png";
export const SUBMARINE_UPGRADE_2_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/submarine_2_green_aura.png";
export const SUBMARINE_UPGRADE_3_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/submarine_3_blue_aura.png";
export const SUBMARINE_UPGRADE_4_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/submarine_4_pink_aura.png";
export const SUBMARINE_UPGRADE_MAX_IMAGE = "https://raw.githubusercontent.com/alwjyhnyazsrhan-blip/my-game-assets/refs/heads/main/submarine_5_red_dragon.png";

const getLocalShipUrl = (lvl: number): string => {
  const num = Number(lvl) || 0;
  if (num === 1) {
    return FISHERMAN_BOAT_IMAGE;
  }
  if (num === 2) {
    return SMALL_SAILBOAT_IMAGE;
  }
  if (num === 3) {
    return SAILBOAT_IMAGE;
  }
  if (num === 32) {
    return SUBMARINE_BASIC_IMAGE;
  }
  if (num === 33) {
    return SUBMARINE_UPGRADE_1_IMAGE;
  }
  if (num === 34) {
    return SUBMARINE_UPGRADE_2_IMAGE;
  }
  if (num === 35) {
    return SUBMARINE_UPGRADE_3_IMAGE;
  }
  if (num === 36) {
    return SUBMARINE_UPGRADE_4_IMAGE;
  }
  if (num >= 37) {
    return SUBMARINE_UPGRADE_MAX_IMAGE;
  }
  const safeLvl = Math.max(0, Math.min(num, 31));
  return `/ships/ship_${String(safeLvl).padStart(2, '0')}.webp`;
};

const SHIP_IMAGES_1_TO_31: Record<number, string> = {
  0: '/ships/ship_00.webp',
  1: FISHERMAN_BOAT_IMAGE,
  2: SMALL_SAILBOAT_IMAGE,
  3: SAILBOAT_IMAGE,
  4: '/ships/ship_04.webp',
  5: '/ships/ship_05.webp',
  6: '/ships/ship_06.webp',
  7: '/ships/ship_07.webp',
  8: '/ships/ship_08.webp',
  9: '/ships/ship_09.webp',
  10: '/ships/ship_10.webp',
  11: '/ships/ship_11.webp',
  12: '/ships/ship_12.webp',
  13: '/ships/ship_13.webp',
  14: '/ships/ship_14.webp',
  15: '/ships/ship_15.webp',
  16: '/ships/ship_16.webp',
  17: '/ships/ship_17.webp',
  18: '/ships/ship_18.webp',
  19: '/ships/ship_19.webp',
  20: '/ships/ship_20.webp',
  21: '/ships/ship_21.webp',
  22: '/ships/ship_22.webp',
  23: '/ships/ship_23.webp',
  24: '/ships/ship_24.webp',
  25: '/ships/ship_25.webp',
  26: '/ships/ship_26.webp',
  27: '/ships/ship_27.webp',
  28: '/ships/ship_28.webp',
  29: '/ships/ship_29.webp',
  30: '/ships/ship_30.webp',
  31: '/ships/ship_31.webp',
};

const SHIP_SCALES: Record<number, number> = {
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 1.0,
  5: 1.0,
  6: 1.1,
  7: 1.05,
  8: 1.1,
  9: 1.05,
  10: 1.05,
  11: 1.05,
  12: 1.1,
  13: 1.1,
  14: 1.1,
  15: 1.25,
  16: 1.25,
  17: 1.1,
  18: 1.1,
  19: 1.1,
  20: 1.1,
  21: 1.1,
  22: 1.1,
  23: 1.1,
  24: 1.1,
  25: 1.1,
  26: 1.1,
  27: 1.1,
  28: 1.1,
  29: 1.1,
  30: 1.1,
  31: 1.1,
  32: 1.1,
  33: 1.1,
  34: 1.1,
  35: 1.1,
  36: 1.1,
  37: 1.1,
};

const SHIP_TRANSLATES: Record<number, string> = {
  15: '-15px',
  16: '-15px',
};

const ShipImage: React.FC<ShipImageProps> = ({ level, width = 140, plain = false, fill = false }) => {
  const safeLvl = Math.max(0, Math.min(Number(level) || 0, 37));
  const containerHeight = plain ? width * 0.95 : width * 0.9;
  const localUrl = getLocalShipUrl(safeLvl);
  const scaleVal = SHIP_SCALES[safeLvl] || (safeLvl === 0 ? 1.0 : 1.35);
  const translateYVal = SHIP_TRANSLATES[safeLvl] || '0px';

  return (
    <div
      id={`ship-image-lvl${safeLvl}`}
      style={{
        width: fill ? '100%' : `${width}px`,
        height: fill ? '100%' : `${containerHeight}px`,
        minHeight: fill ? '100%' : `${containerHeight}px`,
        maxWidth: '100%',
        backgroundImage: localUrl ? `url('${localUrl}')` : undefined,
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        margin: '0 auto',
        borderRadius: '12px',
        boxShadow: plain ? 'none' : '0 4px 10px rgba(0,0,0,0.6)',
        border: plain ? 'none' : '2px solid #ca8a04',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: plain ? 'transparent' : '#140c06',
        transform: `scale(${scaleVal}) translateY(${translateYVal})`,
        transformOrigin: 'center center',
        WebkitMaskImage: plain && safeLvl !== 1 && safeLvl !== 2 && safeLvl !== 3 && safeLvl < 32 && localUrl ? 'radial-gradient(ellipse 65% 55% at 50% 50%, black 40%, rgba(0,0,0,0.85) 60%, transparent 92%)' : undefined,
        maskImage: plain && safeLvl !== 1 && safeLvl !== 2 && safeLvl !== 3 && safeLvl < 32 && localUrl ? 'radial-gradient(ellipse 65% 55% at 50% 50%, black 40%, rgba(0,0,0,0.85) 60%, transparent 92%)' : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!localUrl && (
        <span style={{ fontSize: `${Math.round(width * 0.45)}px`, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }}>🤿</span>
      )}
    </div>
  );
};

export default React.memo(ShipImage);
