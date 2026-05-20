export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  privateAreaLink?: string;
  course?: string;
  interests?: string[];
  role: 'admin' | 'member' | 'management';
  status: 'pending' | 'active' | 'rejected';
  teamId?: string;
  familyId?: string;
  position?: string;
  membership?: 'Observer' | 'Baby Member' | 'Full Member' | 'Alumnus Member';
  bio?: string;
  badges: string[]; // Legacy, will use gadgets/achievements
  gadgets: string[];
  achievements: string[];
  skills: string[];
  previousRoles: string[];
  completedTasks: number;
  activityLevel: 'Low' | 'Medium' | 'High';
  contributionHistory: {
    action: string;
    date: string;
  }[];
  createdAt: string;
  recentActivity?: {
    id: string;
    content: string;
    date: string;
  }[];
}

export interface Gadget {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  category: 'Automatic' | 'Manual' | 'Seasonal' | 'Monthly' | 'Permanent';
  unlockCriteria: string;
  cost?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Lifetime' | 'Monthly' | 'Team' | 'Mentoring' | 'Participation' | 'Consistency' | 'Leadership' | 'International';
}

export interface Family {
  id: string;
  name: string;
  color: string;
  description: string;
  mentors: string[]; // User IDs
  mentees: string[]; // User IDs
  objectives: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  achievements: {
    id: string;
    title: string;
    date: string;
  }[];
  progress: number; // 0-100
  ranking: number;
  activityHistory: {
    action: string;
    date: string;
  }[];
  createdAt: string;
}

export interface BESTEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  time: string;
  location: string;
  type: 'Local' | 'International' | 'Social' | 'Training';
  category?: 'Local' | 'International' | 'Social' | 'Training'; // Added for compatibility
  imageUrl?: string;
  isHistorical?: boolean;
  coordinatorId?: string;
  academicYear?: string; // e.g. "2023/24"
}

export interface Meta {
  id: string;
  title: string;
  description: string;
  teamId?: string;
  eventId?: string;
  creatorId: string; // coordinator, MO, or Board member
  creatorRole: string;
  deadline?: string;
  progress: number; // 0-100
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  assignedMemberIds: string[];
  associationType?: 'team' | 'event';
  teamId?: string;
  eventId?: string;
  metaId?: string; // Link to a Meta
  status: 'Pending' | 'In Progress' | 'Completed';
  difficulty: number;
  skills: string[];
  developedSkills?: string[];
  coordinatorId?: string;
}

export interface SocialBodyMember {
  id: string;
  userId: string;
  role: string;
  position: 'Board' | 'Mesa da Assembleia Geral' | 'Conselho Fiscal' | 'Coordenadores';
  photoURL?: string;
  profileLink?: string;
  contactDetails?: string;
  term?: string;
  isCurrent?: boolean;
  year?: number;
}

export interface Meeting {
  id: string;
  teamId: string;
  eventId?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  hostId: string;
  responsibleIds: string[];
  isOpenCall: boolean;
}

export interface Team {
  id: string;
  name: string;
  mission: string;
  contactEmail: string;
  memberCount: number;
  category: 'Annual' | 'Events';
  coordinatorId?: string;
  eventId?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Role {
  id: string;
  teamId?: string;
  eventId?: string;
  title: string;
  description: string;
  responsibilities: string[];
  skillsRequired: string[];
  developedSkills: string[];
  qualityLevel: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Local' | 'International';
  assignedMemberIds: string[];
  deadline?: string;
  applicationLink?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  imageUrl?: string;
  relatedPersonId?: string; // Legacy single person
  relatedPersonIds?: string[]; // New multiple persons
  relatedTeamId?: string;
  relatedEventId?: string;
  associatedPersonPhotoURL?: string;
  type?: 'general' | 'event' | 'team' | 'board' | 'social';
}

export interface GlossaryTerm {
  id: string;
  acronym: string;
  meaning: string;
  description?: string;
}

export interface Application {
  id: string;
  userId: string;
  roleId: string;
  status: 'pending' | 'accepted' | 'rejected';
  motivation: string;
  createdAt: string;
}
