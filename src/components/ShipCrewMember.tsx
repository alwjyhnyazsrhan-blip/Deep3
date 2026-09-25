import React from 'react';
import {
  LUCK_PIRATE_ICON,
  SAILOR_ICON,
  SHIP_GUARDIAN_ICON,
  SHIP_PILOT_ICON,
  SHIP_THIEF_ICON,
  GOLDEN_HUNTER_ICON,
  MARKET_EXPERT_ICON,
  FIXER_SMALL_ICON,
  FIXER_MEDIUM_ICON,
  FIXER_LARGE_ICON,
  FIXER_LEGENDARY_ICON
} from '../data';

export interface CrewVisualInfo {
  id: string;
  name: string;
  image: string;
  badgeIcon: string;
  badgeBg: string;
  badgeBorder: string;
}

export const VALID_CREW_KEYS = [
  'luck',
  'sailor',
  'cop',
  'guide',
  'thief',
  'golden_hunter',
  'market_expert',
  'fixer_sm',
  'fixer_md',
  'fixer_lg',
  'fixer_epic'
];

export const sanitizeShipCrew = (crewList?: string[]): string[] => {
  if (!Array.isArray(crewList)) return [];
  const normalized = crewList
    .map(k => {
      if (k === 'police') return 'cop';
      if (k === 'sailors') return 'sailor';
      if (k === 'gold_fisher') return 'golden_hunter';
      if (k === 'repairer_small' || k === 'smallRepair') return 'fixer_sm';
      if (k === 'repairer_medium' || k === 'mediumRepair') return 'fixer_md';
      if (k === 'repairer_large' || k === 'largeRepair') return 'fixer_lg';
      if (k === 'repairer_legendary' || k === 'legendaryRepair') return 'fixer_epic';
      return k;
    })
    .filter(k => VALID_CREW_KEYS.includes(k));
  return Array.from(new Set(normalized));
};

export const CREW_VISUAL_MAP: Record<string, CrewVisualInfo> = {
  luck: {
    id: 'luck',
    name: 'الحظ السعيد',
    image: LUCK_PIRATE_ICON,
    badgeIcon: '🍀',
    badgeBg: 'radial-gradient(circle, #15803d 0%, #052e16 100%)',
    badgeBorder: '#eab308'
  },
  sailor: {
    id: 'sailor',
    name: 'البحار',
    image: SAILOR_ICON,
    badgeIcon: '⚓',
    badgeBg: 'radial-gradient(circle, #0284c7 0%, #082f49 100%)',
    badgeBorder: '#38bdf8'
  },
  sailors: {
    id: 'sailors',
    name: 'البحار',
    image: SAILOR_ICON,
    badgeIcon: '⚓',
    badgeBg: 'radial-gradient(circle, #0284c7 0%, #082f49 100%)',
    badgeBorder: '#38bdf8'
  },
  cop: {
    id: 'cop',
    name: 'الشرطي الحامي',
    image: SHIP_GUARDIAN_ICON,
    badgeIcon: '👮‍♂️',
    badgeBg: 'radial-gradient(circle, #1d4ed8 0%, #172554 100%)',
    badgeBorder: '#60a5fa'
  },
  police: {
    id: 'police',
    name: 'الشرطي الحامي',
    image: SHIP_GUARDIAN_ICON,
    badgeIcon: '👮‍♂️',
    badgeBg: 'radial-gradient(circle, #1d4ed8 0%, #172554 100%)',
    badgeBorder: '#60a5fa'
  },
  guide: {
    id: 'guide',
    name: 'مرشد السفينة',
    image: SHIP_PILOT_ICON,
    badgeIcon: '🧭',
    badgeBg: 'radial-gradient(circle, #d97706 0%, #451a03 100%)',
    badgeBorder: '#facc15'
  },
  thief: {
    id: 'thief',
    name: 'السارق',
    image: SHIP_THIEF_ICON,
    badgeIcon: '🥷',
    badgeBg: 'radial-gradient(circle, #7e22ce 0%, #3b0764 100%)',
    badgeBorder: '#c084fc'
  },
  golden_hunter: {
    id: 'golden_hunter',
    name: 'الصياد الذهبي',
    image: GOLDEN_HUNTER_ICON,
    badgeIcon: '🔱',
    badgeBg: 'radial-gradient(circle, #ca8a04 0%, #713f12 100%)',
    badgeBorder: '#fef08a'
  },
  gold_fisher: {
    id: 'golden_hunter',
    name: 'الصياد الذهبي',
    image: GOLDEN_HUNTER_ICON,
    badgeIcon: '🔱',
    badgeBg: 'radial-gradient(circle, #ca8a04 0%, #713f12 100%)',
    badgeBorder: '#fef08a'
  },
  market_expert: {
    id: 'market_expert',
    name: 'خبير الأسواق',
    image: MARKET_EXPERT_ICON,
    badgeIcon: '📈',
    badgeBg: 'radial-gradient(circle, #059669 0%, #064e3b 100%)',
    badgeBorder: '#34d399'
  },
  fixer_sm: {
    id: 'fixer_sm',
    name: 'مصلح صغير',
    image: FIXER_SMALL_ICON,
    badgeIcon: '🛠️',
    badgeBg: 'radial-gradient(circle, #475569 0%, #0f172a 100%)',
    badgeBorder: '#cbd5e1'
  },
  fixer_md: {
    id: 'fixer_md',
    name: 'مصلح وسط',
    image: FIXER_MEDIUM_ICON,
    badgeIcon: '🔨',
    badgeBg: 'radial-gradient(circle, #475569 0%, #0f172a 100%)',
    badgeBorder: '#cbd5e1'
  },
  fixer_lg: {
    id: 'fixer_lg',
    name: 'مصلح كبير',
    image: FIXER_LARGE_ICON,
    badgeIcon: '⚙️',
    badgeBg: 'radial-gradient(circle, #475569 0%, #0f172a 100%)',
    badgeBorder: '#cbd5e1'
  },
  fixer_epic: {
    id: 'fixer_epic',
    name: 'مصلح أسطوري',
    image: FIXER_LEGENDARY_ICON,
    badgeIcon: '👑',
    badgeBg: 'radial-gradient(circle, #ca8a04 0%, #78350f 100%)',
    badgeBorder: '#fde047'
  },
  repairer_small: {
    id: 'fixer_sm',
    name: 'مصلح صغير',
    image: FIXER_SMALL_ICON,
    badgeIcon: '🛠️',
    badgeBg: 'radial-gradient(circle, #475569 0%, #0f172a 100%)',
    badgeBorder: '#cbd5e1'
  },
  repairer_medium: {
    id: 'fixer_md',
    name: 'مصلح وسط',
    image: FIXER_MEDIUM_ICON,
    badgeIcon: '🔨',
    badgeBg: 'radial-gradient(circle, #475569 0%, #0f172a 100%)',
    badgeBorder: '#cbd5e1'
  },
  repairer_large: {
    id: 'fixer_lg',
    name: 'مصلح كبير',
    image: FIXER_LARGE_ICON,
    badgeIcon: '⚙️',
    badgeBg: 'radial-gradient(circle, #475569 0%, #0f172a 100%)',
    badgeBorder: '#cbd5e1'
  },
  repairer_legendary: {
    id: 'fixer_epic',
    name: 'مصلح أسطوري',
    image: FIXER_LEGENDARY_ICON,
    badgeIcon: '👑',
    badgeBg: 'radial-gradient(circle, #ca8a04 0%, #78350f 100%)',
    badgeBorder: '#fde047'
  }
};

interface ShipCrewMemberProps {
  assignedCrew?: string[];
  shipLevel?: number;
}

export const ShipCrewMember: React.FC<ShipCrewMemberProps> = ({ assignedCrew, shipLevel = 0 }) => {
  const sanitized = sanitizeShipCrew(assignedCrew);
  if (sanitized.length === 0) return null;

  // Filter out invalid or fixer one-time consumables if needed, but display any active assigned crew
  const activeMembers = sanitized
    .map(id => CREW_VISUAL_MAP[id])
    .filter((info): info is CrewVisualInfo => !!info);

  if (activeMembers.length === 0) return null;

  // Adjust bottom offset according to ship level to align with ship deck
  let bottomPos = '20%';
  let leftPos = '44%';

  if (shipLevel === 0) {
    bottomPos = '22%';
    leftPos = '45%';
  } else if (shipLevel >= 1 && shipLevel <= 5) {
    bottomPos = '24%';
    leftPos = '46%';
  } else if (shipLevel >= 6 && shipLevel <= 17) {
    bottomPos = '26%';
    leftPos = '47%';
  } else {
    bottomPos = '25%';
    leftPos = '48%';
  }

  // Dynamic height & spacing based on crew count so all crew stand side-by-side on the deck without overlapping
  const crewCount = activeMembers.length;
  let charMaxHeight = '72px';
  let charGap = '4px';

  if (crewCount === 2) {
    charMaxHeight = '64px';
    charGap = '3px';
  } else if (crewCount === 3) {
    charMaxHeight = '56px';
    charGap = '2px';
  } else if (crewCount === 4) {
    charMaxHeight = '48px';
    charGap = '2px';
  } else if (crewCount >= 5) {
    charMaxHeight = '42px';
    charGap = '1.5px';
  }

  return (
    <div
      className="ship-crew-overlay"
      style={{
        position: 'absolute',
        bottom: bottomPos,
        left: leftPos,
        transform: 'translate(-50%, 0)',
        zIndex: 12,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        maxWidth: '85%',
        height: '42%',
        maxHeight: '85px',
        filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.9))'
      }}
    >
      {/* Crew Character(s) Standing Side-by-Side on Boat Deck without overlapping */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: charGap,
          flexWrap: 'nowrap'
        }}
      >
        {activeMembers.map((member, idx) => (
          <img
            key={member.id + idx}
            src={member.image}
            alt={member.name}
            title={member.name}
            referrerPolicy="no-referrer"
            style={{
              height: 'auto',
              maxHeight: charMaxHeight,
              width: 'auto',
              maxWidth: crewCount > 3 ? '40px' : '55px',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              display: 'block',
              margin: 0,
              flexShrink: 0
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(ShipCrewMember);
