export interface ShipState {
  id: string;
  name: string;
  status: 'docked' | 'fishing';
  left: string;
  top: string;
  scaleX: number;
  moving: boolean;
  exists: boolean;
  crewPower: number;
  hasNetUpgrade: boolean;
  hasEngineUpgrade: boolean;
  level?: number;
  hook?: number;
  cargo?: number;
  heart?: number;
  maxHeart?: number;
  durationStr?: string;
  power?: number;
  armor?: number;
  fishTypes?: string[];
  imgEmoji?: string;
  speedLevel?: number;
  capacityLevel?: number;
  defenseLevel?: number;
  transitionDuration?: string;
  assignedCrew?: string[];
  autoFishingPaused?: boolean;
  lastMoveTime?: number;
  progress?: number;
}

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

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt?: string;
}

export interface HarborEvent {
  id: string;
  attackerId: string;
  attackerName: string;
  attackerAvatar?: string;
  defenderId: string;
  type: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSED';
  createdAt?: string;
}

export interface Tribe {
  name: string;
  members: number;
  power: number;
  rank: number;
  joined: boolean;
  level: number;
  donations: number;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  power: number;
  cost: number;
  avatar: string;
  image?: string;
  hired: boolean;
  shipId?: string;
}

export interface Quest {
  id: string;
  title: string;
  target: string;
  progress: number;
  max: number;
  rewardGold: number;
  rewardGems: number;
  completed: boolean;
  claimed: boolean;
}

export interface BattleReport {
  id: string;
  opponentName: string;
  opponentAvatar: string;
  isVictory: boolean;
  goldChange: number;
  gemsChange: number;
  expGained: number;
  time: string;
  log: string[];
}

export type NotificationEventType = 'ATTACK' | 'SUPPORT' | 'MILESTONE';

export interface GlobalNotification {
  id?: string;
  type: NotificationEventType;
  title: string;
  message: string;
  icon?: string;
  authorId?: string;
  senderId?: string;
  authorName?: string;
  senderName?: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  createdAt: string;
}
