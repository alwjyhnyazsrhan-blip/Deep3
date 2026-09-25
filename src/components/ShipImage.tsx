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

const getLocalShipUrl = (lvl: number): string => {
  const safeLvl = Math.max(0, Math.min(Number(lvl) || 0, 35));
  return `/ships/ship_${String(safeLvl).padStart(2, '0')}.webp`;
};

const SHIP_IMAGES_1_TO_31: Record<number, string> = {
  0: '/ships/ship_00.webp',
  1: '/ships/ship_01.webp',
  2: '/ships/ship_02.webp',
  3: '/ships/ship_03.webp',
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
  32: '/ships/ship_32.webp',
  33: '/ships/ship_33.webp',
  34: '/ships/ship_34.webp',
  35: '/ships/ship_35.webp',
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
};

const SHIP_TRANSLATES: Record<number, string> = {
  15: '-15px',
  16: '-15px',
};

const ShipImage: React.FC<ShipImageProps> = ({ level, width = 140, plain = false, fill = false }) => {
  const safeLvl = Math.max(0, Math.min(Number(level) || 0, 35));
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
        backgroundImage: `url('${localUrl}')`,
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
        WebkitMaskImage: plain ? 'radial-gradient(ellipse 65% 55% at 50% 50%, black 40%, rgba(0,0,0,0.85) 60%, transparent 92%)' : undefined,
        maskImage: plain ? 'radial-gradient(ellipse 65% 55% at 50% 50%, black 40%, rgba(0,0,0,0.85) 60%, transparent 92%)' : undefined,
      }}
    />
  );
};

export default React.memo(ShipImage);
