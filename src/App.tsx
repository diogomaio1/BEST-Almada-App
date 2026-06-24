import * as React from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Layout from './components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Mail, 
  ExternalLink, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight,
  ChevronLeft,
  Archive,
  Bell,
  AlarmClock,
  ClipboardList,
  User, 
  Users, 
  Briefcase,
  Camera,
  Activity,
  Image as ImageIcon,
  Save,
  X,
  Zap,
  Rocket,
  FileText,
  Check,
  Award,
  Globe,
  Calendar,
  Search,
  Gift,
  Eye,
  Heart,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Megaphone,
  Phone,
  Lock as LockIcon,
  BadgeCheck,
  History as HistoryIcon
} from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { db, auth } from './lib/firebase';
import { supabase, getSupabaseConfigInfo, initializeDynamicSupabase } from './lib/supabase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer,
  updateDoc,
  where,
  deleteDoc,
  deleteField
} from 'firebase/firestore';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Settings, Shield, UserCog, Info, Target, HelpCircle } from 'lucide-react';

// Image Compression Helper to fit Firestore document limits (saves Base64 up to 50MB and downscales cleanly)
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!file.type.startsWith('image/') || file.type.includes('svg')) {
        resolve(event.target?.result as string);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_DIMENSION = 1200;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Login Logo with guaranteed fallbacks and inline vector backup
const LoginLogo: React.FC = () => {
  const [logoIndex, setLogoIndex] = React.useState(0);
  const fallbacks = [
    "https://upload.wikimedia.org/wikipedia/commons/4/41/BEST_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/BEST_logo.svg/500px-BEST_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/e/e4/BEST_logo.png",
    "https://upload.wikimedia.org/wikipedia/commons/5/50/BESTlogo.png"
  ];

  if (logoIndex >= fallbacks.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-500 rounded-3xl p-5 shadow-inner">
        {/* Precision drawn vector representation of the official BEST propeller symbol */}
        <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] text-white fill-current animate-[pulse_3s_infinite]" id="best-inline-logo">
          {/* Central circular core */}
          <circle cx="50" cy="50" r="8" className="fill-white" />
          
          {/* Central rounded triangular ring surrounding the core */}
          <path d="M 50 35 A 15 15 0 0 1 63 57 A 15 15 0 0 1 37 57 A 15 15 0 0 1 50 35 Z" fill="none" stroke="white" strokeWidth="4.5" strokeLinejoin="round" />
          
          {/* Three elegantly handcrafted curved propellor/pinwheel wing blades radiating out at 120-degree intervals */}
          {/* Top-Right Blade */}
          <path d="M 50 35 C 50 20, 60 10, 80 15 C 70 30, 65 40, 63 57 C 58 45, 54 38, 50 35 Z" className="fill-white" />
          
          {/* Bottom-Right/Downward Blade */}
          <path d="M 63 57 C 75 65, 78 78, 65 92 C 55 80, 48 70, 37 57 C 49 57, 56 57, 63 57 Z" className="fill-white" />
          
          {/* Left/Top-Left Blade */}
          <path d="M 37 57 C 22 55, 12 42, 10 21 C 25 30, 38 35, 50 35 C 43 45, 40 50, 37 57 Z" className="fill-white" />
        </svg>
        <span className="text-[11px] text-white/90 font-black uppercase tracking-widest mt-2" id="best-almada-label">BEST Almada</span>
      </div>
    );
  }

  return (
    <img 
      src={fallbacks[logoIndex]} 
      onError={() => {
        console.warn(`Logo failing to load: ${fallbacks[logoIndex]}. Attempting next source...`);
        setLogoIndex(prev => prev + 1);
      }}
      alt="BEST Logo" 
      className="w-full h-full object-contain img-fade-in transition-all duration-300"
    />
  );
};

// Types
import { UserProfile, Team, Role, Task, Announcement, Application, BESTEvent, Gadget, Achievement, Family, SocialBodyMember, Meeting, GlossaryTerm, Meta } from './types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined,
      email: undefined,
      emailVerified: undefined,
      isAnonymous: undefined,
      tenantId: undefined,
      providerInfo: []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mock data for fallback
const MOCK_USER: UserProfile = {
  uid: '1',
  displayName: 'Diogo Maio',
  email: 'diogomaioedu@gmail.com',
  photoURL: 'https://picsum.photos/seed/member1/200',
  role: 'admin',
  status: 'active',
  teamId: 't1',
  position: 'President',
  badges: ['Founder', 'Top Contributor', 'Event Master'],
  skills: ['Leadership', 'Public Speaking', 'Project Management'],
  completedTasks: 45,
  activityLevel: 'High',
  createdAt: new Date().toISOString(),
  gadgets: [],
  achievements: [],
  previousRoles: [],
  contributionHistory: []
};

const MOCK_TEAMS = [
  { id: 't1', name: 'Board', mission: 'Direct the local group', department: 'Management', contactEmail: 'board@best.org', memberCount: 5 },
  { id: 't2', name: 'IT', mission: 'Maintain internal platforms', department: 'Technical', contactEmail: 'it@best.org', memberCount: 8 },
  { id: 't3', name: 'PR', mission: 'Promote BEST events', department: 'Marketing', contactEmail: 'pr@best.org', memberCount: 12 },
];

const MOCK_OPPORTUNITIES = [
  { id: 'o1', teamId: 't2', title: 'Fullstack Developer', description: 'Help build the new member platform.', difficulty: 'Hard', commitment: '10h/week', isOpen: true },
  { id: 'o2', teamId: 't3', title: 'Social Media Manager', description: 'Manage our Instagram and LinkedIn.', difficulty: 'Medium', commitment: '5h/week', isOpen: true },
];

const PREDEFINED_SKILLS = [
  'Leadership', 'Project Management', 'Public Speaking', 'Design', 'React', 
  'Marketing', 'Corporate Relations', 'Fundraising', 'Event Planning', 
  'Logistics', 'Teamwork', 'Communication', 'Problem Solving', 'Time Management'
];

const MarkdownToolbar = ({ onInsert }: { onInsert: (text: string) => void }) => (
  <div className="flex overflow-x-auto whitespace-nowrap gap-1 p-1 bg-zinc-100/50 rounded-xl border border-zinc-200/40 mb-1 sticky top-0 z-10 backdrop-blur-sm shadow-sm custom-scrollbar no-scrollbar scrollbar-hide">
    {[
      { label: 'B', snippet: '**texto**', desc: 'Bold' },
      { label: 'I', snippet: '*texto*', desc: 'Italic' },
      { label: 'U', snippet: '<u>texto</u>', desc: 'Underline' },
      { label: 'H1', snippet: '\n\n# ', desc: 'H1' },
      { label: 'H2', snippet: '\n\n## ', desc: 'H2' },
      { label: 'H3', snippet: '\n\n### ', desc: 'H3' },
      { label: 'Lista', snippet: '\n- ', desc: 'List' },
      { label: 'Link', snippet: '[Nome](URL)', desc: 'Link' },
      { label: 'Vermelho', snippet: '<span style="color:#ef4444">texto</span>', desc: 'Red Text' },
      { label: 'Verde', snippet: '<span style="color:#22c55e">texto</span>', desc: 'Green Text' },
      { label: 'Azul', snippet: '<span style="color:#3b82f6">texto</span>', desc: 'Blue Text' },
      { label: 'Centro', snippet: '\n\n<div style="text-align:center">\n\ntexto\n\n</div>\n\n', desc: 'Align Center' },
      { label: 'Esquerda', snippet: '\n\n<div style="text-align:left">\n\ntexto\n\n</div>\n\n', desc: 'Align Left' },
      { label: 'Direita', snippet: '\n\n<div style="text-align:right">\n\ntexto\n\n</div>\n\n', desc: 'Align Right' },
    ].map(tool => (
      <Button 
        key={tool.label}
        type="button"
        variant="ghost" 
        size="sm" 
        title={tool.desc}
        className="h-7 px-3 text-[8px] font-black uppercase hover:bg-white border border-transparent hover:border-zinc-200 transition-all text-zinc-600 shrink-0"
        onClick={() => onInsert(tool.snippet)}
      >
        {tool.label}
      </Button>
    ))}
  </div>
);

interface Notification {
  id: string;
  userId?: string; // If specific to a user, else broadcast
  title: string;
  message: string;
  type: 'announcement' | 'call' | 'task' | 'event' | 'reminder';
  link?: string;
  createdAt: any;
  isRead: boolean;
  resourceId?: string;
}

const NotificationCenter = ({ notifications, onMarkRead }: { notifications: Notification[], onMarkRead: (id: string) => void }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative group hover:bg-zinc-100 rounded-2xl w-10 h-10 transition-all active:scale-95">
            <Bell className={cn("h-5 w-5", unreadCount > 0 ? "text-red-500 fill-red-500/10 animate-bounce-subtle" : "text-zinc-400")} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] px-1 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md p-0 rounded-l-[2rem] border-none shadow-2xl bg-white overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-8 bg-zinc-900 text-white space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase tracking-tight">Notificações</h3>
                <Badge className="bg-white/10 text-white font-black hover:bg-white/20 border-none">{notifications.length}</Badge>
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Fica a par de tudo o que acontece no BEST</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).map(n => (
                    <div 
                      key={n.id} 
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                        n.isRead ? "bg-white border-zinc-100 opacity-60" : "bg-zinc-50 border-orange-100 shadow-sm ring-1 ring-orange-50"
                      )}
                      onClick={() => onMarkRead(n.id)}
                    >
                      {!n.isRead && <div className="absolute top-4 right-4 h-2 w-2 bg-orange-500 rounded-full animate-pulse" />}
                      <div className="flex gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                          n.type === 'announcement' ? "bg-red-50 text-red-600" :
                          n.type === 'call' ? "bg-orange-50 text-orange-600" :
                          n.type === 'task' ? "bg-green-50 text-green-600" :
                          n.type === 'event' ? "bg-blue-50 text-blue-600" :
                          "bg-zinc-100 text-zinc-600"
                        )}>
                          {n.type === 'announcement' && <Megaphone className="h-5 w-5" />}
                          {n.type === 'call' && <Briefcase className="h-5 w-5" />}
                          {n.type === 'task' && <ClipboardList className="h-5 w-5" />}
                          {n.type === 'event' && <Calendar className="h-5 w-5" />}
                          {n.type === 'reminder' && <AlarmClock className="h-5 w-5" />}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-black text-zinc-900 uppercase tracking-tight truncate">{n.title}</p>
                          <p className="text-sm text-zinc-600 leading-snug font-medium line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest pt-1">
                            {n.createdAt?.toDate().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                  <Bell className="h-16 w-16" />
                  <p className="text-xs font-black uppercase tracking-widest">Sem Notificações</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 border-t border-zinc-50 bg-zinc-50/50">
                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-xl text-zinc-400 hover:text-zinc-600">
                  Marcar todas como lidas
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const SafeMarkdown = ({ children }: { children: string }) => (
  <div className="markdown-body">
    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{children}</Markdown>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = React.useState('home');
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAuthReady, setIsAuthReady] = React.useState(false);

  // Supabase specific auth state
  const [loginMode, setLoginMode] = React.useState<'google' | 'email'>('google');
  const [emailAuth, setEmailAuth] = React.useState('');
  const [passwordAuth, setPasswordAuth] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [serverConfigDiag, setServerConfigDiag] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setServerConfigDiag(data))
      .catch(err => console.error("Error loading config diagnostics:", err));
  }, []);

  // Real data states
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [metas, setMetas] = React.useState<Meta[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [opportunities, setOpportunities] = React.useState<Role[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [allMembers, setAllMembers] = React.useState<UserProfile[]>([]);
  const [events, setEvents] = React.useState<BESTEvent[]>([]);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isManagingMembers, setIsManagingMembers] = React.useState(false);
  const [isManagingTeams, setIsManagingTeams] = React.useState(false);
  const [isManagingCalls, setIsManagingCalls] = React.useState(false);
  const [isManagingEvents, setIsManagingEvents] = React.useState(false);
  const [isManagingTasks, setIsManagingTasks] = React.useState(false);
  const [isManagingMetas, setIsManagingMetas] = React.useState(false);
  const [isManagingAnnouncements, setIsManagingAnnouncements] = React.useState(false);
  const [selectedAnnouncementDetails, setSelectedAnnouncementDetails] = React.useState<Announcement | null>(null);
  const [isManagingGlossary, setIsManagingGlossary] = React.useState(false);
  const [selectedHistoryYear, setSelectedHistoryYear] = React.useState(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 is January, 8 is September
    // Academic Year Logic:
    // until September of a civil year, current academic year is (year-1)/year.
    // from September onwards, current academic year is year/(year+1).
    return currentMonth < 8 ? currentYear - 1 : currentYear;
  });
  const [isManagingHistoryItem, setIsManagingHistoryItem] = React.useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = React.useState(false);
  const [isCreatingCall, setIsCreatingCall] = React.useState(false);
  const [isCreatingTask, setIsCreatingTask] = React.useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = React.useState(false);
  const [isCreatingMeta, setIsCreatingMeta] = React.useState(false);
  const [isCreatingSocialBody, setIsCreatingSocialBody] = React.useState(false);
  const [isAddingSkill, setIsAddingSkill] = React.useState(false);
  const [newSkill, setNewSkill] = React.useState('');
  const [newActivityContent, setNewActivityContent] = React.useState('');
  const [selectedMember, setSelectedMember] = React.useState<UserProfile | null>(null);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [selectedCall, setSelectedCall] = React.useState<Role | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<BESTEvent | null>(null);
  const [selectedMeta, setSelectedMeta] = React.useState<Meta | null>(null);
  const [editForm, setEditForm] = React.useState({
    displayName: '',
    position: '',
    bio: '',
    membership: '',
    phoneNumber: '',
    email: '',
    photoURL: '',
    privateAreaLink: '',
    course: '',
    interests: [] as string[],
    skills: [] as string[],
    previousRoles: [] as string[]
  } as any);
  const [teamForm, setTeamForm] = React.useState({
    name: '',
    mission: '',
    contactEmail: '',
    category: 'Annual' as 'Annual' | 'Events',
    coordinatorId: '',
    eventId: '',
    imageUrl: ''
  });
  const [callForm, setCallForm] = React.useState({
    title: '',
    description: '',
    difficulty: 'Medium' as any,
    category: 'Local' as 'Local' | 'International',
    associationType: 'team' as 'team' | 'event',
    teamId: '',
    eventId: '',
    skillsRequired: [] as string[],
    developedSkills: [] as string[],
    qualityLevel: 1,
    assignedMemberIds: [] as string[],
    deadline: '',
    applicationLink: ''
  });
  const [selectedEventDetails, setSelectedEventDetails] = React.useState<BESTEvent | null>(null);
  const [eventForm, setEventForm] = React.useState({
    title: '',
    description: '',
    startDate: '', // YYYY-MM-DD
    endDate: '',   // YYYY-MM-DD
    time: '',
    location: '',
    type: 'Local' as any,
    imageUrl: '',
    isHistorical: false,
    coordinatorId: '',
    academicYear: ''
  });
  // Dynamic skills list
  const [dynamicSkills, setDynamicSkills] = React.useState<string[]>(PREDEFINED_SKILLS);

  React.useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'appContent', 'skills'), (doc) => {
      if (doc.exists()) {
        setDynamicSkills(doc.data().list || PREDEFINED_SKILLS);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'appContent/skills');
    });
    return () => unsub();
  }, [user]);

  const addGlobalSkill = async (skill: string) => {
    if (!skill || dynamicSkills.includes(skill)) return;
    const newList = [...dynamicSkills, skill];
    await setDoc(doc(db, 'appContent', 'skills'), { list: newList });
  };
  const [publicProfileId] = React.useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view');
  });
  const [glossary, setGlossary] = React.useState<GlossaryTerm[]>([]);

  const isCallExpired = (deadline: string) => {
    if (!deadline) return false;
    const now = new Date();
    const d = new Date(deadline);
    // Set deadline to the end of the day so it only expires after the day passes
    d.setHours(23, 59, 59, 999);
    return d < now;
  };
  const [gadgets, setGadgets] = React.useState<Gadget[]>([]);
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [families, setFamilies] = React.useState<Family[]>([]);
  const [socialBodies, setSocialBodies] = React.useState<SocialBodyMember[]>([]);
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [appContent, setAppContent] = React.useState<Record<string, any>>({});
  const [meetingForm, setMeetingForm] = React.useState({
    teamId: '',
    eventId: '',
    title: '',
    description: '',
    date: '',
    time: '',
    hostId: '',
    responsibleIds: [] as string[],
    isOpenCall: false
  });
  const [isManagingGadgets, setIsManagingGadgets] = React.useState(false);
  const [isManagingAchievements, setIsManagingAchievements] = React.useState(false);
  const [isManagingFamilies, setIsManagingFamilies] = React.useState(false);
  const [isManagingSocialBodies, setIsManagingSocialBodies] = React.useState(false);
  const [isManagingMeetings, setIsManagingMeetings] = React.useState(false);
  const [selectedGadget, setSelectedGadget] = React.useState<Gadget | null>(null);
  const [selectedAchievement, setSelectedAchievement] = React.useState<Achievement | null>(null);
  const [selectedFamily, setSelectedFamily] = React.useState<Family | null>(null);
  const [selectedSocialBodyMember, setSelectedSocialBodyMember] = React.useState<SocialBodyMember | null>(null);
  const [selectedMeeting, setSelectedMeeting] = React.useState<Meeting | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = React.useState<GlossaryTerm | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{ 
    title: string; 
    message: string; 
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
  } | null>(null);
  const [gadgetForm, setGadgetForm] = React.useState({
    name: '',
    description: '',
    icon: '',
    rarity: 'Common' as any,
    category: 'Permanent' as any,
    unlockCriteria: ''
  });
  const [achievementForm, setAchievementForm] = React.useState({
    title: '',
    description: '',
    icon: '',
    category: 'Lifetime' as any
  });
  const [familyForm, setFamilyForm] = React.useState({
    id: '',
    name: '',
    color: '',
    description: '',
    mentors: [] as string[],
    mentees: [] as string[],
    objectives: [] as { id: string; title: string; completed: boolean }[],
    achievements: [] as { id: string; title: string; date: string }[],
    ranking: 0
  });
  const [socialBodyForm, setSocialBodyForm] = React.useState({
    userId: '',
    role: '',
    position: 'Board' as any,
    profileLink: '',
    contactDetails: '',
    term: '',
    isCurrent: true,
    year: new Date().getFullYear()
  });
  const [taskForm, setTaskForm] = React.useState({
    id: '',
    title: '',
    description: '',
    deadline: '',
    assignedMemberIds: [] as string[],
    associationType: 'team' as 'team' | 'event',
    teamId: '',
    eventId: '',
    metaId: '',
    status: 'Pending' as any,
    difficulty: 0,
    skills: [] as string[],
    developedSkills: [] as string[],
    coordinatorId: ''
  });
  const [metaForm, setMetaForm] = React.useState({
    title: '',
    description: '',
    teamId: '',
    eventId: '',
    creatorId: '',
    creatorRole: 'Board',
    deadline: '',
    status: 'Pending' as any,
    progress: 0
  });
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isViewingTask, setIsViewingTask] = React.useState(false);
  const [announcementForm, setAnnouncementForm] = React.useState({
    title: '',
    content: '',
    imageUrl: '',
    associatedPersonPhotoURL: '',
    relatedPersonId: '', // Legacy
    relatedPersonIds: [] as string[],
    relatedTeamId: '',
    relatedEventId: '',
    type: 'general' as any
  });
  const [glossaryForm, setGlossaryForm] = React.useState({
    acronym: '',
    meaning: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFilter, setSearchFilter] = React.useState<'skill' | 'team' | 'role' | 'event'>('skill');
  const [viewingProfile, setViewingProfile] = React.useState<UserProfile | null>(null);
  const [viewingCall, setViewingCall] = React.useState<Role | null>(null);
  const [viewingMemberActivity, setViewingMemberActivity] = React.useState<UserProfile | null>(null);
  const [selectedTeamView, setSelectedTeamView] = React.useState<Team | null>(null);
  const [selectedFamilyView, setSelectedFamilyView] = React.useState<Family | null>(null);
  const [eventViewMode, setEventViewMode] = React.useState<'list' | 'calendar'>('calendar');
  const [eventCurrentMonth, setEventCurrentMonth] = React.useState(new Date());

  // Test connection to Firestore
  React.useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Auth Listener
  React.useEffect(() => {
    let active = true;
    let unsubUser: (() => void) | null = null;
    let subscription: { unsubscribe: () => void } | null = null;

    // Timeout fallback to prevent being stuck on loading
    const timeoutId = setTimeout(() => {
      if (!isAuthReady && active) {
        console.warn("Auth initialization timed out. Forcing ready state.");
        setLoading(false);
        setIsAuthReady(true);
      }
    }, 8000);

    async function initAuth() {
      // Fetch environment config dynamically from server before listening to auth state
      await initializeDynamicSupabase();

      if (!active) return;

      const config = getSupabaseConfigInfo();

      if (config.isPlaceholder || !config.hasKey) {
        console.warn("[Auth Init] Supabase credentials not configured in dynamic env. Bypassing state listener to prevent connection errors.");
        setLoading(false);
        setIsAuthReady(true);
        clearTimeout(timeoutId);
        return;
      }

      try {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!active) return;
          try {
            const supabaseUser = session?.user;
            if (supabaseUser) {
              console.log("User authenticated via Supabase:", supabaseUser.id);
              
              if (unsubUser) {
                unsubUser();
              }

              // Use onSnapshot for the current user to react to status changes (approval)
              const userDocRef = doc(db, 'users', supabaseUser.id);
              unsubUser = onSnapshot(userDocRef, (docSnap) => {
                if (!active) return;
                const adminEmails = [
                  'diogomaioedu@gmail.com',
                  'diogo.maio@best-eu.org',
                  'andremarquesmaio@gmail.com',
                  'best.almada@best-eu.org'
                ];
                
                const isUserAdmin = supabaseUser.email && adminEmails.includes(supabaseUser.email.toLowerCase().trim());

                if (docSnap.exists()) {
                  const data = docSnap.data() as UserProfile;
                  
                  // Force-upgrade user roles in both state and firestore for predefined administrators
                  if (isUserAdmin && (data.role !== 'admin' || data.status !== 'active')) {
                    console.log(`[Auto Admin Upgrade] Upgrading role of ${data.email} to Admin/Active...`);
                    updateDoc(userDocRef, { role: 'admin', status: 'active' }).catch(err => {
                      console.error("Failed to automatically sync admin role to database:", err);
                    });
                    setUser({
                      ...data,
                      role: 'admin',
                      status: 'active'
                    });
                  } else {
                    setUser(data);
                  }
                } else {
                  // Handle new user creation inside onSnapshot if first time
                  console.log("Creating new user profile...");
                  const dns = supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Membro BEST';
                  const pUrl = supabaseUser.user_metadata?.avatar_url || `https://picsum.photos/seed/${supabaseUser.id}/200`;
                  const newProfile: UserProfile = {
                    uid: supabaseUser.id,
                    displayName: dns,
                    email: supabaseUser.email || '',
                    photoURL: pUrl,
                    role: isUserAdmin ? 'admin' : 'member',
                    status: isUserAdmin ? 'active' : 'pending',
                    position: isUserAdmin ? 'President' : 'Membro',
                    membership: 'Observer',
                    privateAreaLink: '',
                    course: '',
                    interests: [],
                    badges: [],
                    gadgets: [],
                    achievements: [],
                    skills: [],
                    previousRoles: [],
                    completedTasks: 0,
                    activityLevel: 'Low',
                    contributionHistory: [],
                    createdAt: new Date().toISOString(),
                  } as any;
                  setDoc(userDocRef, newProfile).catch(err => {
                    console.error("Error creating profile:", err);
                    toast.error("Erro ao configurar perfil. Tenta novamente.");
                  });
                  setUser(newProfile);
                }
                setLoading(false);
                setIsAuthReady(true);
                clearTimeout(timeoutId);
              });
            } else {
              console.log("No user authenticated.");
              if (unsubUser) {
                unsubUser();
                unsubUser = null;
              }
              setUser(null);
              setLoading(false);
              setIsAuthReady(true);
              clearTimeout(timeoutId);
            }
          } catch (error) {
            console.error("Auth listener session change handling error:", error);
            setLoading(false);
            setIsAuthReady(true);
            clearTimeout(timeoutId);
          }
        });

        subscription = data.subscription;
      } catch (error) {
        console.error("Auth listener initialization error:", error);
        setLoading(false);
        setIsAuthReady(true);
        clearTimeout(timeoutId);
      }
    }

    initAuth();

    return () => {
      active = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (unsubUser) {
        unsubUser();
      }
      clearTimeout(timeoutId);
    };
  }, [isAuthReady]);

  // Notifications Listener
  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(items);
    });
    return () => unsub();
  }, [user]);

  const handleMarkNotificationRead = async (id: string) => {
    const path = `notifications/${id}`;
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => {
        const path = `notifications/${n.id}`;
        return updateDoc(doc(db, 'notifications', n.id), { isRead: true })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, path));
      }));
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error("Error marking all read:", error);
      const msg = error instanceof Error ? error.message : '';
      toast.error(msg.startsWith('{') ? 'Erro de permissões ao marcar notificações' : 'Erro ao marcar todas como lidas');
    }
  };

  const createNotification = async (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const path = 'notifications';
    try {
      const ref = doc(collection(db, path));
      try {
        await setDoc(ref, {
          ...notif,
          id: ref.id,
          createdAt: new Date(),
          isRead: false
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `${path}/${ref.id}`);
      }
    } catch (error) {
      console.error("Notification trigger error:", error);
    }
  };

  // Real-time Listeners
  React.useEffect(() => {
    if (!isAuthReady || !user) return;

    // Publicly accessible listeners (teams, events and allMembers for profile view)
    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'teams');
    });

    const unsubAllMembers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const members = snapshot.docs.map(doc => doc.data() as UserProfile);
      setAllMembers(members);
      
      // If we have a public profile ID to view, set it now
      if (publicProfileId && !user) {
        const profile = members.find(m => m.uid === publicProfileId);
        if (profile) setViewingProfile(profile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BESTEvent)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'events');
    });

    const unsubMetas = onSnapshot(collection(db, 'metas'), (snapshot) => {
      setMetas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meta)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'metas');
    });

    const unsubRoles = onSnapshot(collection(db, 'roles'), (snapshot) => {
      setOpportunities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'roles');
    });

    const tasksQuery = query(collection(db, 'tasks'));

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(allTasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });

    const unsubGadgets = onSnapshot(collection(db, 'gadgets'), (snapshot) => {
      setGadgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gadget)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'gadgets');
    });

    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'achievements');
    });

    const unsubFamilies = onSnapshot(collection(db, 'families'), (snapshot) => {
      setFamilies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Family)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'families');
    });

    const unsubSocialBodies = onSnapshot(collection(db, 'socialBodies'), (snapshot) => {
      setSocialBodies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialBodyMember)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'socialBodies');
    });

    const unsubMeetings = onSnapshot(collection(db, 'meetings'), (snapshot) => {
      setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'meetings');
    });

    const unsubAnnouncements = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'announcements');
    });

    const unsubGlossary = onSnapshot(collection(db, 'glossary'), (snapshot) => {
      const terms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GlossaryTerm));
      setGlossary(terms);

      // Seed initial glossary if empty
      if (snapshot.empty && user?.role === 'admin') {
        const initialGlossary = [
          { acronym: 'BEST', meaning: 'Board of European Students of Technology' },
          { acronym: 'LBG', meaning: 'Local BEST Group' },
          { acronym: 'GA', meaning: 'General Assembly' },
          { acronym: 'RM', meaning: 'Regional Meeting' },
          { acronym: 'PR', meaning: 'Public Relations' },
          { acronym: 'HR', meaning: 'Human Resources' },
          { acronym: 'FR', meaning: 'Fundraising' },
          { acronym: 'MO', meaning: 'Main Organizer', description: 'Main responsible person for an event' },
          { acronym: 'Full Member', meaning: 'Active member with voting rights' },
          { acronym: 'Baby Member', meaning: 'Active member without voting rights' },
          { acronym: 'Observer', meaning: 'Person interested in joining' },
          { acronym: 'Alumnus Member', meaning: 'Former active member / non-active member with continuing connection' }
        ];

        initialGlossary.forEach(term => {
          setDoc(doc(collection(db, 'glossary')), term);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'glossary');
    });

    const unsubAppContent = onSnapshot(collection(db, 'appContent'), (snapshot) => {
      const content: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        content[doc.id] = doc.data();
      });
      setAppContent(content);

      // Seed initial content if empty
      if (snapshot.empty && user?.role === 'admin') {
        const initialContent = {
          'about-best': {
            title: 'O que é o BEST?',
            text: `O BEST (Board of European Students of Technology) é uma organização europeia de estudantes, sem fins lucrativos e apolítica, que existe desde 1989.\n\nEstamos presentes em 96 universidades de 33 países, formando uma rede de mais de 3.300 membros ativos.\n\nA nossa Missão: "Developing students" — Proporcionamos educação complementar e apoio na carreira, promovendo a diversidade e a cooperação europeia.`
          },
          'lbg': {
            title: 'o LBG',
            text: `o LBG Almada é o teu grupo local. Somos responsáveis por organizar eventos, gerir parcerias e manter a comunidade viva na FCT NOVA.\n\nEstrutura Local:\n- Board: Direção Executiva\n- Mesa da Assembleia Geral: Poder Deliberativo\n- Conselho Fiscal: Fiscalização Financeira`
          },
          'international-ops': {
            title: 'Oportunidades Internacionais',
            text: `Como membro do BEST, tens acesso a uma rede europeia gigante. Podes viajar, aprender e divertir-te por quase nada.\n\nBEST Courses: Viaja para uma das 96 cidades, assiste a aulas sobre um tema e vive o "BEST Spirit" com estudantes de toda a Europa.`
          },
          'gamification': {
            title: 'Pontos e Progresso',
            text: `Colabora ativamente com o Teu Grupo Local (LBG) para desenvolveres competências técnicas e interpessoais. A tua participação é registada no teu perfil para reconhecimento futuro.`
          },
          'recognition': {
            title: 'Reconhecimento',
            text: `Ser membro do BEST não é apenas trabalhar; é ganhar ferramentas para o teu futuro.\n\n- Experiência Prática\n- Rede Internacional\n- Responsabilidade\n- Visibilidade`
          },
          'skills-dev': {
            title: 'Competências',
            text: `No BEST, o teu crescimento é medido pelas competências que adquires na prática.\n\n- Liderança\n- Gestão de Projetos\n- Comunicação\n- Trabalho em Equipa\n- Inglês`
          },
          'onboarding': {
            title: 'Guia de Onboarding',
            text: `Acabaste de entrar? Segue este guia para te tornares um mestre do BEST em 7 dias.\n\nDia 1: Configuração\nDia 2: Conhecer o Mentor\nDia 3: Explorar o Hub\nDia 4: Primeira Reunião\nDia 5: Primeira Tarefa`
          },
          'faq': {
            title: 'FAQ Interna',
            text: `Q: Como me envolvevo em mais projetos?\nA: Fala com o teu coordenador de equipa ou candidata-te a uma vaga aberta.\n\nQ: Como posso candidatar-me a um Course?\nA: Vai ao portal internacional (best.eu.org).`
          },
          'memberships': {
            title: 'Memberships',
            text: `Tipos de Membros:\n- Baby Member: Novos membros em período de experiência.\n- Full Member: Membros ativos com direito a voto.\n- Observer: Membros que acompanham mas não têm responsabilidades diretas.\n- Alumnus: Antigos membros que já terminaram o curso.`
          }
        };

        Object.entries(initialContent).forEach(([id, data]) => {
          setDoc(doc(db, 'appContent', id), data);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'appContent');
    });

    return () => {
      unsubTeams();
      unsubRoles();
      unsubMetas();
      unsubTasks();
      unsubEvents();
      unsubGadgets();
      unsubAchievements();
      unsubFamilies();
      unsubSocialBodies();
      unsubMeetings();
      unsubAllMembers();
      unsubAppContent();
      unsubAnnouncements();
      unsubGlossary();
    };
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    console.log("Login initiated...");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      if (error) throw error;
      toast.success('A redirecionar...');
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error('Ups! Algo correu mal ao entrar com o Google. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Supabase keys are configured properly
    const config = getSupabaseConfigInfo();

    if (config.isPlaceholder || !config.hasKey) {
      toast.error(
        '⚠️ Configuração do Supabase Pendente: Por favor, adiciona as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no menu de Secrets do AI Studio.',
        { duration: 8000 }
      );
      return;
    }

    if (!emailAuth || !passwordAuth) {
      toast.error('Por favor, preenche todos os campos.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: emailAuth,
          password: passwordAuth,
          options: {
            data: {
              full_name: emailAuth.split('@')[0],
            }
          }
        });
        if (error) throw error;
        if (data.user && !data.session) {
          toast.success('Conta criada! Por favor confirma o teu e-mail se necessário.');
        } else {
          toast.success('Parabéns! Conta criada com sucesso.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailAuth,
          password: passwordAuth,
        });
        if (error) throw error;
        toast.success('Sessão iniciada!');
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        toast.error(
          `❌ Erro de Ligação: O teu browser não consegue contactar o Supabase no endereço "${config.url}". Garante que o URL está correto (sem espaços ou aspas) nos Secrets do AI Studio e que o teu projeto Supabase está ativo.`,
          { duration: 15000 }
        );
      } else if (errorMessage.toLowerCase().includes('invalid login credentials')) {
        toast.error('❌ Credenciais de login inválidas. Se é a tua primeira vez no Hub, clica em "Regista-te" abaixo para criares a tua conta.');
      } else if (errorMessage.toLowerCase().includes('email not confirmed')) {
        toast.error(
          '❌ E-mail não verificado! Precisas de confirmar o teu e-mail antes de entrar. Verifica a tua caixa de entrada (ou pasta Spam) para encontrar o link enviado pelo Supabase. \n\n💡 Dica: No teu painel do Supabase, podes desativar isto em Authentication > Providers > Email e desativar "Confirm email".',
          { duration: 12000 }
        );
      } else {
        toast.error(errorMessage || 'Erro ao autenticar. Verifica os teus dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Imagem demasiado grande. O limite máximo é de 50MB.');
      return;
    }

    try {
      const base64String = await compressImageFile(file);
      // Update editForm for the current editing context
      setEditForm(prev => ({ ...prev, photoURL: base64String } as any));
      
      // If we are logged in, also update the user profile in DB
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { photoURL: base64String });
        toast.success('Foto de perfil atualizada!');
      }
    } catch (error) {
      toast.error('Erro ao processar imagem.');
    }
  };

  const handleAdminUpdateSocialBody = async (data: any) => {
    try {
      const id = selectedSocialBodyMember?.id || Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'socialBodies', id), { ...data, id }, { merge: true });
      toast.success("Membro dos Órgãos Sociais atualizado!");
      setSocialBodyForm({ userId: '', role: '', position: 'Board', profileLink: '', contactDetails: '', term: '', isCurrent: true, year: new Date().getFullYear() });
      setSelectedSocialBodyMember(null);
      setIsManagingSocialBodies(false);
    } catch (error) {
      console.error("Error updating social body:", error);
      toast.error("Erro ao atualizar órgãos sociais.");
    }
  };

  const handleAdminUpdateTask = async () => {
    setLoading(true);
    try {
      const data = {
        ...taskForm,
        difficulty: Number(taskForm.difficulty),
        assignedMemberIds: taskForm.assignedMemberIds || [],
        skills: Array.isArray(taskForm.skills) ? taskForm.skills : [],
        developedSkills: Array.isArray(taskForm.developedSkills) ? taskForm.developedSkills : [],
        teamId: (taskForm.associationType === 'team' && taskForm.teamId) ? taskForm.teamId : null,
        eventId: (taskForm.associationType === 'event' && taskForm.eventId) ? taskForm.eventId : null,
        metaId: taskForm.metaId || null,
        coordinatorId: taskForm.coordinatorId || null
      };

      if (selectedTask) {
        await updateDoc(doc(db, 'tasks', selectedTask.id), data);
        toast.success('Tarefa atualizada!');
      } else {
        const newTaskRef = doc(collection(db, 'tasks'));
        await setDoc(newTaskRef, { ...data, id: newTaskRef.id });
        toast.success('Tarefa criada!');
        
        // Notification for new Task
        createNotification({
          title: 'Nova Tarefa Atribuída',
          message: `Uma nova tarefa foi criada: ${data.title}`,
          type: 'task',
          resourceId: newTaskRef.id
        });
      }
      setIsManagingTasks(false);
      setSelectedTask(null);
      setIsCreatingTask(false);
      setTaskForm({
        id: '',
        title: '',
        description: '',
        deadline: '',
        assignedMemberIds: [],
        associationType: 'team',
        teamId: '',
        eventId: '',
        metaId: '',
        status: 'Pending',
        difficulty: 0,
        skills: [],
        developedSkills: [],
        coordinatorId: ''
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error('Erro ao gerir tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdateMeeting = async (data: Partial<Meeting>) => {
    try {
      const id = data.id || Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'meetings', id), { ...data, id }, { merge: true });
      toast.success("Reunião agendada!");
      setMeetingForm({ teamId: '', eventId: '', title: '', description: '', date: '', time: '', hostId: '', responsibleIds: [] as string[], isOpenCall: false });
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error("Erro ao agendar reunião.");
    }
  };

  const handleAdminUpdateGadget = async (gadgetData: Partial<Gadget>) => {
    try {
      const id = gadgetData.id || Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'gadgets', id), { ...gadgetData, id }, { merge: true });
      toast.success("Gadget atualizado!");
    } catch (error) {
      console.error("Error updating gadget:", error);
      toast.error("Erro ao atualizar gadget.");
    }
  };

  const handleAdminUpdateAchievement = async (achData: Partial<Achievement>) => {
    try {
      const id = achData.id || Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'achievements', id), { ...achData, id }, { merge: true });
      toast.success("Conquista atualizada!");
    } catch (error) {
      console.error("Error updating achievement:", error);
      toast.error("Erro ao atualizar conquista.");
    }
  };

  const handleAdminUpdateFamily = async (famData: Partial<Family>) => {
    try {
      const id = famData.id || Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'families', id), { ...famData, id }, { merge: true });
      toast.success("Família atualizada!");
    } catch (error) {
      console.error("Error updating family:", error);
      toast.error("Erro ao atualizar família.");
    }
  };

  const handleUpdateEmail = async (newEmail: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { email: newEmail });
      setUser({ ...user, email: newEmail });
      toast.success("Email atualizado!");
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("Erro ao atualizar email.");
    }
  };
  const handleAddSkill = async () => {
    if (!user || !newSkill.trim()) return;
    if (user.skills.includes(newSkill.trim())) {
      toast.error('Esta skill já existe!');
      return;
    }
    
    try {
      const updatedSkills = [...user.skills, newSkill.trim()];
      await updateDoc(doc(db, 'users', user.uid), {
        skills: updatedSkills
      });
      setNewSkill('');
      setIsAddingSkill(false);
      toast.success('Skill adicionada com sucesso!');
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error('Erro ao adicionar skill');
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!user) return;
    try {
      const updatedSkills = user.skills.filter(s => s !== skillToRemove);
      await updateDoc(doc(db, 'users', user.uid), {
        skills: updatedSkills
      });
      toast.success('Skill removida');
    } catch (error) {
      toast.error('Erro ao remover skill');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updates: any = {
        displayName: editForm.displayName,
        bio: editForm.bio,
        phoneNumber: editForm.phoneNumber || '',
        email: editForm.email || user.email,
        photoURL: editForm.photoURL || user.photoURL,
        privateAreaLink: editForm.privateAreaLink || '',
        course: editForm.course || '',
        interests: editForm.interests || []
      };
      
      if (user?.role === 'admin') {
        updates.position = editForm.position;
        updates.membership = editForm.membership;
      }

      const previousData = { ...user };
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
      }
      
      toast.success('Perfil atualizado com sucesso!', {
        action: {
          label: 'Anular',
          onClick: async () => {
            try {
              await updateDoc(doc(db, 'users', user.uid), previousData);
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, path);
            }
          }
        }
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Update profile error:", error);
      const msg = error instanceof Error ? error.message : 'Ups! Algo correu mal ao atualizar o teu perfil.';
      toast.error(msg.startsWith('{') ? 'Erro de permissões na base de dados' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdateAnnouncement = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = {
        ...announcementForm,
        authorId: user.uid,
        createdAt: selectedAnnouncement?.createdAt || new Date().toISOString()
      };

      const path = 'announcements';
      if (selectedAnnouncement) {
        try {
          await updateDoc(doc(db, path, selectedAnnouncement.id), data);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `${path}/${selectedAnnouncement.id}`);
        }
        toast.success("Anúncio atualizado!");
      } else {
        const newRef = doc(collection(db, path));
        try {
          await setDoc(newRef, { ...data, id: newRef.id });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `${path}/${newRef.id}`);
        }
        toast.success("Anúncio publicado!");

        // Notification for new Announcement
        createNotification({
          title: 'Novo Anúncio',
          message: data.title,
          type: 'announcement',
          resourceId: newRef.id
        });
      }
      setIsManagingAnnouncements(false);
      setSelectedAnnouncement(null);
      setAnnouncementForm({ 
        title: '', 
        content: '', 
        imageUrl: '',
        associatedPersonPhotoURL: '',
        relatedPersonId: '',
        relatedPersonIds: [],
        relatedTeamId: '',
        relatedEventId: '',
        type: 'general'
      });
    } catch (error) {
      console.error("Error updating announcement:", error);
      const msg = error instanceof Error ? error.message : 'Erro ao publicar anúncio.';
      toast.error(msg.startsWith('{') ? 'Erro de permissões na base de dados' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDeleteAnnouncement = async (id: string) => {
    const path = `announcements/${id}`;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast.success("Anúncio removido.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleAdminUpdateGlossary = async () => {
    try {
      if (selectedGlossaryTerm) {
        await updateDoc(doc(db, 'glossary', selectedGlossaryTerm.id), glossaryForm);
        toast.success("Termo atualizado!");
      } else {
        const newRef = doc(collection(db, 'glossary'));
        await setDoc(newRef, { ...glossaryForm, id: newRef.id });
        toast.success("Termo adicionado!");
      }
      setIsManagingGlossary(false);
      setSelectedGlossaryTerm(null);
      setGlossaryForm({ acronym: '', meaning: '', description: '' });
    } catch (error) {
      toast.error("Erro ao gerir glossário.");
    }
  };

  const handleAdminDeleteGlossary = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'glossary', id));
      toast.success("Termo removido.");
    } catch (error) {
      toast.error("Erro ao remover termo.");
    }
  };

  const handleAdminUpdateTeam = async () => {
    setLoading(true);
    try {
      if (selectedTeam) {
        await updateDoc(doc(db, 'teams', selectedTeam.id), teamForm);
        toast.success('Equipa atualizada!');
      } else {
        const newTeamRef = doc(collection(db, 'teams'));
        await setDoc(newTeamRef, { ...teamForm, id: newTeamRef.id, memberCount: 0 });
        toast.success('Equipa criada!');
      }
      setIsManagingTeams(false);
      setSelectedTeam(null);
      setIsCreatingTeam(false);
      setTeamForm({ name: '', mission: '', contactEmail: '', category: 'Annual', coordinatorId: '', eventId: '', imageUrl: '' });
    } catch (error) {
      toast.error('Erro ao gerir equipa');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdateCall = async () => {
    setLoading(true);
    try {
      const data = {
        title: callForm.title,
        description: callForm.description,
        difficulty: callForm.difficulty,
        category: callForm.category,
        teamId: callForm.associationType === 'team' ? callForm.teamId : null,
        eventId: callForm.associationType === 'event' ? callForm.eventId : null,
        skillsRequired: callForm.skillsRequired,
        developedSkills: callForm.developedSkills,
        qualityLevel: Number(callForm.qualityLevel),
        assignedMemberIds: callForm.assignedMemberIds || [],
        deadline: callForm.deadline || '',
        applicationLink: callForm.applicationLink || '',
        responsibilities: selectedCall ? selectedCall.responsibilities : []
      };

      if (selectedCall) {
        await updateDoc(doc(db, 'roles', selectedCall.id), data);
        toast.success('Call atualizada!');
      } else {
        const newCallRef = doc(collection(db, 'roles'));
        await setDoc(newCallRef, { ...data, id: newCallRef.id });
        toast.success('Call criada!');

        // Notification for new Call
        createNotification({
          title: 'Nova Call Aberta',
          message: `Surgiu uma nova oportunidade: ${data.title}`,
          type: 'call',
          resourceId: newCallRef.id
        });
      }
      setIsManagingCalls(false);
      setSelectedCall(null);
      setIsCreatingCall(false);
      setCallForm({ 
        title: '', 
        description: '', 
        difficulty: 'Medium', 
        category: 'Local', 
        associationType: 'team',
        teamId: '', 
        eventId: '', 
        skillsRequired: [],
        developedSkills: [],
        qualityLevel: 1,
        assignedMemberIds: [],
        deadline: '',
        applicationLink: ''
      });
    } catch (error) {
      console.error("Error updating call:", error);
      toast.error('Erro ao gerir call');
    } finally {
      setLoading(false);
    }
  };

  const requestConfirmation = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmLabel = 'Confirmar', 
    cancelLabel = 'Cancelar',
    isDestructive = true
  ) => {
    setConfirmAction({ title, message, onConfirm, confirmLabel, cancelLabel, isDestructive });
  };

  const renderConfirmationDialog = () => (
    <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8 space-y-6">
        <div className="space-y-2 text-center">
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900">
            {confirmAction?.title}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-zinc-500 leading-relaxed">
            {confirmAction?.message}
          </DialogDescription>
        </div>
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]"
            onClick={() => setConfirmAction(null)}
          >
            {confirmAction?.cancelLabel}
          </Button>
          <Button 
            variant={confirmAction?.isDestructive ? "destructive" : "default"}
            className={cn(
              "flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg",
              !confirmAction?.isDestructive && "bg-red-600 hover:bg-red-700 shadow-red-100"
            )}
            onClick={() => {
              confirmAction?.onConfirm();
              setConfirmAction(null);
            }}
          >
            {confirmAction?.confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
  const getAcademicYearFromDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month < 8) { // Before September
      return `${year - 1}/${String(year).slice(-2)}`;
    } else {
      return `${year}/${String(year + 1).slice(-2)}`;
    }
  };

  const handleAdminUpdateEvent = async () => {
    setLoading(true);
    try {
      const data = {
        ...eventForm,
        academicYear: eventForm.academicYear || getAcademicYearFromDate(eventForm.startDate)
      };

      if (selectedEvent) {
        await updateDoc(doc(db, 'events', selectedEvent.id), data);
        toast.success('Evento atualizado!');
      } else {
        const newEventRef = doc(collection(db, 'events'));
        await setDoc(newEventRef, { ...data, id: newEventRef.id });
        toast.success('Evento criado!');

        // Notification for new Event
        createNotification({
          title: 'Novo Evento Agendado',
          message: `Não percas: ${data.title}`,
          type: 'event',
          resourceId: newEventRef.id
        });
      }
      setIsManagingEvents(false);
      setSelectedEvent(null);
      setIsCreatingEvent(false);
      setEventForm({ title: '', description: '', startDate: '', endDate: '', time: '', location: '', type: 'Local', imageUrl: '', coordinatorId: '', isHistorical: false, academicYear: '' });
    } catch (error) {
      toast.error('Erro ao gerir evento');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdateMeta = async () => {
    setLoading(true);
    try {
      const data = {
        ...metaForm,
        progress: Number(metaForm.progress)
      };

      if (selectedMeta) {
        await updateDoc(doc(db, 'metas', selectedMeta.id), data);
        toast.success('Meta atualizada!');
      } else {
        const newMetaRef = doc(collection(db, 'metas'));
        await setDoc(newMetaRef, { 
          ...data, 
          id: newMetaRef.id, 
          creatorId: user?.uid || 'Unknown',
          createdAt: new Date().toISOString() 
        });
        toast.success('Meta criada!');
      }
      setIsManagingMetas(false);
      setSelectedMeta(null);
      setIsCreatingMeta(false);
      setMetaForm({ title: '', description: '', teamId: '', eventId: '', creatorId: '', creatorRole: 'Board', deadline: '', status: 'Pending', progress: 0 });
    } catch (error) {
      toast.error('Erro ao gerir meta');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdateMember = async () => {
    if (!selectedMember || !user) return;
    setLoading(true);
    try {
      const updates: any = {
        displayName: editForm.displayName,
        position: editForm.position,
        membership: editForm.membership,
        role: editForm.role,
        teamId: (editForm as any).teamId === 'none' ? null : (editForm as any).teamId,
        bio: editForm.bio || '',
        phoneNumber: editForm.phoneNumber || '',
        email: editForm.email || '',
        photoURL: editForm.photoURL || '',
        privateAreaLink: editForm.privateAreaLink || '',
        course: editForm.course || '',
        interests: editForm.interests || [],
        skills: editForm.skills || [],
        previousRoles: editForm.previousRoles || []
      };

      const previousData = { ...selectedMember };
      const path = `users/${selectedMember.uid}`;
      try {
        await updateDoc(doc(db, 'users', selectedMember.uid), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
      }

      toast.success('Membro atualizado com sucesso!', {
        action: {
          label: 'Anular',
          onClick: async () => {
            try {
              await updateDoc(doc(db, 'users', selectedMember.uid), previousData);
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, path);
            }
          }
        }
      });
      setSelectedMember(null);
    } catch (error) {
      console.error("Admin update member error:", error);
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar membro';
      toast.error(msg.startsWith('{') ? 'Erro de permissões na base de dados' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTask = async (task: Task) => {
    if (!user) return;
    try {
      if (task.coordinatorId) {
        await createNotification({
          userId: task.coordinatorId,
          title: 'Nova candidatura a tarefa',
          message: `${user.displayName} candidatou-se a uma das tuas tarefas: ${task.title}. Dá-lhe feedback!`,
          type: 'task',
          resourceId: task.id
        });
      }

      const admins = allMembers.filter(m => m.role === 'admin');
      for (const admin of admins) {
        if (admin.uid !== task.coordinatorId) {
          await createNotification({
            userId: admin.uid,
            title: 'Nova candidatura a tarefa',
            message: `${user.displayName} candidatou-se à tarefa: ${task.title}.`,
            type: 'task',
            resourceId: task.id
          });
        }
      }

      toast.success('Candidatura enviada com sucesso! 🚀');
    } catch (error) {
      console.error("Error applying to task:", error);
      toast.error('Ocorreu um erro ao enviar a candidatura.');
    }
  };

  const handleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Pending' ? 'In Progress' : currentStatus === 'In Progress' ? 'Completed' : 'Pending';
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status: nextStatus });
      toast.success(`Tarefa atualizada para ${nextStatus}`);
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const renderPublicProfile = (member: UserProfile) => {
    const memberTeam = teams.find(t => t.id === member.teamId);
    const memberPreviousRoles = member.previousRoles || [];
    const memberAchievements = member.achievements || [];

    return (
      <div className="space-y-0">
        <div className="relative h-48 bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-zinc-900 z-0" />
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10 md:left-8 md:translate-x-0">
                    <div className="h-40 w-40 rounded-[2.5rem] bg-white p-2 shadow-2xl transition-transform hover:scale-105 duration-300 border border-zinc-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={member.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} 
                        alt={member.displayName} 
                        className="w-full h-full object-contain bg-white rounded-3xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
          </div>
        </div>
        
        <div className="pt-32 p-8 space-y-8">
          <div className="text-center md:text-left space-y-4">
            <div>
              <h2 className="text-4xl font-black text-zinc-900 tracking-tighter leading-none">{member.displayName}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <Badge className="bg-zinc-900 text-white border-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  {member.position || 'Membro'}
                </Badge>
                <Badge variant="outline" className="text-red-600 border-red-200 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-white">
                  {member.membership || 'Observer'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Main Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Equipa Atual</p>
                    <p className="text-sm font-bold text-zinc-900 truncate">{memberTeam?.name || 'Sem Equipa'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Curso</p>
                    <p className="text-sm font-bold text-zinc-900 truncate">{member.course || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm transition-colors hover:border-red-200 cursor-pointer group" onClick={() => window.location.href = `mailto:${member.email}`}>
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-red-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Email</p>
                    <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-red-600 transition-colors">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-zinc-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Contacto</p>
                    <p className="text-sm font-bold text-zinc-900 truncate">{member.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {member.privateAreaLink && (
                <button 
                  onClick={() => window.open(member.privateAreaLink, '_blank')}
                  className="w-full h-16 flex items-center gap-4 bg-zinc-900 rounded-[1.5rem] text-white shadow-2xl px-6 group transition-all active:scale-95"
                >
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-red-500">
                    <LockIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Área Restrita</p>
                     <p className="text-sm font-black uppercase tracking-widest">PRIVATE AREA</p>
                  </div>
                  <ExternalLink className="h-5 w-5 opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Bio */}
              {member.bio && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-l-2 border-red-600 pl-3">Sobre Mim</h3>
                  <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] shadow-inner">
                    <p className="text-sm text-zinc-600 leading-relaxed font-medium italic">
                      "{member.bio}"
                    </p>
                  </div>
                </div>
              )}

              {/* Achievements/Badges */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-2 border-red-600 pl-3">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Conquistas & Badges</h3>
                  <Trophy className="h-3 w-3 text-yellow-500" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {memberAchievements.length > 0 ? memberAchievements.map(achId => {
                    const ach = achievements.find(a => a.id === achId);
                    return (
                      <div key={achId} className="group relative">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-help">
                          {ach?.icon ? <span className="text-2xl">{ach.icon}</span> : <BadgeCheck className="h-6 w-6 text-red-600" />}
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-zinc-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                          {ach?.title || 'Conquista'}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-8 w-full border-2 border-dashed border-zinc-100 rounded-[2rem] text-center">
                       <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Sem conquistas desbloqueadas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Previous Roles */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-l-2 border-red-600 pl-3">Cargos Antigos</h3>
                <div className="space-y-2">
                  {memberPreviousRoles.length > 0 ? memberPreviousRoles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                      <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                        <HistoryIcon className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-bold text-zinc-900">{role}</p>
                    </div>
                  )) : (
                    <p className="text-[10px] text-zinc-400 italic bg-zinc-50 p-4 rounded-2xl border border-dashed border-zinc-100">Não existem cargos anteriores registados.</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-l-2 border-red-600 pl-3">Hard & Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills?.length > 0 ? member.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-white border border-zinc-200 text-zinc-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm hover:border-red-200 transition-colors">
                      {skill}
                    </Badge>
                  )) : (
                    <p className="text-[10px] text-zinc-400 italic">Nenhuma skill listada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sessão terminada');
    } catch (error) {
      toast.error('Erro ao sair');
    }
  };

  if (loading && !isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-500">A carregar...</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setLoading(false);
              setIsAuthReady(true);
            }}
            className="text-[10px] text-zinc-400"
          >
            Demora muito? Clica aqui.
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    if (viewingProfile) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-[500px] border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            {renderPublicProfile(viewingProfile)}
            <div className="p-6 pt-0 flex justify-center">
              <Button 
                variant="outline" 
                className="rounded-2xl font-bold border-zinc-200"
                onClick={() => setViewingProfile(null)}
              >
                Voltar ao Início
              </Button>
            </div>
          </Card>
          <Toaster position="top-center" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#fee2e2_0,rgba(255,255,255,0)_50%)]" />
        
        <div className="relative z-10 space-y-8 flex flex-col items-center">
          <div className="space-y-6">
            <div className="mx-auto w-44 h-44 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center p-6 border border-zinc-100">
              <LoginLogo />
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-black tracking-tighter text-zinc-900">
                BEST <span className="text-red-600 italic">Hub</span>
              </h1>
              <p className="text-zinc-500 max-w-[320px] mx-auto font-medium leading-relaxed">
                Bem-vindo de volta! A tua porta de entrada para o universo do <span className="text-red-600 font-bold">LBG Almada</span>.
              </p>
            </div>
          </div>

          <Card className="w-full max-w-sm border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 pt-10 space-y-6">
              <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">E-mail</label>
                  <input
                    type="email"
                    value={emailAuth}
                    onChange={(e) => setEmailAuth(e.target.value)}
                    placeholder="diogo.maio@best-eu.org"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-zinc-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Senha</label>
                  <input
                    type="password"
                    value={passwordAuth}
                    onChange={(e) => setPasswordAuth(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-zinc-800"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg font-bold shadow-xl shadow-red-100 transition-all active:scale-95 rounded-2xl flex items-center justify-center gap-3 mt-2"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      <span>{isSignUp ? 'Criar Conta e Entrar' : 'Iniciar Sessão'}</span>
                    </>
                  )}
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-red-600 hover:underline font-bold transition-all"
                  >
                    {isSignUp ? 'Já tens conta? Iniciar Sessão' : 'Primeira vez no Hub? Regista-te'}
                  </button>
                </div>
              </form>

               <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest justify-center">
                  <div className="h-[1px] flex-1 bg-zinc-100" />
                  <span>Só para membros verificados</span>
                  <div className="h-[1px] flex-1 bg-zinc-100" />
                </div>
                
                <div className="pt-1 flex flex-col items-center gap-2">
                  {(() => {
                    const config = getSupabaseConfigInfo();
                    const isConfigured = !config.isPlaceholder && config.hasKey;
                    
                    const keyString = (serverConfigDiag?.supabaseAnonKey || '').trim();
                    const isUsingServerKeys = !!serverConfigDiag?.supabaseAnonKey;
                    const activeKeyToCheck = isUsingServerKeys ? keyString : 'sb_publishable_AhzhpgsAqhpr6hd9fv0rjg_NsUoMwxf';
                    
                    const isStripeOrInvalidKey = activeKeyToCheck.startsWith('sb_publishable_') || activeKeyToCheck.startsWith('pk_');
                    const hasDots = activeKeyToCheck.includes('.');
                    const isPossiblyInvalidKey = isConfigured && (isStripeOrInvalidKey || !hasDots);

                    if (isConfigured && !isPossiblyInvalidKey) {
                      return null;
                    }

                    return (
                      <div className="w-full flex flex-col items-center gap-2">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm",
                          isConfigured && !isPossiblyInvalidKey
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                            : "bg-amber-50 text-amber-700 border border-amber-200/50"
                        )}>
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full", 
                            isConfigured && !isPossiblyInvalidKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          )} />
                          {isConfigured && !isPossiblyInvalidKey 
                            ? "Acesso: Supabase (Configurado)" 
                            : isPossiblyInvalidKey 
                            ? "Acesso: Supabase (Chave Inválida)" 
                            : "Acesso: Supabase (Configuração Pendente)"}
                        </span>

                        {(isPossiblyInvalidKey || !isConfigured) && (
                          <div className="mt-2 text-left bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl w-full text-xs space-y-2.5 shadow-sm text-zinc-700">
                            <p className="font-bold text-red-600 flex items-center gap-1">
                              <span>⚠️ Configuração Incorreta Detetada</span>
                            </p>
                            
                            {isStripeOrInvalidKey && (
                              <p className="leading-relaxed text-[11px] text-zinc-600">
                                A tua chave (<strong>{isUsingServerKeys ? "nos Secrets" : "no código fallback"}</strong>) começa por <code className="bg-red-50 text-red-600 px-1 py-0.5 rounded">sb_publishable_</code>. 
                                Isto é uma chave de publicação do Stripe, <strong>não é uma chave de acesso (Anon Key) do Supabase</strong>.
                              </p>
                            )}

                            {!hasDots && !isStripeOrInvalidKey && (
                              <p className="leading-relaxed text-[11px] text-zinc-600">
                                As chaves do Supabase são tokens JWT longos e têm de conter pontos (<code className="bg-zinc-100 px-1 py-0.5 rounded">.</code>). A chave atual parece incompleta ou inválida.
                              </p>
                            )}

                            <div className="bg-white p-2.5 rounded-xl border border-zinc-100 text-[10px] space-y-1 font-mono">
                              <div><strong>URL em uso:</strong> <span className="text-zinc-500">{config.url}</span></div>
                              <div><strong>Origem:</strong> <span className="text-zinc-500">{isUsingServerKeys ? "Secrets do AI Studio" : "Código fallback (efcxoqrjspn...)"}</span></div>
                              {serverConfigDiag?.diagnostics && (
                                <>
                                  <div><strong>Secret URL no Servidor:</strong> <span className="text-zinc-500">{serverConfigDiag.diagnostics.hasUrl ? "Sim (" + serverConfigDiag.diagnostics.maskedUrl + ")" : "Não"}</span></div>
                                  <div><strong>Secret Key no Servidor:</strong> <span className="text-zinc-500">{serverConfigDiag.diagnostics.hasKey ? "Sim (" + serverConfigDiag.diagnostics.maskedKey + ")" : "Não"}</span></div>
                                </>
                              )}
                            </div>

                            <div className="leading-relaxed text-[11px] text-zinc-600 font-medium">
                              <strong>Como corrigir:</strong>
                              <ol className="list-decimal pl-4 mt-1 space-y-1">
                                <li>Acede ao teu dashboard do <strong>Supabase</strong> &gt; <strong>Project Settings</strong> &gt; <strong>API</strong>.</li>
                                <li>Copia o <strong>Project URL</strong> e a <strong>`anon` `public`</strong> key (certifica-te de que a chave começa por <code className="bg-zinc-100 px-1">eyJ...</code>).</li>
                                <li>No menu de <strong>Secrets</strong> do AI Studio, define:
                                  <ul className="list-disc pl-4 mt-0.5">
                                    <li><code className="bg-zinc-100 px-1">VITE_SUPABASE_URL</code></li>
                                    <li><code className="bg-zinc-100 px-1">VITE_SUPABASE_ANON_KEY</code></li>
                                  </ul>
                                </li>
                                <li>Verifica se não há aspas extra ou espaços.</li>
                              </ol>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[8px] font-black text-zinc-300 uppercase tracking-[0.2em]">
              <span className="shrink-0">Building</span>
              <div className="h-1 w-1 rounded-full bg-zinc-200 shrink-0" />
              <span className="shrink-0">Empowering</span>
              <div className="h-1 w-1 rounded-full bg-zinc-200 shrink-0" />
              <span className="shrink-0">Together</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold tracking-tight">BEST Almada Hub v1.0</p>
          </div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  if (user.status === 'pending' || user.status === 'rejected') {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-white rounded-3xl shadow-xl">
            <Clock className="h-12 w-12 text-red-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Quase lá! ⏳</h1>
            <p className="text-zinc-500 max-w-[300px] mx-auto font-medium text-sm">
              {user.status === 'pending' 
                ? 'Os administradores estão a validar o teu acesso. Volta daqui a bocado! 👋' 
                : 'O teu acesso não foi aprovado por agora. Se achas que é um erro, fala com a Board.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full rounded-2xl font-bold h-12"
          >
            Sair da Conta
          </Button>
        </div>

        <div className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
          ESTADO: <span className={cn("font-black", user.status === 'pending' ? "text-orange-500" : "text-red-500")}>
            {user.status === 'pending' ? 'PENDENTE' : 'REJEITADO'}
          </span>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  const renderHome = () => (
    <div className="space-y-6 pt-2">
      <section className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">Olá, {user.displayName.split(' ')[0]}! 👋</h2>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors" onClick={() => setActiveTab('history')}>
            <Clock className="h-5 w-5 text-red-600" />
          </div>
          {user?.role === 'admin' && (
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors" onClick={() => setIsManagingMembers(true)}>
              <UserCog className="h-5 w-5 text-zinc-600" />
            </div>
          )}
        </div>
      </section>

      {renderAnnouncements()}

      <Dialog open={!!selectedAnnouncementDetails} onOpenChange={(open) => !open && setSelectedAnnouncementDetails(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] overflow-hidden p-0 border-none">
          {selectedAnnouncementDetails && (
            <div className="space-y-0">
              {selectedAnnouncementDetails.imageUrl ? (
                <div className="aspect-video w-full relative">
                  <img src={selectedAnnouncementDetails.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedAnnouncementDetails.title}</h3>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{new Date(selectedAnnouncementDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 pb-4 bg-zinc-900">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedAnnouncementDetails.title}</h3>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{new Date(selectedAnnouncementDetails.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              <div className="p-8 pt-6 space-y-6 bg-white">
                <div className="text-sm text-zinc-600 leading-relaxed font-medium markdown-content">
                  <SafeMarkdown>{selectedAnnouncementDetails.content}</SafeMarkdown>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                   {selectedAnnouncementDetails.associatedPersonPhotoURL && (
                     <div className="flex items-center gap-3">
                       <Avatar className="h-12 w-12 border-2 border-red-50">
                         <AvatarImage src={selectedAnnouncementDetails.associatedPersonPhotoURL} />
                         <AvatarFallback><User className="h-6 w-6 text-zinc-300" /></AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Membro Destaque</p>
                         <p className="text-sm font-bold text-zinc-900">Associado ao anúncio</p>
                       </div>
                     </div>
                   )}
                   <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs" onClick={() => setSelectedAnnouncementDetails(null)}>Fechar</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Tarefas Prioritárias</h3>
          <Button variant="ghost" size="sm" className="text-red-600 font-bold text-xs">Ver todas</Button>
        </div>
        <div className="space-y-3">
          {tasks.length > 0 ? tasks.filter(t => {
            if (t.status === 'Completed') return false;
            return true;
          }).slice(0, 3).map((task) => (
            <Card key={task.id} className="border-none bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => {
              setSelectedTask(task);
              setIsViewingTask(true);
            }}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                  task.status === 'In Progress' ? "bg-red-50 text-red-600" : "bg-zinc-50 text-zinc-400 group-hover:bg-red-50 group-hover:text-red-600"
                )}>
                  <Clock className={cn("h-6 w-6", task.status === 'In Progress' && "animate-pulse")} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate group-hover:text-red-600 transition-colors">{task.title}</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{task.deadline}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={cn("h-2 w-2", star <= (task.difficulty || 0) ? "text-yellow-500 fill-yellow-500" : "text-zinc-200 fill-zinc-100")} />
                    )) }
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="flex flex-col items-center justify-center py-10 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center px-4">Tudo em dia! 🎉 <br/> Ainda não há tarefas novas por aqui.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Calls em Destaque</h3>
          <Button variant="ghost" size="sm" className="text-red-600 font-bold text-xs" onClick={() => setActiveTab('opportunities')}>Explorar</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          {opportunities.filter(o => !isCallExpired(o.deadline)).length > 0 ? opportunities.filter(o => !isCallExpired(o.deadline)).slice(0, 6).map((opp) => (
            <Card key={opp.id} className="min-w-[260px] shrink-0 border-none bg-white shadow-sm hover:shadow-xl transition-all group">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                    <Badge className="bg-red-50 text-red-600 border-none font-bold text-[10px] px-2 py-0.5" variant="secondary">
                      {teams.find(t => t.id === opp.teamId)?.name || 'Geral'}
                    </Badge>
                    <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-red-600 transition-colors">
                      <Briefcase className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-zinc-900 group-hover:text-red-600 transition-colors">{opp.title}</h4>
                  </div>
                  <div className="pt-2 flex flex-col items-start gap-1 border-t border-zinc-50">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dificuldade</span>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={cn(
                            "h-3 w-3", 
                            star <= (opp.qualityLevel || 1) ? "text-yellow-500 fill-yellow-500" : "text-zinc-200 fill-zinc-100"
                          )} 
                        />
                      ))}
                    </div>
                    {opp.applicationLink ? (
                      <Button 
                        size="sm" 
                        className="h-8 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(opp.applicationLink, '_blank');
                        }}
                      >
                        Candidatar-me
                      </Button>
                    ) : (
                      <Button size="sm" className="h-8 px-4 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest cursor-not-allowed opacity-50">Candidatar</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <p className="text-xs text-zinc-400 py-4 text-center w-full font-medium">De momento não há calls abertas. <br/> Volta mais tarde! 👋</p>
          )}
        </div>
      </section>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col items-center space-y-4 pt-4">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl overflow-hidden transition-transform group-hover:scale-105 duration-300">
            <AvatarImage src={user.photoURL} />
            <AvatarFallback className="text-3xl font-black bg-red-50 text-red-600">{user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 rounded-full bg-green-500 p-1.5 border-4 border-white shadow-lg">
            <Check className="h-3 w-3 text-white stroke-[4]" />
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer overflow-hidden backdrop-blur-sm">
            <label className="cursor-pointer p-full w-full h-full flex flex-col items-center justify-center">
              <Camera className="h-6 w-6 mb-1" />
              <span className="text-[8px] font-black text-center uppercase tracking-widest leading-tight">Alterar Foto</span>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-zinc-900">{user.displayName}</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            <Badge className="bg-zinc-900 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
              {user.position || 'Membro'}
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 cursor-pointer hover:bg-red-50" onClick={() => setActiveTab('memberships')}>
              {user.membership || 'Observer'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none bg-white shadow-sm rounded-[2rem]">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Informação de Membro</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-zinc-400 hover:text-red-600" onClick={() => {
                   setEditForm({ ...user } as any);
                   setIsEditingProfile(true);
              }}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Equipa</p>
                  <p className="text-sm font-bold text-zinc-900 truncate">
                    {teams.find(t => t.id === user.teamId)?.name || 'Sem Equipa'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Curso</p>
                  <p className="text-sm font-bold text-zinc-900 truncate">{user.course || 'Não definido'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Número</p>
                  <p className="text-sm font-bold text-zinc-900 truncate">{user.phoneNumber || 'Não definido'}</p>
                </div>
              </div>

              {user.privateAreaLink && (
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                    <Archive className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">Private Area</p>
                    <a 
                      href={user.privateAreaLink.startsWith('http') ? user.privateAreaLink : `https://${user.privateAreaLink}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-sm font-black text-zinc-900 hover:text-red-600 transition-colors truncate block"
                    >
                      PRIVATE AREA
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Bio Section */}
          <Card className="border-none bg-zinc-900 text-white rounded-[2rem] shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between opacity-40">
                <h3 className="text-[10px] font-black uppercase tracking-widest">Sobre Mim</h3>
                <Edit2 className="h-3 w-3 cursor-pointer" onClick={() => {
                  setEditForm({...user} as any);
                  setIsEditingProfile(true);
                }} />
              </div>
              <p className="text-sm font-medium leading-relaxed italic opacity-80">
                {user.bio || 'Adiciona uma breve descrição sobre ti para que outros membros te conheçam melhor...'}
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            {/* Achievements/Badges */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-l-2 border-red-600 pl-3">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">As Minhas Conquistas</h3>
                <Trophy className="h-3 w-3 text-yellow-500" />
              </div>
              <div className="flex flex-wrap gap-3">
                {achievements.filter(a => (user.achievements || []).includes(a.id)).length > 0 ? achievements.filter(a => (user.achievements || []).includes(a.id)).map(ach => (
                  <div key={ach.id} className="group relative">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center hover:scale-110 transition-transform cursor-help">
                      {ach?.icon ? <span className="text-2xl">{ach.icon}</span> : <BadgeCheck className="h-6 w-6 text-red-600" />}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-zinc-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                      {ach?.title}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 w-full border-2 border-dashed border-zinc-100 rounded-[2rem] text-center">
                     <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Sem conquistas desbloqueadas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Previous Roles */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-l-2 border-red-600 pl-3">Cargos Antigos</h3>
              <div className="space-y-2">
                {(user.previousRoles || []).length > 0 ? (user.previousRoles || []).map((role: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                    <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                      <HistoryIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-zinc-900">{role}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-[10px] font-medium text-zinc-400 italic">Nenhum cargo anterior registado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity levels could go here if they are data-driven */}

      {/* Skills Section */}
      <Card className="border-none bg-zinc-100/50 shadow-none">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-600 text-white">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <h3 className="font-bold text-zinc-900">Especialização</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skills.length > 0 ? user.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-white text-zinc-700 border-none shadow-sm px-3 py-1 text-xs font-medium flex items-center gap-1">
                {skill}
                {(user.role === 'admin' || user.role === 'management') && (
                  <button 
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            )) : (
              <p className="text-xs text-zinc-400 italic">Nenhuma especialização adicionada.</p>
            )}
            
            {(user.role === 'admin' || user.role === 'management') && (
              <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 bg-red-600 text-white hover:bg-red-700 hover:text-white rounded-full px-4 text-xs font-bold gap-2">
                    <Plus className="h-3 w-3" /> Adicionar Skill
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Especialização</DialogTitle>
                    <DialogDescription>
                      Adiciona uma nova competência ao perfil.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Competência</Label>
                      <Select value={newSkill} onValueChange={setNewSkill}>
                        <SelectTrigger className="rounded-xl border-zinc-200">
                          <SelectValue placeholder="Escolher competência" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {PREDEFINED_SKILLS.filter(s => !user.skills.includes(s)).map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddSkill} disabled={!newSkill} className="bg-red-600 hover:bg-red-700">Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real Activity Log Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Log de Atividade</h3>
          <Button variant="ghost" size="sm" className="text-red-600 font-bold text-xs" onClick={() => setActiveTab('history')}>Ver Histórico</Button>
        </div>
        <div className="space-y-3">
          {user.recentActivity && user.recentActivity.length > 0 ? (
            user.recentActivity.slice().reverse().map((act) => (
              <div key={act.id} className="flex gap-4 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                <div className="h-8 w-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-600 leading-snug">{act.content}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(act.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-400 italic text-center py-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-100">
              Sem registos de atividade manual.
            </p>
          )}
        </div>
      </section>

      {/* Edit/Logout Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          className="flex-1 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-lg" 
          onClick={() => {
            setEditForm({
              displayName: user.displayName || '',
              email: user.email || '',
              phoneNumber: user.phoneNumber || '',
              bio: user.bio || '',
              position: user.position || '',
              membership: user.membership || 'Observer',
              role: user.role,
              teamId: user.teamId || '',
              photoURL: user.photoURL || '',
              course: user.course || '',
              privateAreaLink: user.privateAreaLink || '',
              skills: user.skills || [],
              previousRoles: user.previousRoles || [],
              interests: user.interests || []
            } as any);
            setIsEditingProfile(true);
          }}
        >
          Editar Perfil
        </Button>
        <Button variant="ghost" className="flex-1 h-12 rounded-xl text-red-600 font-bold hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </div>
  );

  const renderTeams = () => {
    if (selectedTeamView) {
      const teamMeetings = meetings.filter(m => m.teamId === selectedTeamView.id);
      const teamMembers = allMembers.filter(m => m.teamId === selectedTeamView.id);
      const coordinator = allMembers.find(m => m.uid === selectedTeamView.coordinatorId);

      return (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-500" onClick={() => setSelectedTeamView(null)}>
            <ChevronRight className="h-4 w-4 rotate-180" /> Voltar às Equipas
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-black text-red-900 uppercase tracking-tight">{selectedTeamView.name}</h2>
                {selectedTeamView.category === 'Events' && selectedTeamView.eventId && (
                  <Badge 
                    variant="outline" 
                    className="bg-red-50 text-red-600 border-red-100 uppercase text-[8px] font-black tracking-widest cursor-pointer hover:bg-red-100"
                    onClick={() => {
                      const ev = events.find(e => e.id === selectedTeamView.eventId);
                      if (ev) setSelectedEventDetails(ev);
                    }}
                  >
                    Evento: {events.find(e => e.id === selectedTeamView.eventId)?.title || 'Desconhecido'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-zinc-500 font-medium max-w-2xl">{selectedTeamView.mission}</p>
            </div>
            {coordinator && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => setViewingProfile(coordinator)}>
                <Avatar className="h-10 w-10 border-2 border-red-50">
                  <AvatarImage src={coordinator.photoURL} />
                  <AvatarFallback>{coordinator.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Coordenador</p>
                  <p className="text-sm font-bold text-zinc-900">{coordinator.displayName}</p>
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="calls" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-2xl h-12">
              <TabsTrigger value="calls" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600">Calls</TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600">Calendário</TabsTrigger>
            </TabsList>

            <TabsContent value="calls" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Calls Disponíveis</h3>
                {(user?.role === 'admin' || user?.role === 'management') && (
                  <Button size="sm" className="bg-red-600 h-8 text-[10px] font-bold" onClick={() => {
                    setCallForm({ 
                      title: '', 
                      description: '', 
                      difficulty: 'Medium', 
                      category: 'Local', 
                      associationType: 'team',
                      teamId: selectedTeamView.id,
                      eventId: selectedTeamView.eventId || '',
                      skillsRequired: [],
                      developedSkills: [],
                      qualityLevel: 1,
                      assignedMemberIds: [],
                      deadline: '',
                      applicationLink: ''
                    });
                    setSelectedCall(null);
                    setIsCreatingCall(true);
                    setIsManagingCalls(true);
                  }}>
                    <Plus className="h-3 w-3 mr-1" /> Nova Call
                  </Button>
                )}
              </div>
              <div className="grid gap-3">
                {opportunities.filter(o => {
                  const isTeamMatch = o.teamId === selectedTeamView.id;
                  const isEventMatch = !!(o.eventId && selectedTeamView.eventId && o.eventId === selectedTeamView.eventId);
                  return isTeamMatch || isEventMatch;
                }).length > 0 ? (
                  opportunities.filter(o => {
                    const isTeamMatch = o.teamId === selectedTeamView.id;
                    const isEventMatch = !!(o.eventId && selectedTeamView.eventId && o.eventId === selectedTeamView.eventId);
                    return isTeamMatch || isEventMatch;
                  }).map(opp => (
                    <OpportunityCard key={opp.id} opp={opp} teams={teams} isClickable onClick={() => setViewingCall(opp)} />
                  ))
                ) : (
                  <div className="py-12 text-center space-y-4 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100">
                    <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto">
                      <Target className="h-8 w-8 text-zinc-300" />
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase">Sem calls de momento para esta equipa.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Reuniões e Calls</h3>
                {(user?.role === 'admin' || user?.role === 'management') && (
                  <Button size="sm" className="bg-red-600 h-8 text-[10px] font-bold" onClick={() => {
                    setMeetingForm({ 
                      teamId: selectedTeamView.id, 
                      eventId: selectedTeamView.eventId || '',
                      title: '', 
                      description: '', 
                      date: '', 
                      time: '', 
                      hostId: user?.uid || '', 
                      responsibleIds: [] as string[], 
                      isOpenCall: false 
                    });
                    setIsManagingMeetings(true);
                  }}>
                    <Plus className="h-3 w-3 mr-1" /> Nova Reunião
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {teamMeetings.length > 0 ? teamMeetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((meeting) => {
                  const host = allMembers.find(u => u.uid === meeting.hostId);
                  return (
                    <Card key={meeting.id} className="border-none bg-white shadow-sm overflow-hidden">
                      <CardContent className="p-4 flex gap-4">
                        <div className="text-center shrink-0 w-12 bg-zinc-50 rounded-xl p-2 flex flex-col justify-center">
                          <p className="text-[10px] font-black text-red-600 uppercase">{new Date(meeting.date).toLocaleDateString('pt-PT', { month: 'short' })}</p>
                          <p className="text-lg font-black leading-none">{new Date(meeting.date).getDate()}</p>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-zinc-900">{meeting.title}</h4>
                              {meeting.isOpenCall && <Badge className="bg-green-100 text-green-600 border-none text-[8px]">Open Call</Badge>}
                            </div>
                            <p className="text-[10px] text-zinc-400 font-medium">{meeting.time} • {meeting.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Host:</span>
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={host?.photoURL} />
                                <AvatarFallback>{host?.displayName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-[10px] font-bold text-zinc-600">{host?.displayName || 'TBD'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 space-y-2">
                    <Calendar className="h-8 w-8 text-zinc-300" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sem reuniões agendadas.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-red-900 uppercase tracking-tight">Equipas o LBG</h2>
          <p className="text-sm text-zinc-500 font-medium">Conhece a estrutura e os membros de o LBG.</p>
        </div>

        <Tabs defaultValue="annual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-2xl h-12">
            <TabsTrigger value="annual" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600">Anuais</TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600">Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="annual" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {teams.filter(t => t.category === 'Annual' || !t.category).map((team) => (
                <Card key={team.id} className="border-none bg-white shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-all flex flex-col md:flex-row" onClick={() => setSelectedTeamView(team)}>
                   {team.imageUrl && (
                      <div className="w-full md:w-32 h-32 md:h-auto overflow-hidden shrink-0">
                        <img src={team.imageUrl} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                   )}
                   <div className="flex-1">
                      <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                    </div>
                    <CardTitle className="text-lg group-hover:text-red-600 transition-colors font-black uppercase tracking-tight">{team.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 font-medium">{team.mission}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {allMembers.filter(m => m.teamId === team.id).slice(0, 4).map((m) => (
                          <Avatar key={m.uid} className="h-7 w-7 border-2 border-white">
                            <AvatarImage src={m.photoURL} />
                            <AvatarFallback>{m.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {allMembers.filter(m => m.teamId === team.id).length > 4 && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-[8px] font-bold text-zinc-500">
                            +{allMembers.filter(m => m.teamId === team.id).length - 4}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50">
                        Ver Detalhes <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                   </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {teams.filter(t => t.category === 'Events').map((team) => {
                const associatedEvent = events.find(e => e.id === (team as any).eventId);
                return (
                  <Card key={team.id} className="border-none bg-white shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-all flex flex-col md:flex-row" onClick={() => setSelectedTeamView(team)}>
                    {team.imageUrl && (
                      <div className="w-full md:w-32 h-32 md:h-auto overflow-hidden shrink-0">
                        <img src={team.imageUrl} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between min-h-[14px]">
                          {associatedEvent && (
                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest bg-blue-50 text-blue-600 border-blue-100">
                              {associatedEvent.title}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg group-hover:text-red-600 transition-colors font-black uppercase tracking-tight">{team.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2 font-medium">{team.mission}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex -space-x-2">
                            {allMembers.filter(m => m.teamId === team.id).slice(0, 4).map((m) => (
                              <Avatar key={m.uid} className="h-7 w-7 border-2 border-white">
                                <AvatarImage src={m.photoURL} />
                                <AvatarFallback>{m.displayName.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ))}
                            {allMembers.filter(m => m.teamId === team.id).length > 4 && (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-[8px] font-bold text-zinc-500">
                                +{allMembers.filter(m => m.teamId === team.id).length - 4}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50">
                            Ver Detalhes <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
              {teams.filter(t => t.category === 'Events').length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-8">Nenhuma equipa de eventos registada.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderOpportunities = () => {
    const canSeeArchive = user?.role === 'admin' || user?.role === 'management' || teams.some(t => t.coordinatorId === user?.uid);
    const localActive = opportunities.filter(o => (o.category === 'Local' || !o.category) && !isCallExpired(o.deadline));
    const internationalActive = opportunities.filter(o => o.category === 'International' && !isCallExpired(o.deadline));
    const archived = opportunities.filter(o => isCallExpired(o.deadline));

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Calls</h2>
          <p className="text-sm text-zinc-500">Encontra o teu próximo desafio no BEST.</p>
        </div>

        <Tabs defaultValue="local" className="w-full">
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <TabsList className={cn("inline-flex w-fit min-w-full bg-zinc-100 p-1 rounded-xl h-12 mb-2")}>
              <TabsTrigger value="local" className="flex-1 whitespace-nowrap rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Locais</TabsTrigger>
              <TabsTrigger value="international" className="flex-1 whitespace-nowrap rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Internacionais</TabsTrigger>
              {canSeeArchive && (
                <TabsTrigger value="archive" className="flex-1 whitespace-nowrap rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 px-6">
                  <Archive className="h-3 w-3" /> Arquivo
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="local" className="space-y-4 mt-6">
            {localActive.length > 0 ? (
              localActive.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} teams={teams} />
              ))
            ) : (
              <p className="text-sm text-zinc-400 text-center py-8">Nenhuma call local aberta.</p>
            )}
          </TabsContent>

          <TabsContent value="international" className="space-y-4 mt-6">
            {internationalActive.length > 0 ? (
              internationalActive.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} teams={teams} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 space-y-4">
                <Globe className="h-10 w-10 text-zinc-300" />
                <div className="text-center">
                  <p className="text-sm font-bold text-zinc-900">Sem Calls Internacionais</p>
                  <p className="text-xs text-zinc-400">De momento não existem oportunidades internacionais abertas.</p>
                </div>
              </div>
            )}
          </TabsContent>

          {canSeeArchive && (
            <TabsContent value="archive" className="space-y-4 mt-6">
              {archived.length > 0 ? (
                archived.map((opp) => (
                  <div key={opp.id} className="opacity-70 grayscale-[0.5]">
                    <OpportunityCard opp={opp} teams={teams} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-400 text-center py-8">Nenhuma call no arquivo.</p>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  };

  const OpportunityCard = ({ opp, teams, isClickable, onClick }: { opp: Role, teams: Team[], isClickable?: boolean, onClick?: () => void, key?: string }) => (
    <Card 
      className={cn(
        "border-zinc-100 bg-white shadow-sm overflow-hidden group transition-all",
        (isClickable || true) && "cursor-pointer hover:shadow-md hover:border-red-100"
      )}
      onClick={onClick || (() => setViewingCall(opp))}
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold group-hover:text-red-600 transition-colors">{opp.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {opp.teamId && (
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                  Equipa: {teams.find(t => t.id === opp.teamId)?.name || 'Geral'}
                </p>
              )}
              {opp.eventId && (
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Evento: {events.find(e => e.id === opp.eventId)?.title || 'Evento'}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
          {opp.description}
        </p>

        {opp.deadline && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-widest">
            <Calendar className="h-3 w-3" /> Deadline: {opp.deadline}
          </div>
        )}

        <div className="space-y-3">
          {opp.skillsRequired && opp.skillsRequired.length > 0 && (
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Skills Necessárias</span>
              <div className="flex flex-wrap gap-1">
                {opp.skillsRequired.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-[9px] bg-zinc-100 text-zinc-600 border-none font-bold">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {opp.developedSkills && opp.developedSkills.length > 0 && (
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Skills a Desenvolver</span>
              <div className="flex flex-wrap gap-1">
                {opp.developedSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-[9px] bg-orange-50 text-orange-600 border-none font-bold">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col items-start gap-2 border-t border-zinc-50">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dificuldade</span>
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={cn(
                    "h-4 w-4 transition-all", 
                    star <= (opp.qualityLevel || 1) ? "text-yellow-500 fill-yellow-500" : "text-zinc-200 fill-zinc-100"
                  )} 
                />
              ))}
            </div>
            {opp.applicationLink ? (
              <Button 
                size="sm" 
                className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100"
                onClick={(e) => { e.stopPropagation(); window.open(opp.applicationLink!, '_blank'); }}
              >
                Candidatar-me
              </Button>
            ) : (
              <Button size="sm" disabled className="h-10 px-6 rounded-xl bg-zinc-100 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                Indisponível
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderMemberships = () => {
    const membershipTypes = [
      {
        id: 'Observer',
        title: 'Observer',
        description: 'Estudante atualmente na UNL, com idade igual ou inferior a 30 anos, interessado no BEST e que queira juntar-se a o LBG.',
        details: [
          'Admissão decidida pelo HR Coordinator ou delegado.',
          'Pode perder o estatuto após 3 meses de inatividade sem justificação válida.',
          'Pode ser proposto para exclusão por comportamento prejudicial.'
        ]
      },
      {
        id: 'Baby Member',
        title: 'Baby Member',
        description: 'Membro ativo de o LBG, com idade igual ou inferior a 30 anos, que estuda na UNL ou parou há menos de 1 ano.',
        details: [
          'Sem direito a voto.',
          'Pode ser proposto a partir de Observer após organização de eventos, participação ativa em equipas/projetos, ou 6+ meses como Observer.',
          'Pode tornar-se Inativo após 6 meses sem atividade.'
        ]
      },
      {
        id: 'Full Member',
        title: 'Full Member',
        description: 'Membro ativo de o LBG, com idade igual ou inferior a 30 anos, que estuda na UNL ou saiu há menos de 1 ano.',
        details: [
          'Tem direito a voto.',
          'Pode ser proposto a partir de Baby Member após organizar eventos elegíveis ou ser eleito coordenador de equipa.',
          'Pode tornar-se Inativo após 6 meses de inatividade, falha de assiduidade ou ausência repetida em votações.'
        ]
      },
      {
        id: 'Alumnus Member',
        title: 'Alumnus Member',
        description: 'Membro não ativo que mantém interesse no BEST.',
        details: [
          'Sem direito a voto.',
          'Pode ser solicitado por Baby ou Full Members.',
          'Pode ser excluído por comportamento prejudicial.'
        ]
      }
    ];

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-red-900 uppercase tracking-tight">Memberships</h2>
          <p className="text-sm text-zinc-500 font-medium">Os diferentes níveis de envolvimento em o LBG.</p>
        </div>

        <div className="grid gap-6">
          {membershipTypes.map((type) => (
            <Card key={type.id} id={`membership-${type.id}`} className="border-none bg-white shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-zinc-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black uppercase tracking-tight">{type.title}</CardTitle>
                  <Award className="h-6 w-6 text-red-500" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                  {type.description}
                </p>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Definição e Regras</h4>
                  <ul className="space-y-2">
                    {type.details.map((detail, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                        <p className="text-xs text-zinc-500 leading-relaxed">{detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderSocialBodies = () => {
    const boardMembers = socialBodies.filter(m => m.position === 'Board' && m.isCurrent);
    const assemblyMembers = socialBodies.filter(m => m.position === 'Mesa da Assembleia Geral' && m.isCurrent);
    const fiscalMembers = socialBodies.filter(m => m.position === 'Conselho Fiscal' && m.isCurrent);

  const renderMemberCard = (member: SocialBodyMember) => {
      const userProfile = allMembers.find(u => u.uid === member.userId);
      return (
        <Card 
          key={member.id} 
          className="border-none bg-white shadow-sm hover:shadow-xl transition-all overflow-hidden group rounded-[2.5rem] cursor-pointer border-2 border-transparent hover:border-red-50"
          onClick={() => userProfile && setViewingProfile(userProfile)}
        >
          <CardContent className="p-8 flex items-center gap-8">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 rounded-3xl border-4 border-zinc-50 group-hover:border-red-100 transition-colors shadow-inner">
                <AvatarImage src={member.photoURL || userProfile?.photoURL} className="object-cover" />
                <AvatarFallback className="bg-zinc-100 text-zinc-400 text-2xl font-black">
                  {userProfile?.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg border-4 border-white group-hover:bg-red-600 transition-colors">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.25em] mb-1">{member.role}</p>
                <h4 className="text-2xl font-black text-zinc-900 truncate tracking-tight leading-none">{userProfile?.displayName || 'Membro do BEST'}</h4>
              </div>
              <div className="flex items-center gap-4 pt-2">
                {member.contactDetails && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-100">
                    <Mail className="h-3 w-3 text-zinc-400" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">{member.contactDetails}</span>
                  </div>
                )}
                {userProfile?.membership && (
                   <Badge variant="outline" className="text-[9px] font-black uppercase text-zinc-400 border-zinc-200 px-3">
                     {userProfile.membership}
                   </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="h-6 w-6 text-zinc-200 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="space-y-10 pb-20">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-red-900 uppercase tracking-tighter">Órgãos Sociais</h2>
          <p className="text-base text-zinc-500 font-medium leading-relaxed max-w-sm">
            Os responsáveis pela gestão estratégica, fiscalização e condução das assembleias de o LBG Almada.
          </p>
        </div>

        <Tabs defaultValue="board" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-100 p-1.5 rounded-[2rem] h-14 shadow-inner">
            <TabsTrigger value="board" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap px-1">Board</TabsTrigger>
            <TabsTrigger value="assembly" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap px-1">Assembleia</TabsTrigger>
            <TabsTrigger value="fiscal" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap px-1">Fiscal</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-8 mt-10">
            <div className="p-8 rounded-[2.5rem] bg-red-600 text-white space-y-6 shadow-2xl shadow-red-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield className="h-32 w-32" />
              </div>
              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Shield className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Board</h3>
                    <p className="text-xs opacity-70 font-bold uppercase tracking-[0.2em]">Direção Executiva</p>
                  </div>
                </div>
                <p className="text-sm opacity-90 leading-relaxed font-medium">
                  Responsável pela gestão diária, representação externa e execução da estratégia anual do grupo local.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {boardMembers.length > 0 ? boardMembers.map(renderMemberCard) : (
                <div className="py-16 text-center bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200">
                  <p className="text-sm font-bold text-zinc-400">Nenhum membro registado na Direção.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assembly" className="space-y-8 mt-10">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900 text-white space-y-6 shadow-2xl shadow-zinc-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Users className="h-32 w-32" />
              </div>
              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Mesa da Assembleia Geral</h3>
                    <p className="text-xs opacity-50 font-bold uppercase tracking-[0.2em]">Poder Deliberativo</p>
                  </div>
                </div>
                <p className="text-sm opacity-80 leading-relaxed font-medium">
                  Conduz as reuniões magnas, garante o cumprimento dos estatutos e zela pela democracia interna.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {assemblyMembers.length > 0 ? assemblyMembers.map(renderMemberCard) : (
                <div className="py-16 text-center bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200">
                  <p className="text-sm font-bold text-zinc-400">Nenhum membro registado na Mesa.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fiscal" className="space-y-8 mt-10">
            <div className="p-8 rounded-[2.5rem] bg-zinc-100 text-zinc-900 space-y-6 shadow-xl shadow-zinc-100 relative overflow-hidden border border-zinc-200">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <CheckCircle2 className="h-32 w-32" />
              </div>
              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Conselho Fiscal</h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.2em]">Fiscalização</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                  Supervisiona a atividade administrativa e financeira, garantindo a transparência e o bem-estar do grupo.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {fiscalMembers.length > 0 ? fiscalMembers.map(renderMemberCard) : (
                <div className="py-16 text-center bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200">
                  <p className="text-sm font-bold text-zinc-400">Nenhum membro registado no Conselho Fiscal.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {user?.role === 'admin' && (
          <div className="pt-6 border-t border-zinc-100">
            <Dialog open={!!selectedSocialBodyMember || socialBodyForm.userId !== ''} onOpenChange={(open) => {
              if (!open) {
                setSelectedSocialBodyMember(null);
                setSocialBodyForm({ userId: '', role: '', position: 'Board' as any, profileLink: '', contactDetails: '', term: '', isCurrent: true, year: new Date().getFullYear() });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-14 rounded-2xl font-bold shadow-xl shadow-zinc-200">
                  <Plus className="h-5 w-5 mr-2" /> Adicionar aos Órgãos Sociais
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                    {selectedSocialBodyMember ? 'Editar Membro' : 'Novo Membro'}
                  </DialogTitle>
                  <DialogDescription className="font-medium">
                    Preenche os dados do membro dos Órgãos Sociais.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-6">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Membro</Label>
                    <Select value={socialBodyForm.userId} onValueChange={(v) => setSocialBodyForm({ ...socialBodyForm, userId: v })}>
                      <SelectTrigger className="h-12 rounded-xl border-zinc-200"><SelectValue placeholder="Selecionar Membro" /></SelectTrigger>
                      <SelectContent>
                        {allMembers.map(m => (
                          <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cargo</Label>
                    <Input className="h-12 rounded-xl border-zinc-200" placeholder="Ex: Presidente" value={socialBodyForm.role} onChange={(e) => setSocialBodyForm({ ...socialBodyForm, role: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Órgão</Label>
                    <Select value={socialBodyForm.position} onValueChange={(v: any) => setSocialBodyForm({ ...socialBodyForm, position: v })}>
                      <SelectTrigger className="h-12 rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Board">Board</SelectItem>
                        <SelectItem value="Mesa da Assembleia Geral">Mesa da Assembleia Geral</SelectItem>
                        <SelectItem value="Conselho Fiscal">Conselho Fiscal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Link de Perfil (Opcional)</Label>
                    <Input className="h-12 rounded-xl border-zinc-200" placeholder="https://..." value={socialBodyForm.profileLink} onChange={(e) => setSocialBodyForm({ ...socialBodyForm, profileLink: e.target.value })} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contactos (Opcional)</Label>
                    <Input className="h-12 rounded-xl border-zinc-200" placeholder="Email ou Telefone" value={socialBodyForm.contactDetails} onChange={(e) => setSocialBodyForm({ ...socialBodyForm, contactDetails: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest shadow-lg shadow-red-100" onClick={() => handleAdminUpdateSocialBody(socialBodyForm)}>
                    {selectedSocialBodyMember ? 'Atualizar' : 'Guardar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    );
  };

  const WellnessForms = () => {
    const isAdmin = user?.role === 'admin' || user?.role === 'management';
    const content = appContent['wellness_forms'] || { 
      title: 'Forms de Bem-Estar', 
      text: 'O Conselho Fiscal é responsável por zelar pelo bem-estar de o LBG. Este formulário serve para recolher feedback, preocupações ou sugestões que ajudem a manter um ambiente saudável e produtivo para todos os membros.\n\n"A tua voz é fundamental para construirmos um BEST melhor e mais unido."',
      link: 'https://docs.google.com/forms/d/e/1FAIpQLSfdSCex-BFz2tK0HWDoLStwRAIX1HniI5fIYH2tD7vQdRZdkA/viewform'
    };
    
    const [isEditing, setIsEditing] = React.useState(false);
    const [editForm, setEditForm] = React.useState({
      title: content.title,
      text: content.text,
      link: content.link
    });

    const handleSave = async () => {
      try {
        await setDoc(doc(db, 'appContent', 'wellness_forms'), editForm, { merge: true });
        setIsEditing(false);
        toast.success('Conteúdo atualizado!');
      } catch (e) {
        toast.error('Erro ao guardar');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-red-900 uppercase tracking-tighter transition-all">{content.title}</h2>
            <p className="text-sm text-zinc-500 font-medium">O bem-estar de o LBG é a nossa prioridade.</p>
          </div>
          {isAdmin && (
            <Button variant="outline" className="rounded-2xl border-zinc-200 font-bold gap-2 shadow-sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancelar' : <><Edit2 className="h-4 w-4" /> Editar Configurações</>}
            </Button>
          )}
        </div>

        <Card className="border-none bg-white shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Heart className="h-10 w-10 fill-current animate-pulse" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-bold text-zinc-900">Conselho Fiscal & Bem-Estar</h3>
                 <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Espaço de Escuta e Melhoria</p>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-6 bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Título da Página</Label>
                  <Input 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className="h-12 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
                <div className="flex justify-between items-center bg-zinc-900 p-2 rounded-t-3xl">
                  <MarkdownToolbar onInsert={(t) => setEditForm({ ...editForm, text: editForm.text + t })} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40 pr-4">Editor de Texto</span>
                </div>
                <Textarea 
                  value={editForm.text} 
                  onChange={e => setEditForm({...editForm, text: e.target.value})}
                  className="min-h-[250px] rounded-b-3xl rounded-t-none border-zinc-200 bg-white resize-none p-6 font-medium text-sm leading-relaxed focus:ring-red-500"
                />
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Link do Formulário</Label>
                  <Input 
                    value={editForm.link} 
                    onChange={e => setEditForm({...editForm, link: e.target.value})}
                    className="h-12 rounded-xl border-zinc-200 bg-white"
                  />
                </div>
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-14 rounded-2xl shadow-xl transition-all active:scale-95" onClick={handleSave}>
                  Guardar Novas Definições
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="prose prose-sm prose-zinc max-w-none bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100">
                  <SafeMarkdown>{content.text}</SafeMarkdown>
                </div>
                <Button 
                  className="w-full bg-zinc-900 hover:bg-red-600 h-16 text-sm font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl transition-all active:scale-[0.98] group flex items-center justify-center border-b-4 border-zinc-700 active:border-b-0"
                  onClick={() => window.open(content.link, '_blank')}
                >
                  <Heart className="mr-3 h-5 w-5 fill-red-600 text-red-600 group-hover:fill-white group-hover:text-white transition-colors" />
                  <span>Abrir Formulários</span>
                  <ExternalLink className="ml-3 h-4 w-4 opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMetas = () => (
    <div className="space-y-8">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-black text-red-900 uppercase tracking-tighter">Metas & Objetivos</h2>
        <p className="text-sm text-zinc-500 font-medium">Os grandes desafios e metas coletivas de o LBG Almada.</p>
      </div>

      <div className="grid gap-6">
        {metas.length > 0 ? metas.map(meta => (
          <Card key={meta.id} className="border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {meta.teamId && (
                      <Badge 
                        onClick={() => {
                          const t = teams.find(team => team.id === meta.teamId);
                          if (t) {
                            setSelectedTeamView(t);
                            setActiveTab('teams');
                          }
                        }}
                        className="bg-red-50 text-red-600 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        {teams.find(t => t.id === meta.teamId)?.name}
                      </Badge>
                    )}
                    {meta.eventId && (
                      <Badge 
                        onClick={() => setSelectedEventDetails(events.find(e => e.id === meta.eventId) || null)}
                        className="bg-zinc-900 text-white border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 cursor-pointer hover:bg-zinc-800 transition-colors"
                      >
                        {events.find(e => e.id === meta.eventId)?.title}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tight text-zinc-900">{meta.title}</CardTitle>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
                  <Target className="h-6 w-6 text-zinc-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                {meta.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Progresso Global</span>
                  <span className="text-sm font-black text-red-600">{meta.progress}%</span>
                </div>
                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 transition-all duration-1000" 
                    style={{ width: `${meta.progress}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Como podes contribuir?</h4>
                </div>
                
                <div className="grid gap-3">
                  {tasks.filter(t => t.metaId === meta.id).length > 0 ? (
                    tasks.filter(t => t.metaId === meta.id).map(task => (
                      <div 
                        key={task.id} 
                        className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsViewingTask(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-zinc-800 group-hover:text-red-600 transition-colors">{task.title}</p>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-[8px] font-black uppercase text-zinc-400 border-zinc-200">
                                {task.assignedMemberIds.length} Atribuídos
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 text-center">
                      <p className="text-xs font-bold text-zinc-400 uppercase">Sem tarefas abertas para esta meta</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-zinc-100">
                {meta.deadline && (
                  <div className="text-right">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Deadline</p>
                    <p className="text-xs font-bold text-red-600">{meta.deadline}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-20 text-center bg-white rounded-[3rem] shadow-xl shadow-red-50 border-2 border-dashed border-red-100">
            <Target className="h-12 w-12 text-red-100 mx-auto mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest">Ainda sem metas definidas.</p>
          </div>
        )}
      </div>

      {/* Hall of Fame removed as requested */}
    </div>
  );

  const renderBoard = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Painel Board</h2>
        <p className="text-sm text-zinc-500">Gere a estrutura e membros do BEST.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-red-50 text-red-600 relative">
                  <ShieldCheck className="h-6 w-6" />
                  {allMembers.filter(m => m.status === 'pending').length > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {allMembers.filter(m => m.status === 'pending').length}
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold">Aprovações</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Aprovações de Membros</DialogTitle>
              <DialogDescription className="font-medium">Aceita ou rejeita novos pedidos de adesão ao Hub.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-6">
              {allMembers.filter(m => m.status === 'pending').length > 0 ? (
                allMembers.filter(m => m.status === 'pending').map(pendingUser => (
                  <div key={pendingUser.uid} className="p-4 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={pendingUser.photoURL} />
                        <AvatarFallback>{pendingUser.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-zinc-900 truncate">{pendingUser.displayName}</p>
                        <p className="text-[10px] font-medium text-zinc-400 truncate">{pendingUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                        onClick={() => {
                          requestConfirmation(
                            'Aprovar Membro',
                            `Tens a certeza que queres aprovar ${pendingUser.displayName}?`,
                            () => {
                              updateDoc(doc(db, 'users', pendingUser.uid), { status: 'active' });
                              toast.success(`${pendingUser.displayName} aprovado!`);
                            },
                            'Aprovar',
                            'Cancelar',
                            false
                          );
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                        onClick={() => {
                          requestConfirmation(
                            'Rejeitar Pedido',
                            `Tens a certeza que queres rejeitar o pedido de ${pendingUser.displayName}?`,
                            () => {
                              updateDoc(doc(db, 'users', pendingUser.uid), { status: 'rejected' });
                              toast.error(`${pendingUser.displayName} rejeitado.`);
                            },
                            'Rejeitar',
                            'Cancelar'
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-zinc-200" />
                  </div>
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Sem pedidos pendentes</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <Dialog>
            <DialogTrigger asChild>
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-200">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold whitespace-nowrap">Membros</span>
              </CardContent>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gestão de Membros</DialogTitle>
                <DialogDescription className="font-medium text-xs">Clica no estatuto para ver a atividade recente.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <div className="grid gap-3">
                  {allMembers.sort((a, b) => a.displayName.localeCompare(b.displayName)).map(m => (
                    <div key={m.uid} className="p-4 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white">
                          <AvatarImage src={m.photoURL} />
                          <AvatarFallback>{m.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-zinc-900 truncate">{m.displayName}</p>
                          <p className="text-[10px] font-medium text-zinc-400 truncate uppercase tracking-widest">{m.membership} • {m.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "rounded-xl font-black text-[9px] uppercase tracking-widest px-3",
                            m.status === 'active' ? "bg-green-100 text-green-700" :
                            m.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}
                          onClick={() => setViewingMemberActivity(m)}
                        >
                          {m.status}
                        </Button>
                        <Select 
                          value={m.role} 
                          onValueChange={(newRole: any) => updateDoc(doc(db, 'users', m.uid), { role: newRole })}
                        >
                          <SelectTrigger className="h-8 w-24 text-[9px] font-bold rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Membro</SelectItem>
                            <SelectItem value="management">Management</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-zinc-900 text-white">
                  <Target className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Metas</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gestão de Metas</DialogTitle>
              <DialogDescription className="font-medium">Define os grandes objetivos coletivos.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Título da Meta</Label>
                  <Input 
                    placeholder="Ex: Refatoração do Hub" 
                    value={metaForm.title} 
                    onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })} 
                    className="rounded-xl border-zinc-200 h-11"
                  />
                </div>
                <div className="space-y-2 col-span-1 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Descrição</Label>
                  <div className="flex justify-between items-center bg-zinc-900 p-2 rounded-t-xl mb-0">
                    <MarkdownToolbar onInsert={(t) => setMetaForm({ ...metaForm, description: metaForm.description + t })} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 pr-4">Editor</span>
                  </div>
                  <Textarea 
                    placeholder="O que pretendemos alcançar..." 
                    value={metaForm.description} 
                    onChange={(e) => setMetaForm({ ...metaForm, description: e.target.value })} 
                    className="rounded-t-none rounded-b-xl border-zinc-200 min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Equipa Associada (Opcional)</Label>
                  <Select 
                    value={metaForm.teamId || 'none'} 
                    onValueChange={(v) => {
                      setMetaForm({ ...metaForm, teamId: v === 'none' ? '' : v });
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-zinc-200 h-11"><SelectValue placeholder="Escolher equipa" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Evento Associado (Opcional)</Label>
                  <Select 
                    value={metaForm.eventId || 'none'} 
                    onValueChange={(v) => {
                      setMetaForm({ ...metaForm, eventId: v === 'none' ? '' : v });
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-zinc-200 h-11"><SelectValue placeholder="Escolher evento" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">Nenhum</SelectItem>
                      {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Progresso (%)</Label>
                  <Input 
                    type="number" 
                    value={metaForm.progress} 
                    onChange={(e) => setMetaForm({ ...metaForm, progress: parseInt(e.target.value) || 0 })} 
                    className="rounded-xl border-zinc-200 h-11"
                  />
                </div>
                <div className="flex gap-2 col-span-2">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 h-12 rounded-xl font-bold uppercase tracking-widest text-xs" onClick={handleAdminUpdateMeta}>
                    {selectedMeta ? 'Atualizar Meta' : 'Criar Meta'}
                  </Button>
                  {selectedMeta && (
                    <Button variant="outline" className="h-12 rounded-xl" onClick={() => {
                      setSelectedMeta(null);
                      setMetaForm({
                        title: '',
                        description: '',
                        progress: 0,
                        status: 'Active',
                        creatorId: user.uid,
                        creatorRole: user.role,
                        teamId: '',
                        eventId: '',
                        deadline: ''
                      });
                    }}>Novo</Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Metas Ativas</h4>
                <div className="grid gap-3">
                  {metas.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 rounded-3xl bg-white border border-zinc-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                          <Target className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900">{m.title}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{m.progress}% Concluído</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50" onClick={() => {
                          setSelectedMeta(m);
                          setMetaForm({
                            title: m.title,
                            description: m.description,
                            teamId: m.teamId || '',
                            eventId: m.eventId || '',
                            creatorId: m.creatorId,
                            creatorRole: m.creatorRole,
                            progress: m.progress,
                            deadline: m.deadline || '',
                            status: m.status
                          });
                        }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteDoc(doc(db, 'metas', m.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                  <Gift className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Gadgets</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Gestão de Gadgets</DialogTitle>
              <DialogDescription>Cria e gere os gadgets disponíveis no LBG.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input placeholder="Ex: Hoodie BEST" id="gadget-name" />
                </div>
                <div className="space-y-2">
                  <Label>Ícone (Emoji)</Label>
                  <Input placeholder="Ex: 🧥" id="gadget-icon" />
                </div>
                <div className="space-y-2">
                  <Label>Raridade</Label>
                  <Select onValueChange={(v) => (window as any)._newGadgetRarity = v} defaultValue="Common">
                    <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Common">Common</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                      <SelectItem value="Legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="col-span-2 bg-red-600 hover:bg-red-700 h-10 rounded-xl" onClick={() => {
                  const name = (document.getElementById('gadget-name') as HTMLInputElement).value;
                  const icon = (document.getElementById('gadget-icon') as HTMLInputElement).value;
                  const rarity = (window as any)._newGadgetRarity || 'Common';
                  if (name) handleAdminUpdateGadget({ name, icon, rarity, cost: 0, description: '' });
                }}>Criar Gadget</Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Gadgets Atuais</h4>
                <div className="grid gap-2">
                  {gadgets.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{g.icon}</span>
                        <div>
                          <p className="text-sm font-bold">{g.name}</p>
                          <p className="text-[10px] text-zinc-400">{g.rarity} • {g.cost} XP</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => deleteDoc(doc(db, 'gadgets', g.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-yellow-50 text-yellow-600">
                  <Trophy className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Conquistas</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Gestão de Conquistas</DialogTitle>
              <DialogDescription>Cria e gere as conquistas para os membros.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="space-y-2 col-span-2">
                  <Label>Título</Label>
                  <Input placeholder="Ex: Primeiro Evento" id="ach-title" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Descrição</Label>
                  <Input placeholder="Ex: Participou no seu primeiro evento do LBG" id="ach-desc" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Ícone (Emoji)</Label>
                  <Input placeholder="Ex: 🌟" id="ach-icon" />
                </div>
                <Button className="col-span-2 bg-red-600 hover:bg-red-700 h-10 rounded-xl" onClick={() => {
                  const title = (document.getElementById('ach-title') as HTMLInputElement).value;
                  const description = (document.getElementById('ach-desc') as HTMLInputElement).value;
                  const icon = (document.getElementById('ach-icon') as HTMLInputElement).value;
                  if (title) handleAdminUpdateAchievement({ title, description, icon });
                }}>Criar Conquista</Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Conquistas Atuais</h4>
                <div className="grid gap-2">
                  {achievements.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{a.icon}</span>
                        <div>
                          <p className="text-sm font-bold">{a.title}</p>
                          <p className="text-xs font-medium">Reconhecimento Lifetime</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => deleteDoc(doc(db, 'achievements', a.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Famílias</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Gestão de Famílias</DialogTitle>
              <DialogDescription>Gere o programa de mentoring, objetivos e conquistas das famílias.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="space-y-2 col-span-2">
                  <Label>Nome da Família</Label>
                  <Input placeholder="Ex: Família Real" value={familyForm.name} onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cor (Hex)</Label>
                  <Input type="color" value={familyForm.color} onChange={(e) => setFamilyForm({ ...familyForm, color: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Ranking Inicial</Label>
                  <Input type="number" value={familyForm.ranking} onChange={(e) => setFamilyForm({ ...familyForm, ranking: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Mentores</Label>
                  <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-zinc-200 min-h-[40px]">
                    {familyForm.mentors.map(uid => (
                      <Badge key={uid} variant="secondary" className="gap-1">
                        {allMembers.find(m => m.uid === uid)?.displayName}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFamilyForm({ ...familyForm, mentors: familyForm.mentors.filter(id => id !== uid) })} />
                      </Badge>
                    ))}
                    <Select onValueChange={(v: string) => !familyForm.mentors.includes(v) && setFamilyForm({ ...familyForm, mentors: [...familyForm.mentors, v] })}>
                      <SelectTrigger className="h-6 w-24 text-[10px]"><SelectValue placeholder="Add" /></SelectTrigger>
                      <SelectContent>
                        {allMembers.map(m => (
                          <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Mentees</Label>
                  <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-zinc-200 min-h-[40px]">
                    {familyForm.mentees.map(uid => (
                      <Badge key={uid} variant="outline" className="gap-1">
                        {allMembers.find(m => m.uid === uid)?.displayName}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFamilyForm({ ...familyForm, mentees: familyForm.mentees.filter(id => id !== uid) })} />
                      </Badge>
                    ))}
                    <Select onValueChange={(v: string) => !familyForm.mentees.includes(v) && setFamilyForm({ ...familyForm, mentees: [...familyForm.mentees, v] })}>
                      <SelectTrigger className="h-6 w-24 text-[10px]"><SelectValue placeholder="Add" /></SelectTrigger>
                      <SelectContent>
                        {allMembers.map(m => (
                          <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="col-span-2 bg-red-600 hover:bg-red-700" onClick={() => handleAdminUpdateFamily(familyForm)}>
                  {familyForm.id ? 'Atualizar Família' : 'Criar Família'}
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Famílias Atuais</h4>
                <div className="grid gap-2">
                  {families.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: f.color }} />
                        <div>
                          <p className="text-sm font-bold">{f.name}</p>
                          <p className="text-[10px] text-zinc-400">{f.mentors.length} Mentores • {f.mentees.length} Mentees</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => setFamilyForm(f)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => deleteDoc(doc(db, 'families', f.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isManagingSocialBodies} onOpenChange={setIsManagingSocialBodies}>
          <DialogTrigger asChild>
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Órgãos Sociais</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Gestão de Órgãos Sociais</DialogTitle>
              <DialogDescription>Gere os membros da Direção, Mesa da Assembleia Geral e Conselho Fiscal.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="space-y-2 col-span-2">
                  <Label>Membro</Label>
                  <Select value={socialBodyForm.userId} onValueChange={(v) => setSocialBodyForm({ ...socialBodyForm, userId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Membro" /></SelectTrigger>
                    <SelectContent>
                      {allMembers.map(m => (
                        <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input placeholder="Ex: Presidente" value={socialBodyForm.role} onChange={(e) => setSocialBodyForm({ ...socialBodyForm, role: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Posição</Label>
                  <Select value={socialBodyForm.position} onValueChange={(v: any) => setSocialBodyForm({ ...socialBodyForm, position: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Board">Board</SelectItem>
                      <SelectItem value="Mesa da Assembleia Geral">Mesa da Assembleia Geral</SelectItem>
                      <SelectItem value="Conselho Fiscal">Conselho Fiscal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Link do Perfil (LinkedIn/Outro)</Label>
                  <Input placeholder="https://..." value={socialBodyForm.profileLink} onChange={(e) => setSocialBodyForm({ ...socialBodyForm, profileLink: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mandato / Época</Label>
                  <Input placeholder="Ex: 2024/2025" value={socialBodyForm.term} onChange={(e) => setSocialBodyForm({ ...socialBodyForm, term: e.target.value })} />
                </div>
                <div className="space-y-2 flex items-end">
                   <Button 
                     variant={socialBodyForm.isCurrent ? "default" : "outline"}
                     className={cn("w-full h-10 rounded-xl font-bold uppercase text-[10px]", socialBodyForm.isCurrent && "bg-green-600 hover:bg-green-700")}
                     onClick={() => setSocialBodyForm({...socialBodyForm, isCurrent: !socialBodyForm.isCurrent})}
                   >
                     {socialBodyForm.isCurrent ? "Mandato Atual" : "Arquivo Histórico"}
                   </Button>
                </div>
                <Button className="col-span-2 bg-red-600 hover:bg-red-700 h-12 rounded-xl" onClick={() => handleAdminUpdateSocialBody(socialBodyForm)}>
                  {selectedSocialBodyMember ? 'Guardar' : 'Adicionar'}
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Membros Atuais</h4>
                <div className="grid gap-2">
                  {socialBodies.map(m => {
                    const userProfile = allMembers.find(u => u.uid === m.userId);
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={userProfile?.photoURL} />
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold">{userProfile?.displayName}</p>
                            <p className="text-[10px] text-zinc-400">{m.position} • {m.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => {
                            setSocialBodyForm({ ...m } as any);
                          }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => deleteDoc(doc(db, 'socialBodies', m.id))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isManagingMeetings} onOpenChange={setIsManagingMeetings}>
          <DialogTrigger asChild>
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Reuniões</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Gestão de Reuniões</DialogTitle>
              <DialogDescription>Agenda reuniões e calls para as equipas.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="space-y-2 col-span-2">
                  <Label>Equipa</Label>
                  <Select value={meetingForm.teamId} onValueChange={(v) => setMeetingForm({ ...meetingForm, teamId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Equipa" /></SelectTrigger>
                    <SelectContent>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Título da Reunião</Label>
                  <Input placeholder="Ex: Reunião Semanal" value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={meetingForm.date} onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input type="time" value={meetingForm.time} onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Host (Responsável)</Label>
                  <Select value={meetingForm.hostId} onValueChange={(v) => setMeetingForm({ ...meetingForm, hostId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar Host" /></SelectTrigger>
                    <SelectContent>
                      {allMembers.map(m => (
                        <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Checkbox id="is-open-call" checked={meetingForm.isOpenCall} onCheckedChange={(v) => setMeetingForm({ ...meetingForm, isOpenCall: !!v })} />
                  <Label htmlFor="is-open-call">Esta é uma Open Call (Aberta a todos)</Label>
                </div>
                <Button className="col-span-2 bg-red-600 hover:bg-red-700" onClick={() => handleAdminUpdateMeeting(meetingForm)}>
                  Agendar Reunião
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Próximas Reuniões</h4>
                <div className="grid gap-2">
                  {meetings.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100">
                      <div>
                        <p className="text-sm font-bold">{m.title}</p>
                        <p className="text-[10px] text-zinc-400">{m.date} às {m.time} • {teams.find(t => t.id === m.teamId)?.name}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => deleteDoc(doc(db, 'meetings', m.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isManagingMembers} onOpenChange={setIsManagingMembers}>
          <DialogTrigger asChild>
            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer relative">
              {allMembers.some(m => m.status === 'pending') && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-600 p-1 animate-pulse z-20 shadow-lg" />
              )}
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                  <UserCog className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Membros</span>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gestão da Comunidade</DialogTitle>
              <DialogDescription className="font-medium text-zinc-500">Gere as permissões, membros e aprova novos registos.</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-2xl h-12">
                <TabsTrigger value="all" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600">Todos os Membros</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-red-600 relative">
                  Novos Membros (Candidaturas)
                  {allMembers.filter(m => m.status === 'pending').length > 0 && (
                    <Badge className="ml-2 bg-red-600 text-white border-none h-4 w-4 flex items-center justify-center p-0 text-[8px] rounded-full">
                      {allMembers.filter(m => m.status === 'pending').length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Equipa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allMembers.filter(m => m.status !== 'pending').map((m) => (
                      <TableRow key={m.uid}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors text-xs" onClick={() => setViewingProfile(m)}>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={m.photoURL} />
                              <AvatarFallback>{(m.displayName || '?').charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[80px]">{m.displayName || 'Sem Nome'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] font-bold text-zinc-500 uppercase">{m.position || 'Membro'}</TableCell>
                        <TableCell className="text-[10px] text-zinc-400 font-medium uppercase truncate max-w-[80px]">{teams.find(t => t.id === m.teamId)?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-1.5 py-0",
                            m.status === 'active' ? "text-green-600 border-green-200 bg-green-50" : "text-red-400 border-red-100 bg-red-50"
                          )}>
                            {m.status || 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ações</DropdownMenuLabel>
                              <DropdownMenuItem className="text-xs font-bold" onClick={() => {
                                setSelectedMember(m);
                                setEditForm({
                                  displayName: m.displayName || '',
                                  position: m.position || '',
                                  bio: m.bio || '',
                                  membership: m.membership || 'Observer',
                                  role: m.role,
                                  teamId: m.teamId || '',
                                  photoURL: m.photoURL || '',
                                  email: m.email || '',
                                  phoneNumber: m.phoneNumber || '',
                                  privateAreaLink: m.privateAreaLink || '',
                                  course: m.course || '',
                                  interests: m.interests || [],
                                  skills: m.skills || [],
                                  previousRoles: m.previousRoles || []
                                } as any);
                              }}>
                                Editar Perfil
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs font-bold text-red-600" onClick={() => {
                                requestConfirmation(
                                  m.status === 'active' ? 'Suspender Acesso' : 'Ativar Acesso',
                                  `Tens a certeza que queres ${m.status === 'active' ? 'desativar' : 'ativar'} o acesso de ${m.displayName}?`,
                                  async () => {
                                    await updateDoc(doc(db, 'users', m.uid), { status: m.status === 'active' ? 'rejected' : 'active' });
                                    toast.success('Estado atualizado com sucesso');
                                  },
                                  m.status === 'active' ? 'Suspender' : 'Ativar',
                                  'Cancelar',
                                  m.status === 'active'
                                );
                              }}>
                                {m.status === 'active' ? 'Suspender Acesso' : 'Ativar Acesso'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100" onClick={() => {
                                requestConfirmation(
                                  'EXPULSAR Membro',
                                  `AVISO CRÍTICO: Tens a certeza que queres EXPULSAR permanentemente ${m.displayName}? Esta ação não pode ser desfeita.`,
                                  async () => {
                                    await deleteDoc(doc(db, 'users', m.uid));
                                    toast.success('Membro expulso da comunidade.');
                                  }
                                );
                              }}>
                                <Trash2 className="h-3 w-3 mr-2" /> Expulsar Membro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <div className="space-y-4">
                  {allMembers.filter(m => m.status === 'pending').length > 0 ? (
                    allMembers.filter(m => m.status === 'pending').map(pendingUser => (
                      <Card key={pendingUser.uid} className="border-none bg-zinc-50 shadow-sm overflow-hidden group">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                              <AvatarImage src={pendingUser.photoURL} />
                              <AvatarFallback>{pendingUser.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-zinc-900">{pendingUser.displayName}</h4>
                              <p className="text-[10px] text-zinc-500 font-medium">{pendingUser.email}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Registado a: {new Date(pendingUser.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className="h-9 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-green-100"
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'users', pendingUser.uid), { status: 'active' });
                                  toast.success('Utilizador aprovado com sucesso!');
                                } catch (e) {
                                  toast.error("Erro ao aprovar utilizador");
                                }
                              }}
                            >
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-9 px-4 rounded-xl text-red-600 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest"
                              onClick={() => {
                                requestConfirmation(
                                  'Recusar Acesso',
                                  `Tens a certeza que queres recusar o acesso de ${pendingUser.displayName}?`,
                                  async () => {
                                      try {
                                        await updateDoc(doc(db, 'users', pendingUser.uid), { status: 'rejected' });
                                        toast.success('Utilizador recusado');
                                      } catch (e) {
                                        toast.error("Erro ao recusar");
                                      }
                                  },
                                  'Recusar',
                                  'Cancelar'
                                );
                              }}
                            >
                              Recusar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-zinc-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-10 w-10 text-zinc-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">Tudo em dia!</p>
                        <p className="text-xs text-zinc-400 font-medium">Não há pedidos de aprovação pendentes.</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Gerir Membro: {selectedMember?.displayName}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1 rounded-2xl h-11">
                <TabsTrigger value="info" className="rounded-xl font-bold text-[10px] uppercase tracking-widest">Informação</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl font-bold text-[10px] uppercase tracking-widest">Atividade</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nome</Label>
              <Input className="rounded-xl border-zinc-200" value={editForm.displayName} onChange={(e) => setEditForm({...editForm, displayName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Visível</Label>
                <Input className="rounded-xl border-zinc-200" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Telefone Visível</Label>
                <Input className="rounded-xl border-zinc-200" value={editForm.phoneNumber} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cargo</Label>
                <Input className="rounded-xl border-zinc-200" value={editForm.position} onChange={(e) => setEditForm({...editForm, position: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Membership</Label>
                <Select value={editForm.membership} onValueChange={(v) => setEditForm({...editForm, membership: v})}>
                  <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Baby Member">Baby Member</SelectItem>
                    <SelectItem value="Full Member">Full Member</SelectItem>
                    <SelectItem value="Observer">Observer</SelectItem>
                    <SelectItem value="Alumnus Member">Alumnus Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Curso</Label>
                <Input className="rounded-xl border-zinc-200" value={editForm.course} onChange={(e) => setEditForm({...editForm, course: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Link Private Area</Label>
                <Input className="rounded-xl border-zinc-200" value={editForm.privateAreaLink} onChange={(e) => setEditForm({...editForm, privateAreaLink: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL Foto de Perfil</Label>
                <Input className="rounded-xl border-zinc-200" value={editForm.photoURL} onChange={(e) => setEditForm({...editForm, photoURL: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Equipa</Label>
              <Select value={(editForm as any).teamId || 'none'} onValueChange={(v) => setEditForm({...editForm, teamId: v} as any)}>
                <SelectTrigger className="rounded-xl border-zinc-200">
                  <SelectValue placeholder="Seleciona uma equipa" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">Sem Equipa</SelectItem>
                  {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Bio / Perfil</Label>
              <Textarea className="rounded-xl border-zinc-200 min-h-[100px]" value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Skills / Competências</Label>
                  {(user?.role === 'admin' || user?.role === 'management') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[8px] font-black uppercase text-red-600 hover:bg-red-50 rounded-lg px-2"
                      onClick={() => {
                        const s = prompt('Adicionar Skill ao Sistema:');
                        if (s) toast.success(`Skill "${s}" registada no sistema. ✨`);
                      }}
                    >
                      + Novo
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 p-4 border-2 border-zinc-100 rounded-[1.5rem] bg-zinc-50/50 min-h-[100px]">
                  {PREDEFINED_SKILLS.map(skill => (
                    <Badge 
                      key={skill} 
                      variant={editForm.skills.includes(skill) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer rounded-xl text-[10px] font-bold py-1.5 px-3 transition-all border-2",
                        editForm.skills.includes(skill) ? "bg-red-600 hover:bg-red-700 border-red-600" : "bg-white border-zinc-200 text-zinc-500 hover:border-red-200"
                      )}
                      onClick={() => {
                        const skills = editForm.skills.includes(skill)
                          ? editForm.skills.filter((s: string) => s !== skill)
                          : [...editForm.skills, skill];
                        setEditForm({ ...editForm, skills });
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Cargos Anteriores (separados por vírgula)</Label>
                <Input className="h-14 rounded-2xl border-2 border-zinc-100 px-6 focus:border-red-200 transition-all font-medium" value={editForm.previousRoles?.join(', ')} onChange={(e) => setEditForm({...editForm, previousRoles: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Interesses (separados por vírgula)</Label>
              <Input className="rounded-xl border-zinc-200" value={editForm.interests?.join(', ')} onChange={(e) => setEditForm({...editForm, interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} />
            </div>
            {user?.role === 'admin' && (
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Permissões de Sistema</Label>
                <Select value={(editForm as any).role} onValueChange={(v) => setEditForm({...editForm, role: v} as any)}>
                  <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="admin">Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 py-4">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Novo Registo de Atividade</Label>
                      <div className="flex gap-2">
                        <Input 
                          className="rounded-xl border-zinc-200" 
                          placeholder="Ex: Apoiou na logística do Evento X" 
                          value={newActivityContent} 
                          onChange={(e) => setNewActivityContent(e.target.value)} 
                        />
                        <Button className="bg-zinc-900 rounded-xl" onClick={async () => {
                          if (!selectedMember || !newActivityContent.trim()) return;
                          const newAct = {
                            id: Math.random().toString(36).substr(2, 9),
                            content: newActivityContent.trim(),
                            date: new Date().toISOString()
                          };
                          const currentAct = selectedMember.recentActivity || [];
                          await updateDoc(doc(db, 'users', selectedMember.uid), {
                            recentActivity: [...currentAct, newAct]
                          });
                          setNewActivityContent('');
                          toast.success('Atividade registada!');
                        }}>
                          Adicionar
                        </Button>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Histórico Manual</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {selectedMember?.recentActivity?.slice().reverse().map((act) => (
                          <div key={act.id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl flex justify-between items-start group">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-zinc-700 leading-snug">{act.content}</p>
                              <p className="text-[9px] text-zinc-400 font-bold">{new Date(act.date).toLocaleDateString()}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                              onClick={async () => {
                                const nextAct = selectedMember.recentActivity?.filter(a => a.id !== act.id);
                                await updateDoc(doc(db, 'users', selectedMember.uid), { recentActivity: nextAct });
                                toast.success('Registo removido');
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {(!selectedMember?.recentActivity || selectedMember.recentActivity.length === 0) && (
                          <p className="text-[10px] text-zinc-400 italic text-center py-8">Nenhum registo manual.</p>
                        )}
                      </div>
                   </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
              {selectedMember && (
                <Button 
                  variant="ghost" 
                  className="w-full text-red-600 font-bold text-[10px] uppercase tracking-widest p-0 h-auto hover:bg-transparent hover:underline"
                  onClick={() => {
                    requestConfirmation(
                      'Expulsar Membro',
                      `Tens a certeza que queres expulsar permanentemente ${selectedMember.displayName} de o LBG? Esta ação é irreversível.`,
                      async () => {
                        await updateDoc(doc(db, 'users', selectedMember.uid), { status: 'rejected', role: 'member' });
                        toast.success('Membro expulso');
                        setSelectedMember(null);
                      }
                    );
                  }}
                >
                  Expulsar do LBG
                </Button>
              )}
              <Button onClick={handleAdminUpdateMember} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 font-bold h-12 rounded-2xl shadow-lg shadow-red-100">
                {loading ? 'A guardar...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {user?.role === 'admin' && (
          <>
            <Dialog open={isManagingTeams} onOpenChange={setIsManagingTeams}>
              <DialogTrigger asChild>
                <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                      <Users className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold">Equipas</span>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle>Gestão de Equipas</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">Equipas Ativas</h4>
                      <p className="text-[10px] text-zinc-500 font-medium">Gere os departamentos e grupos do LBG.</p>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold" onClick={() => {
                      setSelectedTeam(null);
                      setIsCreatingTeam(true);
                      setTeamForm({ name: '', mission: '', contactEmail: '', category: 'Annual', coordinatorId: '', eventId: '', imageUrl: '' });
                    }}>
                      <Plus className="h-4 w-4 mr-1" /> Nova Equipa
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {teams.map(t => (
                      <div key={t.id} className={cn(
                        "flex items-center justify-between p-4 border rounded-2xl transition-all hover:shadow-md",
                        selectedTeam?.id === t.id ? "border-red-200 bg-red-50/30" : "bg-white border-zinc-100"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold block">{t.name}</span>
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{t.category || 'Annual'}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="rounded-xl hover:bg-white" onClick={() => {
                          setSelectedTeam(t);
                          setIsCreatingTeam(false);
                          setTeamForm({ 
                            name: t.name, 
                            mission: t.mission, 
                            contactEmail: t.contactEmail, 
                            category: t.category || 'Annual', 
                            coordinatorId: t.coordinatorId || '',
                            eventId: (t as any).eventId || '',
                            imageUrl: t.imageUrl || ''
                          });
                        }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {(selectedTeam || isCreatingTeam) && (
                    <div className="space-y-4 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400">{selectedTeam ? 'Editar Equipa' : 'Nova Equipa'}</h5>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold" onClick={() => {
                          setSelectedTeam(null);
                          setIsCreatingTeam(false);
                          setTeamForm({ name: '', mission: '', contactEmail: '', category: 'Annual', coordinatorId: '', eventId: '', imageUrl: '' });
                        }}>Cancelar</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nome da Equipa</Label>
                          <Input className="rounded-xl border-zinc-200 focus:ring-red-500" placeholder="Ex: Marketing" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email de Contacto</Label>
                          <Input className="rounded-xl border-zinc-200 focus:ring-red-500" placeholder="equipa@best-porto.org" value={teamForm.contactEmail} onChange={e => setTeamForm({...teamForm, contactEmail: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Categoria</Label>
                          <Select value={teamForm.category} onValueChange={(v: any) => setTeamForm({...teamForm, category: v, eventId: v === 'Annual' ? '' : teamForm.eventId})}>
                            <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue placeholder="Categoria" /></SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="Annual">Annual</SelectItem>
                              <SelectItem value="Events">Events</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {teamForm.category === 'Events' && (
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Evento Associado</Label>
                            <Select value={(teamForm as any).eventId || ''} onValueChange={(v: any) => setTeamForm({...teamForm, eventId: v} as any)}>
                              <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue placeholder="Selecionar Evento" /></SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                {events.map(e => (
                                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Coordenador</Label>
                          <Select value={teamForm.coordinatorId} onValueChange={(v: any) => setTeamForm({...teamForm, coordinatorId: v})}>
                            <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue placeholder="Selecionar Coordenador" /></SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="none">Nenhum</SelectItem>
                              {allMembers.filter(m => m.teamId === selectedTeam?.id).map(m => (
                                <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Missão</Label>
                          <Textarea className="rounded-xl border-zinc-200 focus:ring-red-500 min-h-[80px]" placeholder="Qual o objetivo desta equipa?" value={teamForm.mission} onChange={e => setTeamForm({...teamForm, mission: e.target.value})} />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Imagem da Equipa (URL ou Upload)</Label>
                          <div className="flex gap-2">
                             <Input 
                               className="h-10 rounded-xl border-zinc-200 text-xs flex-1" 
                               placeholder="URL da imagem..." 
                               value={teamForm.imageUrl} 
                               onChange={(e) => setTeamForm({ ...teamForm, imageUrl: e.target.value })} 
                             />
                             <div className="relative">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10" 
                                  onChange={handleTeamImageUpload}
                                />
                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-zinc-50">
                                  <Camera className="h-4 w-4 text-zinc-500" />
                                </Button>
                             </div>
                          </div>
                          {teamForm.imageUrl && (
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-100 mt-2">
                              <img src={teamForm.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button 
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                                onClick={() => setTeamForm({...teamForm, imageUrl: ''})}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Button className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-100" onClick={handleAdminUpdateTeam} disabled={loading}>
                          {selectedTeam ? 'Atualizar Equipa' : 'Criar Equipa'}
                        </Button>
                        {selectedTeam && (
                          <Button 
                            variant="ghost" 
                            className="w-full text-red-600 font-bold text-[10px] uppercase tracking-widest p-0 h-auto hover:bg-transparent hover:underline"
                            onClick={() => {
                              requestConfirmation(
                                'Eliminar Equipa',
                                `Tens a certeza que queres eliminar permanentemente a equipa "${selectedTeam.name}"?`,
                                async () => {
                                  await deleteDoc(doc(db, 'teams', selectedTeam.id));
                                  toast.success('Equipa eliminada');
                                  setIsManagingTeams(false);
                                  setSelectedTeam(null);
                                }
                              );
                            }}
                          >
                            Eliminar Equipa
                          </Button>
                        )}
                      </div>
                      
                      {selectedTeam && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Membros da Equipa</Label>
                              <div className="space-y-2 w-full">
                                {allMembers.filter(m => m.teamId === selectedTeam.id).map(m => (
                                  <div key={m.uid} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-zinc-100">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={m.photoURL} />
                                      <AvatarFallback>{m.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-bold truncate">{m.displayName}</p>
                                      <Input 
                                        className="h-6 text-[9px] px-2 rounded-lg border-zinc-100 bg-zinc-50 focus:bg-white transition-colors"
                                        placeholder="Cargo na equipa"
                                        defaultValue={m.position}
                                        onBlur={async (e) => {
                                          if (e.target.value !== m.position) {
                                            await updateDoc(doc(db, 'users', m.uid), { position: e.target.value });
                                            toast.success(`Cargo de ${m.displayName} atualizado`);
                                          }
                                        }}
                                      />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-600" onClick={() => {
                                      requestConfirmation(
                                        'Remover da Equipa',
                                        `Tens a certeza que queres remover ${m.displayName} desta equipa?`,
                                        async () => {
                                          await updateDoc(doc(db, 'users', m.uid), { teamId: null });
                                          toast.success(`${m.displayName} removido da equipa`);
                                        }
                                      );
                                    }}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Select onValueChange={async (v: string) => {
                                  await updateDoc(doc(db, 'users', v), { teamId: selectedTeam.id });
                                  toast.success("Membro adicionado à equipa");
                                }}>
                                  <SelectTrigger className="h-8 w-full text-[10px] rounded-xl border-dashed"><SelectValue placeholder="+ Adicionar Membro" /></SelectTrigger>
                                  <SelectContent className="rounded-2xl">
                                    {allMembers.filter(m => m.teamId !== selectedTeam.id).map(m => (
                                      <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Roles / Calls da Equipa</Label>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => {
                                  setMeetingForm({ 
                                    teamId: selectedTeam.id, 
                                    eventId: '',
                                    title: '', 
                                    description: '', 
                                    date: '', 
                                    time: '', 
                                    hostId: user?.uid || '', 
                                    responsibleIds: [] as string[], 
                                    isOpenCall: false 
                                  });
                                  setIsManagingMeetings(true);
                                }}>Nova Reunião</Button>
                                <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => {
                                  setCallForm({ 
                                    title: '', 
                                    description: '', 
                                    difficulty: 'Medium', 
                                    category: 'Local', 
                                    associationType: 'team',
                                    teamId: selectedTeam.id,
                                    eventId: '',
                                    skillsRequired: [],
                                    developedSkills: [],
                                    qualityLevel: 1,
                                    assignedMemberIds: [],
                                    deadline: '',
                                    applicationLink: ''
                                  });
                                  setSelectedCall(null);
                                  setIsCreatingCall(true);
                                  setIsManagingCalls(true);
                                }}>Nova Call</Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {opportunities.filter(o => o.teamId === selectedTeam.id || (selectedTeam.eventId && o.eventId === selectedTeam.eventId)).map(opp => (
                                <div key={opp.id} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold">{opp.title}</span>
                                  </div>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                                    setSelectedCall(opp);
                                    setCallForm({ 
                                      ...opp, 
                                      skillsRequired: opp.skillsRequired || [],
                                      developedSkills: opp.developedSkills || [],
                                      teamId: opp.teamId || '',
                                      eventId: opp.eventId || '',
                                      assignedMemberIds: opp.assignedMemberIds || [],
                                      deadline: opp.deadline || ''
                                    } as any);
                                    setIsManagingCalls(true);
                                  }}>
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button className="w-full" onClick={handleAdminUpdateTeam}>{selectedTeam ? 'Atualizar' : 'Criar'}</Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isManagingCalls} onOpenChange={setIsManagingCalls}>
              <DialogTrigger asChild>
                <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold">Calls</span>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2rem] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gestão de Calls</DialogTitle>
                  <DialogDescription className="font-medium">Cria oportunidades para membros se juntarem a equipas ou eventos.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">Oportunidades Ativas</h4>
                      <p className="text-[10px] text-zinc-500 font-medium">Cria calls para equipas ou eventos.</p>
                    </div>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold" onClick={() => {
                      setSelectedCall(null);
                      setIsCreatingCall(true);
                      setCallForm({ 
                        title: '', 
                        description: '', 
                        difficulty: 'Medium', 
                        category: 'Local', 
                        associationType: 'team',
                        teamId: '', 
                        eventId: '', 
                        skillsRequired: [],
                        developedSkills: [],
                        qualityLevel: 1,
                        assignedMemberIds: [],
                        deadline: '',
                        applicationLink: ''
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-1" /> Nova Call
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {opportunities.map(o => (
                      <div key={o.id} className={cn(
                        "flex items-center justify-between p-4 border rounded-2xl transition-all hover:shadow-md",
                        selectedCall?.id === o.id ? "border-orange-200 bg-orange-50/30" : "bg-white border-zinc-100"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold block">{o.title}</span>
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                              {o.teamId ? `Equipa: ${teams.find(t => t.id === o.teamId)?.name}` : o.eventId ? `Evento: ${events.find(e => e.id === o.eventId)?.title}` : 'Sem Associação'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="rounded-xl hover:bg-white h-8 w-8 p-0" onClick={() => {
                            setSelectedCall(o);
                            setIsCreatingCall(false);
                            setCallForm({ 
                              ...o, 
                              associationType: o.teamId ? 'team' : 'event',
                              skillsRequired: o.skillsRequired || [],
                              developedSkills: o.developedSkills || [],
                              teamId: o.teamId || '',
                              eventId: o.eventId || '',
                              assignedMemberIds: o.assignedMemberIds || [],
                              deadline: o.deadline || '',
                              applicationLink: o.applicationLink || '',
                              qualityLevel: o.qualityLevel || 1
                            } as any);
                          }}>
                            <Edit2 className="h-4 w-4 text-zinc-400" />
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-xl hover:bg-red-50 text-red-600 h-8 w-8 p-0" onClick={() => {
                            requestConfirmation(
                              'Eliminar Call',
                              `Tens a certeza que queres eliminar permanentemente a call "${o.title}"?`,
                              async () => {
                                await deleteDoc(doc(db, 'roles', o.id));
                                toast.success('Call eliminada');
                              }
                            );
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(selectedCall || isCreatingCall) && (
                    <div className="space-y-4 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400">{selectedCall ? 'Editar Call' : 'Nova Call'}</h5>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold" onClick={() => {
                          setSelectedCall(null);
                          setIsCreatingCall(false);
                        }}>Cancelar</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1 sm:col-span-2 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Título</Label>
                          <Input className="rounded-xl border-zinc-200 focus:ring-orange-500" placeholder="Título da Call" value={callForm.title} onChange={e => setCallForm({...callForm, title: e.target.value})} />
                        </div>
                        <div className="col-span-1 sm:col-span-2 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descrição</Label>
                          <div className="flex justify-between items-center bg-zinc-900 p-2 rounded-t-xl mb-0">
                            <MarkdownToolbar onInsert={(t) => setCallForm({ ...callForm, description: callForm.description + t })} />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/40 pr-4">Editor</span>
                          </div>
                          <Textarea className="rounded-t-none rounded-b-xl border-zinc-200 focus:ring-orange-500 min-h-[80px]" placeholder="Descrição da oportunidade" value={callForm.description} onChange={e => setCallForm({...callForm, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tipo de Associação</Label>
                          <Select value={callForm.associationType} onValueChange={(v: any) => setCallForm({...callForm, associationType: v, teamId: '', eventId: ''})}>
                            <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="team">Equipa</SelectItem>
                              <SelectItem value="event">Evento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            {callForm.associationType === 'team' ? 'Selecionar Equipa' : 'Selecionar Evento'}
                          </Label>
                          {callForm.associationType === 'team' ? (
                            <Select value={callForm.teamId} onValueChange={v => setCallForm({...callForm, teamId: v})}>
                              <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue placeholder="Escolher Equipa" /></SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Select value={callForm.eventId} onValueChange={v => setCallForm({...callForm, eventId: v})}>
                              <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue placeholder="Escolher Evento" /></SelectTrigger>
                              <SelectContent className="rounded-2xl">
                                {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Link de Candidatura</Label>
                          <Input className="rounded-xl border-zinc-200 focus:ring-orange-500" placeholder="https://forms.gle/..." value={callForm.applicationLink} onChange={e => setCallForm({...callForm, applicationLink: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tipo de Call</Label>
                          <Select value={callForm.category} onValueChange={(v: any) => setCallForm({...callForm, category: v})}>
                            <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="Local">Nacional</SelectItem>
                              <SelectItem value="International">Internacional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Dificuldade (1-5 Estrelas)</Label>
                          <div className="flex items-center gap-4 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  className={cn(
                                    "h-6 w-6 cursor-pointer transition-all", 
                                    star <= (callForm.qualityLevel || 1) ? "text-yellow-500 fill-yellow-500 scale-110" : "text-zinc-300 hover:text-yellow-200"
                                  )}
                                  onClick={() => setCallForm({...callForm, qualityLevel: star})}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-zinc-600">Nível {callForm.qualityLevel || 1}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deadline</Label>
                          <Input className="rounded-xl border-zinc-200 focus:ring-orange-500" type="date" value={callForm.deadline} onChange={e => setCallForm({...callForm, deadline: e.target.value})} />
                        </div>
                        
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Skills Necessárias</Label>
                          <div className="flex flex-wrap gap-1 p-2 border border-zinc-100 rounded-xl bg-zinc-50/50 max-h-[100px] overflow-y-auto">
                            {PREDEFINED_SKILLS.map(skill => (
                              <Badge 
                                key={skill}
                                variant={callForm.skillsRequired.includes(skill) ? 'default' : 'outline'}
                                className="cursor-pointer text-[9px] px-2 py-0"
                                onClick={() => {
                                  const current = callForm.skillsRequired;
                                  const next = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
                                  setCallForm({...callForm, skillsRequired: next});
                                }}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Skills a Desenvolver</Label>
                          <div className="flex flex-wrap gap-1 p-2 border border-zinc-100 rounded-xl bg-zinc-50/50 max-h-[100px] overflow-y-auto">
                            {PREDEFINED_SKILLS.map(skill => (
                              <Badge 
                                key={skill}
                                variant={callForm.developedSkills.includes(skill) ? 'default' : 'outline'}
                                className="cursor-pointer text-[9px] px-2 py-0 bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100"
                                onClick={() => {
                                  const current = callForm.developedSkills;
                                  const next = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
                                  setCallForm({...callForm, developedSkills: next});
                                }}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-100" onClick={handleAdminUpdateCall} disabled={loading}>
                        {selectedCall ? 'Atualizar Call' : 'Criar Call'}
                      </Button>
                      {selectedCall && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-red-600 font-bold text-xs" 
                          onClick={() => {
                            requestConfirmation(
                              'Eliminar Call',
                              `Tens a certeza que queres eliminar a call "${selectedCall.title}"?`,
                              async () => {
                                await deleteDoc(doc(db, 'opportunities', selectedCall.id));
                                toast.success('Call eliminada');
                                setIsManagingCalls(false);
                                setSelectedCall(null);
                              }
                            );
                          }}
                        >
                          Eliminar Call permanentemente
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Card className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsManagingEvents(true)}>
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Eventos</span>
              </CardContent>
            </Card>
          </>
        )}

        {[
          { 
            label: 'Tarefas', 
            icon: CheckCircle2, 
            color: 'bg-green-50 text-green-600', 
            onClick: () => setIsManagingTasks(true) 
          },
          { label: 'Anúncios', icon: Mail, color: 'bg-pink-50 text-pink-600', tab: 'home' },
        ].map((item) => (
          <Card key={item.label} className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => item.onClick ? item.onClick() : setActiveTab(item.tab as any)}>
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <div className={cn("p-3 rounded-2xl", item.color)}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isManagingTasks} onOpenChange={setIsManagingTasks}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gestão de Tarefas</DialogTitle>
            <DialogDescription className="font-medium">Cria e atribui tarefas às equipas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight">Tarefas do LBG</h4>
                <p className="text-[10px] text-zinc-500 font-medium">Gere o fluxo de trabalho das equipas.</p>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold" onClick={() => {
                setSelectedTask(null);
                setIsCreatingTask(true);
                setTaskForm({
                  id: '',
                  title: '',
                  description: '',
                  deadline: '',
                  assignedMemberIds: [] as string[],
                  associationType: 'team' as 'team' | 'event',
                  teamId: '',
                  eventId: '',
                  metaId: '',
                  status: 'Pending' as any,
                  difficulty: 0,
                  skills: [] as string[],
                  developedSkills: [] as string[],
                  coordinatorId: ''
                });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.map(t => (
                <div key={t.id} className={cn(
                  "flex items-center justify-between p-4 border rounded-2xl transition-all hover:shadow-md",
                  selectedTask?.id === t.id ? "border-green-200 bg-green-50/30" : "bg-white border-zinc-100"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{t.title}</span>
                      <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                        {teams.find(team => team.id === t.teamId)?.name || 'Sem Equipa'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="rounded-xl hover:bg-white" onClick={() => {
                      setSelectedTask(t);
                      setIsCreatingTask(false);
                      setTaskForm({
                        id: t.id,
                        title: t.title,
                        description: t.description,
                        deadline: t.deadline || '',
                        assignedMemberIds: t.assignedMemberIds || [],
                        associationType: t.associationType || 'team',
                        teamId: t.teamId || '',
                        eventId: t.eventId || '',
                        metaId: t.metaId || '',
                        status: t.status,
                        difficulty: t.difficulty,
                        skills: t.skills || [],
                        developedSkills: t.developedSkills || [],
                        coordinatorId: t.coordinatorId || ''
                      });
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl hover:bg-red-50 text-red-600" onClick={() => {
                      requestConfirmation(
                        'Eliminar Tarefa',
                        `Tens a certeza que queres eliminar "${t.title}"?`,
                        async () => {
                          await deleteDoc(doc(db, 'tasks', t.id));
                          toast.success('Tarefa eliminada');
                        }
                      );
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {(selectedTask || isCreatingTask) && (
              <div className="space-y-4 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400">{selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h5>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold" onClick={() => {
                    setSelectedTask(null);
                    setIsCreatingTask(false);
                  }}>Cancelar</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Título</Label>
                    <Input className="rounded-xl border-zinc-200 focus:ring-green-500" placeholder="Título da Tarefa" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ponto de Contacto / Coordenador</Label>
                    <Select value={taskForm.coordinatorId} onValueChange={v => setTaskForm({...taskForm, coordinatorId: v})}>
                      <SelectTrigger className="rounded-xl border-zinc-200">
                        <SelectValue placeholder="Escolher Coordenador" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {allMembers.map(m => (
                          <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descrição</Label>
                    <div className="space-y-1">
                      <MarkdownToolbar onInsert={(snippet) => setTaskForm({...taskForm, description: (taskForm.description || '') + snippet})} />
                      <Textarea className="rounded-xl border-zinc-200 focus:ring-green-500 min-h-[120px]" placeholder="O que deve ser feito? (Suporta Markdown)" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tipo de Associação</Label>
                    <Select value={taskForm.associationType} onValueChange={(v: any) => setTaskForm({...taskForm, associationType: v, teamId: '', eventId: ''})}>
                      <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="team">Equipa</SelectItem>
                        <SelectItem value="event">Evento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {taskForm.associationType === 'team' ? 'Selecionar Equipa' : 'Selecionar Evento'}
                    </Label>
                    {taskForm.associationType === 'team' ? (
                      <Select value={taskForm.teamId} onValueChange={v => setTaskForm({...taskForm, teamId: v})}>
                        <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue placeholder="Escolher Equipa" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={taskForm.eventId} onValueChange={v => setTaskForm({...taskForm, eventId: v})}>
                        <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue placeholder="Escolher Evento" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Dificuldade (0-5)</Label>
                    <Input className="rounded-xl border-zinc-200 focus:ring-green-500" type="number" min="0" max="5" value={taskForm.difficulty} onChange={e => setTaskForm({...taskForm, difficulty: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deadline (Opcional)</Label>
                    <Input className="rounded-xl border-zinc-200 focus:ring-green-500" type="date" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-2 text-center md:text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Vincular a uma Meta Coletiva (Opcional)</Label>
                    <Select value={taskForm.metaId || 'none'} onValueChange={(v) => setTaskForm({ ...taskForm, metaId: v === 'none' ? undefined : v })}>
                      <SelectTrigger className="rounded-xl border-zinc-200 h-11"><SelectValue placeholder="Selecione uma Meta" /></SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="none">Nenhuma Associação</SelectItem>
                        {metas.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Skills Necessárias</Label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1 p-2 border border-zinc-100 rounded-xl bg-zinc-50/50 max-h-[100px] overflow-y-auto">
                        {dynamicSkills.map(skill => (
                          <Badge 
                            key={skill}
                            variant={taskForm.skills.includes(skill) ? 'default' : 'outline'}
                            className="cursor-pointer text-[9px] px-2 py-0"
                            onClick={() => {
                              const current = taskForm.skills;
                              const next = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
                              setTaskForm({...taskForm, skills: next});
                            }}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {(user?.role === 'admin' || user?.role === 'management') && (
                        <div className="flex gap-2">
                           <Input 
                             id="new-skill-input"
                             placeholder="Nova competência..." 
                             className="h-8 text-[10px] rounded-lg border-zinc-200 bg-white"
                             onKeyDown={async (e) => {
                               if (e.key === 'Enter') {
                                 const val = e.currentTarget.value.trim();
                                 if (val) {
                                   await addGlobalSkill(val);
                                   setTaskForm({...taskForm, skills: [...taskForm.skills, val]});
                                   e.currentTarget.value = '';
                                   toast.success(`Competência "${val}" adicionada!`);
                                 }
                               }
                             }}
                           />
                           <Button 
                             size="sm" 
                             className="h-8 text-[9px] font-black uppercase px-3 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                             onClick={async () => {
                               const input = document.getElementById('new-skill-input') as HTMLInputElement;
                               const val = input?.value.trim();
                               if (val) {
                                 await addGlobalSkill(val);
                                 setTaskForm({...taskForm, skills: [...taskForm.skills, val]});
                                 input.value = '';
                                 toast.success(`Competência "${val}" adicionada!`);
                               }
                             }}
                           >
                             + Adicionar
                           </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Skills que o Membro vai Desenvolver</Label>
                    <div className="flex flex-wrap gap-1 p-2 border border-zinc-100 rounded-xl bg-orange-50/20 max-h-[100px] overflow-y-auto">
                      {dynamicSkills.map(skill => (
                        <Badge 
                          key={skill}
                          variant={taskForm.developedSkills?.includes(skill) ? 'default' : 'outline'}
                          className={cn(
                            "cursor-pointer text-[9px] px-2 py-0",
                            taskForm.developedSkills?.includes(skill) ? "bg-orange-600 border-orange-600" : "bg-white border-zinc-200 text-zinc-400"
                          )}
                          onClick={() => {
                            const current = taskForm.developedSkills || [];
                            const next = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
                            setTaskForm({...taskForm, developedSkills: next});
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Responsáveis</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 min-h-[50px]">
                      {taskForm.assignedMemberIds.map(uid => (
                        <Badge key={uid} variant="secondary" className="gap-1 bg-white border-zinc-200 text-zinc-700 py-1 px-2 rounded-lg">
                          {allMembers.find(m => m.uid === uid)?.displayName}
                          <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setTaskForm({...taskForm, assignedMemberIds: taskForm.assignedMemberIds.filter(id => id !== uid)})} />
                        </Badge>
                      ))}
                      <Select onValueChange={(v: string) => {
                        if (!taskForm.assignedMemberIds.includes(v)) {
                          setTaskForm({...taskForm, assignedMemberIds: [...taskForm.assignedMemberIds, v]});
                        }
                      }}>
                        <SelectTrigger className="h-8 w-32 text-[10px] rounded-lg border-dashed"><SelectValue placeholder="+ Atribuir" /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {allMembers.map(m => (
                            <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-100" onClick={handleAdminUpdateTask} disabled={loading}>
                  {selectedTask ? 'Atualizar Tarefa' : 'Criar Tarefa'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Novos Membros (Incoming)</h3>
          <Button variant="ghost" size="sm" className="text-red-600 font-bold text-xs" onClick={() => setIsManagingMembers(true)}>Ver todos</Button>
        </div>
        <div className="space-y-3">
          {allMembers.filter(m => m.status === 'pending').length > 0 ? allMembers.filter(m => m.status === 'pending').slice(0, 3).map((pendingUser) => (
            <Card key={pendingUser.uid} className="border-none bg-white shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setIsManagingMembers(true)}>
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-zinc-50 shadow-sm">
                  <AvatarImage src={pendingUser.photoURL} />
                  <AvatarFallback>{pendingUser.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-zinc-900 truncate">{pendingUser.displayName}</h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Candidate a: {pendingUser.membership || 'Observer'}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={async (e) => {
                    e.stopPropagation();
                    await updateDoc(doc(db, 'users', pendingUser.uid), { status: 'active' });
                    toast.success('Membro aprovado!');
                  }}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => {
                    e.stopPropagation();
                    requestConfirmation(
                      'Recusar Candidatura',
                      `Tens a certeza que queres recusar a candidatura de ${pendingUser.displayName}?`,
                      async () => {
                        await updateDoc(doc(db, 'users', pendingUser.uid), { status: 'rejected' });
                        toast.success('Candidatura recusada.');
                      },
                      'Recusar',
                      'Cancelar'
                    );
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="py-10 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sem novas candidaturas.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  const renderFamilies = () => {
    const isAdmin = user?.role === 'admin' || user?.role === 'management';
    if (selectedFamilyView) {
      const family = selectedFamilyView;
      const familyMentors = allMembers.filter(m => family.mentors.includes(m.uid));
      const familyMentees = allMembers.filter(m => family.mentees.includes(m.uid));

      return (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-500" onClick={() => setSelectedFamilyView(null)}>
            <ChevronRight className="h-4 w-4 rotate-180" /> Voltar às Famílias
          </Button>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-red-900 uppercase tracking-tight">{selectedFamilyView.name}</h2>
            </div>
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: selectedFamilyView.color }}>
              <Heart className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden text-white min-h-[300px]" style={{ backgroundColor: selectedFamilyView.color }}>
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] opacity-60">Conquistas da Família</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                  {selectedFamilyView.achievements && selectedFamilyView.achievements.length > 0 ? selectedFamilyView.achievements.map(ach => (
                    <div key={ach.id} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/10 border border-white/10 backdrop-blur-md group transition-all hover:bg-white/20">
                      <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-lg">
                        <Trophy className="h-6 w-6 text-yellow-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold leading-tight">{ach.title}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-50 mt-1">{ach.date}</p>
                      </div>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 opacity-0 group-hover:opacity-100 text-white/50 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const updated = selectedFamilyView.achievements.filter(a => a.id !== ach.id);
                            await updateDoc(doc(db, 'families', selectedFamilyView.id), { achievements: updated });
                            toast.success('Conquista removida');
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )) : (
                    <div className="py-20 text-center border-2 border-dashed border-white/20 rounded-[2rem] flex flex-col items-center justify-center">
                      <Trophy className="h-10 w-10 mb-4 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Sem conquistas registadas</p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="pt-8 border-t border-white/10 mt-8 space-y-4">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Registar Nova Conquista</Label>
                        <Input 
                          placeholder="Descreve o momento especial..." 
                          className="h-14 bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-2xl px-6 border-2 focus:border-white/30 transition-all font-medium"
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value;
                              if (!val) return;
                              const newAch = { 
                                id: Math.random().toString(36).substr(2, 9), 
                                title: val, 
                                date: new Date().toLocaleDateString('pt-PT') 
                              };
                              await updateDoc(doc(db, 'families', selectedFamilyView.id), { achievements: [...(selectedFamilyView.achievements || []), newAch] });
                              (e.target as HTMLInputElement).value = '';
                              toast.success('Parabéns pela conquista! 🎉');
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none bg-zinc-900 text-white shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40">Mentores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {familyMentors.map(mentor => (
                    <div key={mentor.uid} className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer" onClick={() => setViewingProfile(mentor)}>
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={mentor.photoURL} />
                        <AvatarFallback>{mentor.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold flex-1">{mentor.displayName}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none bg-white shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mentees</CardTitle>
                  {isAdmin && (
                    <Select onValueChange={async (v: string) => {
                      if (!family.mentees.includes(v)) {
                         const updatedMentees = [...family.mentees, v];
                         await updateDoc(doc(db, 'families', family.id), { mentees: updatedMentees });
                         await updateDoc(doc(db, 'users', v), { familyId: family.id });
                         toast.success('Mentee adicionado');
                      }
                    }}>
                      <SelectTrigger className="h-6 w-20 text-[8px] rounded-lg border-zinc-100">
                        <SelectValue placeholder="+ Mentee" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {allMembers.filter(m => !family.mentees.includes(m.uid) && !family.mentors.includes(m.uid)).map(m => (
                          <SelectItem key={m.uid} value={m.uid} className="text-[10px]">{m.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {familyMentees.map(mentee => (
                    <div key={mentee.uid} className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group cursor-pointer" onClick={() => setViewingProfile(mentee)}>
                      <Avatar className="h-8 w-8 border border-zinc-200">
                        <AvatarImage src={mentee.photoURL} />
                        <AvatarFallback>{mentee.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-zinc-900 flex-1">{mentee.displayName}</span>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-zinc-200 rounded-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            requestConfirmation(
                              'Remover Mentee',
                              `Tens a certeza que queres remover ${mentee.displayName} desta família?`,
                              async () => {
                                await updateDoc(doc(db, 'families', family.id), { mentees: family.mentees.filter(id => id !== mentee.uid) });
                                await updateDoc(doc(db, 'users', mentee.uid), { familyId: deleteField() });
                                toast.success('Mentee removido');
                              }
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-red-900 uppercase tracking-tight leading-none italic">Famílias</h2>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">O sistema de mentoria e união de o LBG Almada</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {families.sort((a,b) => (b.achievements?.length || 0) - (a.achievements?.length || 0)).map((family) => {
            const familyMembers = allMembers.filter(m => m.familyId === family.id);
            
            return (
              <Card 
                key={family.id} 
                className="group relative border border-zinc-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden cursor-pointer"
                onClick={() => setSelectedFamilyView(family)}
              >
                <div className="flex flex-col md:flex-row min-h-[160px]">
                  {/* Left Color Bar/Icon Area */}
                  <div className="w-full md:w-48 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: family.color }}>
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Heart className="h-16 w-16 text-white/40 group-hover:scale-125 transition-transform duration-700" />
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                       <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">Família</p>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter group-hover:text-red-600 transition-colors">
                        {family.name}
                      </h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-zinc-400" />
                          <span className="text-xs font-bold text-zinc-500">{(family.achievements || []).length} Conquistas</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row items-center md:items-end gap-3 shrink-0">
                      <div className="flex -space-x-3">
                        {familyMembers.slice(0, 5).map(m => (
                          <Avatar key={m.uid} className="h-10 w-10 border-2 border-white shadow-md">
                            <AvatarImage src={m.photoURL} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-400">{m.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {familyMembers.length > 5 && (
                          <div className="h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-md">
                            +{familyMembers.length - 5}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-14 w-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-inner shrink-0" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFamilyView(family);
                    }}>
                      <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHelp = () => {
    const availableSkills = Array.from(new Set(allMembers.flatMap(m => m.skills))) as string[];
    const availableTeams = teams.map(t => t.name);
    const availableRoles = Array.from(new Set(allMembers.map(m => m.position).filter(Boolean))) as string[];
    const availableEvents = Array.from(new Set(events.filter(e => !e.isHistorical).map(e => e.title))) as string[];

    let suggestions: string[] = [];
    if (searchFilter === 'skill') suggestions = availableSkills;
    else if (searchFilter === 'team') suggestions = availableTeams;
    else if (searchFilter === 'role') suggestions = availableRoles;
    else if (searchFilter === 'event') suggestions = availableEvents;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Queres ajuda?</h2>
          <p className="text-sm text-zinc-500">Encontra membros que te podem ajudar em áreas específicas.</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Quem ou o que procuras? (ex: Photoshop, MOs...)" 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={searchFilter} onValueChange={(v: any) => {
              setSearchFilter(v);
              setSearchQuery(''); // Reset query when changing filter to show all suggestions
            }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skill">Skill</SelectItem>
                <SelectItem value="team">Equipa</SelectItem>
                <SelectItem value="role">Cargo</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 10).map(s => (
                <Badge 
                  key={s} 
                  variant={searchQuery.toLowerCase() === s.toLowerCase() ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-zinc-100 py-1 px-3 rounded-full transition-all"
                  onClick={() => setSearchQuery(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid gap-4">
            {allMembers
              .filter(m => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                if (searchFilter === 'skill') return m.skills.some(s => s.toLowerCase().includes(query));
                if (searchFilter === 'team') return teams.find(t => t.id === m.teamId)?.name.toLowerCase().includes(query);
                if (searchFilter === 'role') return m.position?.toLowerCase().includes(query) || (query === 'membro' && !m.position);
                if (searchFilter === 'event') {
                  const memberTeams = teams.filter(t => t.id === m.teamId);
                  const coordinatorEvents = events.filter(e => e.coordinatorId === m.uid);
                  
                  const teamEventMatch = memberTeams.some(t => {
                    const event = events.find(e => e.id === t.eventId);
                    return event?.title.toLowerCase().includes(query);
                  });
                  
                  const coordinatorMatch = coordinatorEvents.some(e => e.title.toLowerCase().includes(query));
                  
                  return teamEventMatch || coordinatorMatch;
                }
                return m.displayName.toLowerCase().includes(query);
              })
            .map(m => (
              <Card key={m.uid} className="border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewingProfile(m)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={m.photoURL} />
                    <AvatarFallback>{m.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-900">{m.displayName}</h4>
                    <p className="text-xs text-zinc-500">{m.position || 'Membro'} • {teams.find(t => t.id === m.teamId)?.name || 'Sem Equipa'}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.skills.slice(0, 3).map(s => (
                        <Badge key={s} variant="secondary" className="text-[8px] px-1.5 py-0">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-red-600">
                    <Mail className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
    );
  };
  const renderEvents = () => {
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
      const year = eventCurrentMonth.getFullYear();
      const month = eventCurrentMonth.getMonth();
      const numDays = daysInMonth(year, month);
      const startDay = firstDayOfMonth(year, month);
      const today = new Date();
      
      const days = [];
      for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-20 border border-zinc-50 bg-zinc-50/50" />);
      }
      
      for (let d = 1; d <= numDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = events.filter(e => {
          if (e.startDate && e.endDate) {
            return dateStr >= e.startDate && dateStr <= e.endDate;
          }
          return (e as any).date === dateStr;
        });
        const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
        
        days.push(
          <div key={d} className={cn("h-20 border border-zinc-50 p-1 relative hover:bg-zinc-50 transition-colors cursor-pointer group", isToday && "bg-red-50/30")}>
            <div className="flex justify-between items-start">
              <span className={cn("text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full", isToday ? "bg-red-600 text-white" : "text-zinc-400")}>{d}</span>
            </div>
            <div className="mt-1 space-y-0.5 overflow-hidden">
              {dayEvents.map(e => (
                <div 
                  key={e.id} 
                  className="text-[8px] px-1 py-0.5 rounded bg-red-100 text-red-700 truncate font-bold"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setSelectedEventDetails(e);
                  }}
                >
                  {e.title}
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-100">
          <div className="p-4 flex items-center justify-between bg-zinc-900 text-white">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setEventCurrentMonth(new Date(year, month - 1))}>
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <h3 className="text-sm font-black uppercase tracking-widest">
              {eventCurrentMonth.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
            </h3>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setEventCurrentMonth(new Date(year, month + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 text-center border-b border-zinc-100">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="py-2 text-[8px] font-black text-zinc-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-red-900 uppercase tracking-tight">Eventos o LBG</h2>
            <p className="text-sm text-zinc-500 font-medium">Fica a par de tudo o que acontece.</p>
          </div>
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <Button 
              variant={eventViewMode === 'calendar' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-8 px-3 text-[10px] font-bold rounded-lg", eventViewMode === 'calendar' && "bg-white shadow-sm")}
              onClick={() => setEventViewMode('calendar')}
            >
              Calendário
            </Button>
            <Button 
              variant={eventViewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-8 px-3 text-[10px] font-bold rounded-lg", eventViewMode === 'list' && "bg-white shadow-sm")}
              onClick={() => setEventViewMode('list')}
            >
              Lista
            </Button>
          </div>
        </div>

        {eventViewMode === 'calendar' ? renderCalendar() : (
          <div className="space-y-4">
            {events.filter(e => !e.isHistorical).length > 0 ? events.filter(e => !e.isHistorical).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((ev) => (
              <Card key={ev.id} className="border-none bg-white shadow-sm overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-0 flex h-32">
                  <div className="w-24 bg-red-600 text-white flex flex-col items-center justify-center p-4 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">{new Date(ev.startDate).toLocaleDateString('pt-PT', { month: 'short' })}</span>
                    <span className="text-3xl font-black leading-none">{new Date(ev.startDate).getDate()}</span>
                  </div>
                  {ev.imageUrl && (
                    <div className="w-24 border-r border-zinc-100 overflow-hidden shrink-0 hidden sm:block">
                      <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="p-4 flex-1 min-w-0 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors truncate">{ev.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 shrink-0">
                              <MapPin className="h-3 w-3" /> {ev.location}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 shrink-0">
                              <Clock className="h-3 w-3" /> {ev.time}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] uppercase tracking-widest px-1.5 py-0 shrink-0 border-zinc-100">{ev.type}</Badge>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-tight">
                        {ev.description}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[10px] font-black p-0 text-red-600 hover:bg-transparent justify-start w-fit uppercase tracking-wider"
                      onClick={() => setSelectedEventDetails(ev)}
                    >
                      Saber mais <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border-2 border-dashed border-zinc-100 space-y-4">
                <Calendar className="h-10 w-10 text-zinc-200" />
                <div className="text-center">
                  <p className="text-sm font-bold text-zinc-900">Ainda não há eventos</p>
                  <p className="text-xs text-zinc-400">Fica atento aos anúncios para novidades fresquinhas! 👋</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Dialog open={!!selectedEventDetails} onOpenChange={(open) => !open && setSelectedEventDetails(null)}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 border-none">
            {selectedEventDetails && (
              <div className="space-y-0">
                <div className="relative h-48 bg-zinc-900">
                  {selectedEventDetails.imageUrl ? (
                    <img src={selectedEventDetails.imageUrl} alt={selectedEventDetails.title} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900">
                      <Calendar className="h-16 w-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <Badge className="mb-2 bg-red-600 border-none">{selectedEventDetails.type}</Badge>
                    <h2 className="text-2xl font-bold text-white">{selectedEventDetails.title}</h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-6 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <span className="font-bold text-zinc-900">
                        {selectedEventDetails.startDate === selectedEventDetails.endDate 
                          ? selectedEventDetails.startDate 
                          : `${selectedEventDetails.startDate} - ${selectedEventDetails.endDate}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      <span className="font-bold text-zinc-900">{selectedEventDetails.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="font-bold text-zinc-900">{selectedEventDetails.location}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Sobre o Evento</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {selectedEventDetails.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Equipas Responsáveis</h3>
                    <div className="flex flex-wrap gap-2">
                      {teams.filter(t => t.eventId === selectedEventDetails.id).length > 0 ? (
                        teams.filter(t => t.eventId === selectedEventDetails.id).map(t => (
                          <Badge 
                            key={t.id} 
                            variant="outline" 
                            className="bg-zinc-50 text-zinc-600 cursor-pointer hover:bg-zinc-100"
                            onClick={() => setSelectedTeamView(t)}
                          >
                            <Users className="h-3 w-3 mr-1" /> {t.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-[10px] text-zinc-400 italic">Nenhuma equipa específica associada.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-zinc-900">O que podes fazer?</h3>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">
                        {opportunities.filter(o => o.eventId === selectedEventDetails.id).length} Calls Abertas
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {opportunities.filter(o => o.eventId === selectedEventDetails.id).length > 0 ? (
                        opportunities.filter(o => o.eventId === selectedEventDetails.id).map(opp => (
                          <OpportunityCard key={opp.id} opp={opp} teams={teams} />
                        ))
                      ) : (
                        <div className="py-8 text-center bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-100">
                          <p className="text-xs font-bold text-zinc-400">Nenhuma call aberta para este evento de momento.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const defaultFallbacks: Record<string, string> = {
    'about_best': `### O que é o BEST? 🌍

O **BEST (Board of European Students of Technology)** é uma organização europeia de estudantes de tecnologia, sem fins lucrativos, apolítica e não governamental. Presente em mais de 90 universidades de 30 países, promovemos a comunicação, cooperação e intercâmbio científico e tecnológico entre estudantes de toda a Europa.

#### A nossa missão 🔴
Proporcionar educação complementar, apoio à carreira e envolvimento educacional de excelência para todos os estudantes locais e internacionais.

#### Os nossos valores ✨
*   **Flexibilidade**: Capacidade de adaptação rápida a novas situações e desafios inovadores.
*   **Amizade**: Criação de relações fortes, cooperação e espírito de família inigualável.
*   **Melhoria Contínua**: Procura constante da excelência e desenvolvimento pessoal.
*   **Aprendizagem**: Enriquecimento contínuo através da experiência e partilha de conhecimento.
*   **Divertimento**: Desfrutar de cada momento de trabalho e colaboração.`,

    'lbg_almada': `### Bem-vindo ao LBG Almada! 🔴✨

O **LBG Almada (Local BEST Group Almada)** é o grupo local da Associação BEST sediado na **FCT NOVA** (Faculdade de Ciências e Tecnologia da Universidade Nova de Lisboa) desde 2011!

#### O que fazemos?
*   **Cursos de Engenharia e Tecnologia**: Organizamos e enviamos estudantes para os prestigiados *BEST Courses* pela Europa fora.
*   **Eventos de Carreira**: Estabelecemos pontes sólidas entre estudantes, a universidade e o tecido empresarial nacional e internacional.
*   **Desenvolvimento de Soft Skills**: Proporcionamos formações em liderança, falar em público, negociação, gestão de equipas, entre outras.
*   **Espírito e Comunidade**: Fortalecemos o espírito associativo através de atividades inesquecíveis e team buildings!`,

    'memberships': `### Graus de Memberships no LBG Almada 🔴

No LBG Almada, o teu envolvimento e crescimento são acompanhados por diferentes graus de filiação, cada um com os seus direitos, deveres e oportunidades de desenvolvimento:

1.  **Bebé (Baby)**
    O primeiro contacto com o grupo local! Um novo membro que acabou de entrar no recrutamento e está a aprender sobre o funcionamento do LBG, a conhecer os restantes membros e a habituar-se à dinâmica do BEST Almada.

2.  **Observador (Observer)**
    Para membros em transição que já demonstram grande interesse e participação ativa. Preparam-se para assumir o compromisso de se tornarem membros efetivos e começam a colaborar mais de perto nas atividades diárias.

3.  **Membro Efetivo (Full Member)**
    O estatuto principal e mais ativo! Os membros efetivos têm direito de voto nas Assembleias Gerais locais, podem candidatar-se a cargos de liderança (como a Board, Mesa de Assembleia ou Coordenadores) e representam o LBG em eventos locais e internacionais.

4.  **Alumnus**
    Membros que terminaram o seu percurso académico ou decidiram reduzir o seu papel ativo no grupo local. Continuam a apoiar o LBG Almada com o seu valioso conhecimento, mentoria e apoio intergeracional.`,

    'recognition': `### Reconhecimento e Impacto no BEST 🏆

O impacto de ser membro do BEST Almada vai muito além do trabalho associativo habitual. O esforço e dedicação de cada membro são amplamente valorizados:

*   **Certificação de Competências**: Todas as posições de liderança (Board, Coordenadores, Responsáveis de Departamento) e formações dadas ou recebidas têm direito a certificados oficiais que enriquecem o teu currículo.
*   **Experiência Prática**: Desenvolve competências cruciais como gestão de projetos, angariação de patrocínios (Fundraising), design, programação, oratória e gestão de conflitos em ambientes reais de alta responsabilidade.
*   **Networking Europeu**: Liga-te a milhares de estudantes de engenharia de mais de 30 países diferentes e constrói uma rede internacional única de futuros líderes e engenheiros.
*   **Contactos com Empresas**: Cria ligações diretas com marcas de prestígio que apoiam as nossas atividades e eventos de recrutamento.`,

    'skills_dev': `### Desenvolvimento de Competências (Skills) 🚀

No BEST Almada, acreditamos na aprendizagem pela prática (*learning by doing*). Dependendo dos teus interesses e dos departamentos em que participas, poderás desenvolver competências de excelência nas seguintes áreas:

*   **Liderança & Gestão de Projetos**: Organização de eventos locais e internacionais, coordenação de equipas de trabalho e otimização de recursos.
*   **Comunicação & Vendas (Fundraising)**: Negociação e reuniões profissionais com empresas parceiras, técnicas de persuasão e elaboração de contratos comerciais.
*   **Marketing & Relações Públicas (PR)**: Gestão de redes sociais, criação de campanhas de marketing inovadoras, branding pessoal e institucional.
*   **Criatividade & Design**: Utilização de ferramentas profissionais de design gráfico, desenvolvimento de identidades visuais de eventos e material de merchandising.
*   **Tecnologia & Programação (IT)**: Desenvolvimento e manutenção de plataformas web (como este Hub!), administração de sistemas e gestão de infraestruturas digitais.
*   **Trabalho de Equipa & Adaptabilidade**: Experiência de colaboração num ambiente dinâmico, multicultural e focado no crescimento mútuo.`,

    'international': `### Oportunidades Internacionais pelo BEST 🌍✈️

Como parte da rede europeia do BEST, os membros do LBG Almada e estudantes da FCT NOVA têm acesso a uma vasta gama de oportunidades incríveis em mais de 30 países da Europa:

#### 1. BEST Courses
Cursos de 1 a 2 semanas focados em tópicos tecnológicos de ponta (Inteligência Artificial, Energias Renováveis, Aeroespacial, etc.), organizados por universidades de prestígio por toda a Europa. 
*   **Baixo Custo**: Apenas pagas a viagem até lá! O alojamento, 3 refeições por dia e todas as atividades sociais e culturais estão incluídos na taxa de participação que é mínima (ou muitas vezes totalmente gratuita para membros do BEST).

#### 2. Eventos de Educação (Events on Education)
Fóruns e debates onde estudantes discutem e moldam o futuro do ensino superior de engenharia na Europa, colaborando de perto com professores, reitores e especialistas de topo.

#### 3. Encontros Culturais (Exchanges)
Intercâmbios com outros Local BEST Groups (LBG's) em que viajas para conhecer novas culturas, cidades e fazer amizades europeias inesquecíveis em fins de semana repletos de atividades.

#### 4. BEST Training Event
Eventos inteiramente dedicados ao desenvolvimento de soft skills, com formadores certificados que te dão ferramentas essenciais para brilhares profissionalmente.`,

    'onboarding': `### Guia de Onboarding para Novos Membros 🚀🔴

Bem-vindo ao LBG Almada! Estamos super entusiasmados por te ter connosco. Os teus primeiros dias vão ser repletos de descobertas e aprendizagens. Aqui tens o roteiro básico para dares os teus primeiros passos de forma bem-sucedida:

#### Passo 1: O teu Padrinho/Madrinha 👥
No LBG Almada tens o nosso programa de mentoria! Será atribuído um padrinho ou madrinha que te acompanhará no teu percurso inicial, apresentará o grupo, tirará as tuas dúvidas e garantirá que te integras facilmente.

#### Passo 2: Explora os Departamentos 🔍
Fala com os responsáveis (VPs) de cada departamento (FR, HR, PR, IT, Design) e assiste às suas reuniões gerais. Descobre as tarefas que mais te entusiasmam e desafia-te a experimentar novas áreas de interesse.

#### Passo 3: Cria a tua Conta e Acessos 🌐
*   Solicita os teus acessos para o Slack/Discord institucional.
*   Cria a tua conta no Portal Internacional do BEST (best.eu.org) utilizando o teu e-mail institucional.
*   Garante que tens acesso às ferramentas locais do LBG Almada no Google Drive.

#### Passo 4: Participa nas Reuniões Locais 🔴
As reuniões gerais e Assembleias Gerais são o coração do LBG Almada. Participa ativamente, partilha as tuas ideias e acompanha as decisões importantes do grupo!`,

    'internal_faq': `### FAQ Interna - Perguntas Frequentes ❓🔴

Eis as respostas às dúvidas mais comuns dos membros e novos recrutas do LBG Almada:

#### Como me posso voluntariar para ajudar a organizar um evento local?
Deves falar diretamente com o respetivo Coordenador do Evento (Main Organizer) ou com a Board nas reuniões gerais. Todos os eventos precisam de ajuda em diversas frentes (FR, PR, Logística, etc.).

#### Quanto tempo tenho de dedicar ao LBG Almada por semana?
Não há uma regra fixa! Cada membro gere o seu tempo e escolhe o seu nível de dedicação de acordo com a sua disponibilidade académica e pessoal. Recomendamos que tentes manter-te informado e que participes nas reuniões sempre que possas.

#### Como posso propor uma nova ideia ou projeto?
Podes apresentar qualquer proposta numa reunião geral do LBG Almada ou falar previamente com o respetivo membro da Board que apoiará o desenvolvimento e estruturação da tua ideia.

#### Quem me pode certificar uma formação ou cargo desempenhado?
A Board do LBG Almada passa certificados formais de cargos, coordenações de projetos ou participações em eventos locais. Basta falares com o Secretário ou a Presidente para que seja emitido.`
  };

  const SidebarPage = ({ 
    id, 
    title, 
    icon: Icon, 
    description, 
    isAdmin 
  }: { 
    id: string, 
    title: string, 
    icon: any, 
    description: string, 
    isAdmin: boolean 
  }) => {
    const defaultText = defaultFallbacks[id] || 'A carregar conteúdo...';
    const content = appContent[id] || { text: defaultText, title: title };
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(content.text);

    React.useEffect(() => {
      if (!isEditing) {
        setEditValue(content.text);
      }
    }, [content.text, isEditing]);

    const handleSave = async () => {
      try {
        await setDoc(doc(db, 'appContent', id), { text: editValue, title: title }, { merge: true });
        setIsEditing(false);
        toast.success('Conteúdo atualizado!');
      } catch (error) {
        toast.error('Erro ao guardar conteúdo');
      }
    };

    return (
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-100">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-red-900 uppercase tracking-tighter">{title}</h2>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Página de Informação</p>
              </div>
            </div>
            <p className="text-base text-zinc-500 font-medium leading-relaxed max-w-lg">{description}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" className="rounded-2xl border-zinc-200 font-bold" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button className="rounded-2xl bg-red-600 hover:bg-red-700 font-bold" onClick={handleSave}>Guardar</Button>
                </>
              ) : (
                <Button variant="outline" className="rounded-2xl border-zinc-200 font-bold gap-2" onClick={() => {
                  setEditValue(content.text);
                  setIsEditing(true);
                }}>
                  <Edit2 className="h-4 w-4" /> Editar Conteúdo
                </Button>
              )}
            </div>
          )}
        </div>

        <Card className="border-none bg-white shadow-2xl shadow-zinc-200/50 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10">
            {isEditing ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-zinc-900 p-2 rounded-t-3xl">
                    <MarkdownToolbar onInsert={(t) => setEditValue(editValue + t)} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 pr-4">Markdown Editor</span>
                  </div>
                  <Textarea 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    className="min-h-[500px] text-sm leading-relaxed border-zinc-100 rounded-b-3xl rounded-t-none p-8 focus:ring-red-500 bg-zinc-50/30"
                    placeholder="Escreve aqui o conteúdo da página..."
                  />
                </div>
            ) : (
              <div className="prose prose-red max-w-none prose-sm md:prose-base prose-p:text-zinc-600 prose-headings:text-zinc-900 prose-headings:font-black prose-headings:uppercase prose-p:leading-relaxed prose-li:text-zinc-600 font-medium">
                {id === 'social_bodies' ? renderSocialBodies() : <SafeMarkdown>{content.text}</SafeMarkdown>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    const isAdmin = user?.role === 'admin' || user?.role === 'management';
    
    // Check if it's a standard tab
    switch (activeTab) {
      case 'home': return renderHome();
      case 'teams': return renderTeams();
      case 'opportunities': return renderOpportunities();
      case 'metas': return renderMetas();
      case 'profile': return renderProfile();
      case 'admin': return renderBoard();
      case 'events': return renderEvents();
      case 'families': return renderFamilies();
      case 'help': return renderHelp();
      case 'wellness': return <WellnessForms />;
      case 'announcements_archive': return renderAnnouncementsArchive();
      case 'glossary': return renderGlossary();
      case 'history': return renderHistory();
    }

    // If not a standard tab, it might be a dynamic sidebar page
    const sidebarPages: Record<string, { title: string, icon: any, desc: string }> = {
      'about_best': { title: 'Sobre o BEST', icon: Info, desc: 'A maior rede de estudantes de tecnologia da Europa.' },
      'lbg_almada': { title: 'o LBG Almada', icon: MapPin, desc: 'O teu grupo local na FCT NOVA.' },
      'social_bodies': { title: 'Órgãos Sociais', icon: Shield, desc: 'A equipa que gere o LBG Almada.' },
      'memberships': { title: 'Memberships', icon: Award, desc: 'Os diferentes níveis de envolvimento.' },
      'recognition': { title: 'Reconhecimento', icon: Trophy, desc: 'O impacto de ser membro do BEST.' },
      'skills_dev': { title: 'Desenvolvimento', icon: Target, desc: 'As competências que podes adquirir.' },
      'international': { title: 'Oportunidades Internacionais', icon: Globe, desc: 'Courses, events, trainings e exchanges pela Europa.' },
      'onboarding': { title: 'Guia de Onboarding', icon: Rocket, desc: 'Os teus primeiros passos no BEST.' },
      'internal_faq': { title: 'FAQ Interna', icon: HelpCircle, desc: 'Dúvidas frequentes sobre o LBG.' }
    };

    if (sidebarPages[activeTab]) {
      const page = sidebarPages[activeTab];
      return (
        <SidebarPage 
          id={activeTab} 
          title={page.title} 
          icon={page.icon} 
          description={page.desc} 
          isAdmin={isAdmin} 
        />
      );
    }

    return renderHome();
  };

  const renderHistory = () => {
    const isAdmin = user?.role === 'admin' || user?.role === 'management';
    
    return (
      <div className="space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Arquivo Histórico 🏛️</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">A nossa história ao longo dos anos</p>
          </div>
          
      <div className="flex flex-col md:flex-row items-center gap-2 bg-zinc-50 p-2 rounded-2xl border border-zinc-100 shadow-sm self-start">
            <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-xl hover:bg-zinc-200"
                  onClick={() => setSelectedHistoryYear(prev => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-xl border border-zinc-100 shadow-inner">
                  <span className="text-base font-black text-zinc-900">{selectedHistoryYear}/{String(selectedHistoryYear + 1).slice(-2)}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-xl hover:bg-zinc-200"
                  onClick={() => setSelectedHistoryYear(prev => prev + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="w-full h-12 bg-white border border-zinc-100 p-1 rounded-2xl mb-6">
            <TabsTrigger value="events" className="flex-1 rounded-xl data-[state=active]:bg-zinc-900 data-[state=active]:text-white uppercase text-[9px] font-black tracking-widest">Eventos</TabsTrigger>
            <TabsTrigger value="social" className="flex-1 rounded-xl data-[state=active]:bg-zinc-900 data-[state=active]:text-white uppercase text-[9px] font-black tracking-widest">Orgãos de Gestão</TabsTrigger>
            <TabsTrigger value="coordinators" className="flex-1 rounded-xl data-[state=active]:bg-zinc-900 data-[state=active]:text-white uppercase text-[9px] font-black tracking-widest">Coordenadores</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-6">
            {renderAnnouncementsArchive()}
          </TabsContent>

          <TabsContent value="coordinators" className="space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l-2 border-orange-600 pl-2">Coordenadores de {selectedHistoryYear}/{String(selectedHistoryYear + 1).slice(-2)}</h4>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider"
                  onClick={() => {
                    setSocialBodyForm({
                      userId: '',
                      role: '',
                      position: 'Coordenadores',
                      profileLink: '',
                      contactDetails: '',
                      term: `${selectedHistoryYear}/${selectedHistoryYear + 1}`,
                      isCurrent: false,
                      year: selectedHistoryYear
                    });
                    setIsManagingSocialBodies(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Novo Coordenador Histórico
                </Button>
              )}
            </div>

            <div className="grid gap-3">
              {socialBodies
                .filter(m => (m.position as string) === 'Coordenadores' && m.year === selectedHistoryYear)
                .map(m => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-zinc-50">
                          <AvatarImage src={allMembers.find(mem => mem.uid === m.userId)?.photoURL} />
                          <AvatarFallback>{allMembers.find(mem => mem.uid === m.userId)?.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-zinc-900">{allMembers.find(mem => mem.uid === m.userId)?.displayName}</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-md hover:bg-zinc-100"
                              onClick={() => setViewingProfile(allMembers.find(mem => mem.uid === m.userId) || null)}
                            >
                              <ExternalLink className="h-3 w-3 text-zinc-400" />
                            </Button>
                          </div>
                          <p className="text-[10px] text-orange-600 uppercase font-black tracking-wider">{m.role} <span className="text-zinc-400 ml-2">• Mandato: {m.term}</span></p>
                        </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-400 hover:text-red-600" 
                          onClick={() => {
                            setSelectedSocialBodyMember(m);
                            setSocialBodyForm({
                              userId: m.userId,
                              role: m.role,
                              position: m.position,
                              profileLink: m.profileLink || '',
                              contactDetails: m.contactDetails || '',
                              term: m.term || '',
                              isCurrent: m.isCurrent || false,
                              year: m.year || selectedHistoryYear
                            });
                            setIsManagingSocialBodies(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-zinc-400 hover:text-red-600" 
                          onClick={() => deleteDoc(doc(db, 'socialBodies', m.id))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              {socialBodies.filter(m => (m.position as string) === 'Coordenadores' && m.year === selectedHistoryYear).length === 0 && (
                <div className="text-center py-12 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200">
                  <p className="text-xs font-bold text-zinc-400 uppercase">Nenhum coordenador registado para {selectedHistoryYear}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l-2 border-red-600 pl-2">Eventos de {selectedHistoryYear}/{String(selectedHistoryYear + 1).slice(-2)}</h4>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider"
                  onClick={() => {
                    setEventForm({
                      title: '',
                      description: '',
                      startDate: `${selectedHistoryYear}-01-01`,
                      endDate: `${selectedHistoryYear}-01-01`,
                      time: '',
                      location: '',
                      type: 'Local' as any,
                      imageUrl: '',
                      isHistorical: true,
                      coordinatorId: '',
                      academicYear: `${selectedHistoryYear}/${String(selectedHistoryYear + 1).slice(-2)}`
                    });
                    setIsManagingEvents(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Novo Evento Histórico
                </Button>
              )}
            </div>

            <div className="grid gap-3">
              {events
                .filter(e => {
                  const academicYearOfEvent = e.academicYear || getAcademicYearFromDate(e.startDate);
                  const selectedYearLabel = `${selectedHistoryYear}/${String(selectedHistoryYear + 1).slice(-2)}`;
                  return academicYearOfEvent === selectedYearLabel;
                })
                .sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-zinc-100 hover:border-red-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-zinc-900 group-hover:text-red-700">{ev.title}</h5>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{ev.startDate.split('-')[0]}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-black" onClick={() => setSelectedEventDetails(ev)}>Detalhes</Button>
                    {isAdmin && (
                      <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-red-600" onClick={() => {
                          setSelectedEvent(ev);
                          setEventForm({
                            title: ev.title,
                            description: ev.description,
                            startDate: ev.startDate || '',
                            endDate: ev.endDate || '',
                            time: ev.time || '',
                            location: ev.location || '',
                            type: ev.type,
                            imageUrl: ev.imageUrl || '',
                            isHistorical: ev.isHistorical || false,
                            coordinatorId: ev.coordinatorId || '',
                            academicYear: ev.academicYear || ''
                          });
                          setIsManagingEvents(true);
                      }}><Edit2 className="h-3 w-3" /></Button>
                    )}
                  </div>
                </div>
              ))}
              {events.filter(e => {
                  const academicYearOfEvent = e.academicYear || getAcademicYearFromDate(e.startDate);
                  const selectedYearLabel = `${selectedHistoryYear}/${String(selectedHistoryYear + 1).slice(-2)}`;
                  return academicYearOfEvent === selectedYearLabel;
              }).length === 0 && (
                <div className="text-center py-12 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200">
                  <p className="text-xs font-bold text-zinc-400 uppercase">Nenhum evento registado para {selectedHistoryYear}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l-2 border-red-600 pl-2">Órgãos Sociais de {selectedHistoryYear}/{String(selectedHistoryYear + 1).slice(-2)}</h4>
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider"
                  onClick={() => {
                    setSocialBodyForm({
                      userId: '',
                      role: '',
                      position: 'Board',
                      profileLink: '',
                      contactDetails: '',
                      term: `${selectedHistoryYear}/${selectedHistoryYear + 1}`,
                      isCurrent: false,
                      year: selectedHistoryYear
                    });
                    setIsManagingSocialBodies(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Novo Membro Histórico
                </Button>
              )}
            </div>

            {['Board', 'Mesa da Assembleia Geral', 'Conselho Fiscal'].map(pos => {
              const yearMembers = socialBodies.filter(m => m.position === pos && m.year === selectedHistoryYear);
              
              return (
                <div key={pos} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-extrabold text-zinc-800 uppercase tracking-tight">{pos}</h5>
                  </div>
                  <div className="grid gap-3">
                    {yearMembers.map(m => (
                       <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm transition-all hover:shadow-md group gap-4">
                        <div className="flex items-center gap-4">
                           <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-zinc-50 shrink-0">
                             <AvatarImage src={allMembers.find(mem => mem.uid === m.userId)?.photoURL} />
                             <AvatarFallback>{allMembers.find(mem => mem.uid === m.userId)?.displayName.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-zinc-900 truncate">{allMembers.find(mem => mem.uid === m.userId)?.displayName}</p>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-md hover:bg-zinc-100"
                                  onClick={() => setViewingProfile(allMembers.find(mem => mem.uid === m.userId) || null)}
                                >
                                  <ExternalLink className="h-3 w-3 text-zinc-400" />
                                </Button>
                              </div>
                              <p className="text-[10px] text-red-600 uppercase font-black tracking-wider break-words">{m.role} <span className="text-zinc-400 ml-2 inline-block">• Mandato: {m.term}</span></p>
                           </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-zinc-400 hover:text-red-600" 
                              onClick={() => {
                                setSelectedSocialBodyMember(m);
                                setSocialBodyForm({
                                  userId: m.userId,
                                  role: m.role,
                                  position: m.position,
                                  profileLink: m.profileLink || '',
                                  contactDetails: m.contactDetails || '',
                                  term: m.term || '',
                                  isCurrent: m.isCurrent || false,
                                  year: m.year || selectedHistoryYear
                                });
                                setIsManagingSocialBodies(true);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-zinc-400 hover:text-red-600" 
                              onClick={() => deleteDoc(doc(db, 'socialBodies', m.id))}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {yearMembers.length === 0 && (
                      <div className="p-4 rounded-2xl bg-zinc-50/50 border border-dashed border-zinc-200 text-center">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Nenhum registo de {pos}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Imagem muito grande! O limite máximo é de 50MB.');
        return;
      }
      try {
        const base64String = await compressImageFile(file);
        setTeamForm({ ...teamForm, imageUrl: base64String });
      } catch (err) {
        toast.error('Erro ao processar imagem.');
      }
    }
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Imagem muito grande! O limite máximo é de 50MB.');
        return;
      }
      try {
        const base64String = await compressImageFile(file);
        setEventForm({ ...eventForm, imageUrl: base64String });
      } catch (err) {
        toast.error('Erro ao processar imagem.');
      }
    }
  };

  const handleAnnouncementImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Imagem muito grande! O limite máximo é de 50MB.');
        return;
      }
      try {
        const base64String = await compressImageFile(file);
        setAnnouncementForm({ ...announcementForm, imageUrl: base64String });
      } catch (err) {
        toast.error('Erro ao processar imagem.');
      }
    }
  };

  const renderAnnouncementsArchive = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Get the featured announcements to exclude them from the archive
    // (replicating the logic in renderAnnouncements)
    const featuredAnnouncements = announcements
      .filter(ann => new Date(ann.createdAt) > oneWeekAgo)
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
    
    const featuredIds = new Set(featuredAnnouncements.map(a => a.id));
    
    const historical = announcements.filter(ann => !featuredIds.has(ann.id));
    
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border border-zinc-100" onClick={() => setActiveTab('home')}>
             <ChevronLeft className="h-5 w-5" />
           </Button>
           <div className="space-y-1">
             <h2 className="text-3xl font-black text-red-900 uppercase tracking-tighter transition-all">Arquivo de Anúncios</h2>
             <p className="text-sm text-zinc-500 font-medium">Todos os comunicados que não estão em destaque.</p>
           </div>
        </div>

        <div className="grid gap-4">
           {historical.length > 0 ? historical.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(ann => (
             <Card 
               key={ann.id} 
               className="border-none bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-[2rem] overflow-hidden" 
               onClick={() => setSelectedAnnouncementDetails(ann)}
             >
               <CardContent className="p-0">
                 <div className="flex flex-col md:flex-row">
                   {ann.imageUrl && (
                     <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden bg-zinc-100 shrink-0">
                        <img src={ann.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                     </div>
                   )}
                   <div className="p-6 flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-zinc-900 transition-colors uppercase tracking-tight">{ann.title}</h4>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(ann.createdAt).toLocaleDateString()}</span>
                        </div>
                        {ann.type && ann.type !== 'general' && (
                          <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-red-50 text-red-600 rounded-lg">{ann.type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )) : (
             <div className="text-center py-20 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
               <Megaphone className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
               <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Ainda não existem anúncios no arquivo.</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  const handleAnnouncementPersonPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Imagem muito grande! O limite máximo é de 50MB.');
        return;
      }
      try {
        const base64String = await compressImageFile(file);
        setAnnouncementForm({ ...announcementForm, associatedPersonPhotoURL: base64String });
      } catch (err) {
        toast.error('Erro ao processar imagem.');
      }
    }
  };

  const renderAnnouncements = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const activeAnnouncements = announcements.filter(ann => new Date(ann.createdAt) > oneWeekAgo);

    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Anúncios Recentes</h3>
          <div className="flex gap-2">
            <Button 
              id="announcements-archive-btn"
              variant="ghost" 
              size="sm" 
              className="text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-700 transition-all group" 
              onClick={() => setActiveTab('announcements_archive')}
            >
              Ver Arquivo
              <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            {user?.role === 'admin' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 font-bold text-xs"
                onClick={() => setIsManagingAnnouncements(true)}
              >
                Gerir
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {activeAnnouncements.length > 0 ? activeAnnouncements.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2).map((ann) => {
            const person = allMembers.find(m => m.uid === ann.relatedPersonId);
            const team = teams.find(t => t.id === ann.relatedTeamId);
            const ev = events.find(e => e.id === ann.relatedEventId);

            return (
              <Card key={ann.id} className="border-none bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedAnnouncementDetails(ann)}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {ann.associatedPersonPhotoURL && (
                        <Avatar className="h-10 w-10 border-2 border-red-50 group-hover:scale-110 transition-transform">
                          <AvatarImage src={ann.associatedPersonPhotoURL} />
                          <AvatarFallback><User className="h-5 w-5 text-zinc-300" /></AvatarFallback>
                        </Avatar>
                      )}
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors">{ann.title}</h4>
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {ann.type && ann.type !== 'general' && (
                      <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0 bg-red-50 text-red-600">{ann.type}</Badge>
                    )}
                  </div>
                  
                  {ann.imageUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100">
                      <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  <div className="text-xs text-zinc-600 leading-relaxed">
                    <SafeMarkdown>{ann.content}</SafeMarkdown>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-50">
                    {ann.relatedPersonIds && ann.relatedPersonIds.length > 0 ? (
                      ann.relatedPersonIds.map(pid => {
                        const p = allMembers.find(m => m.uid === pid);
                        if (!p) return null;
                        return (
                          <button 
                            key={pid}
                            onClick={() => setViewingProfile(p)}
                            className="flex items-center gap-1.5 bg-red-50 text-red-600 py-1 px-2 rounded-lg text-[9px] font-bold hover:bg-red-100 transition-colors"
                          >
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={p.photoURL} />
                              <AvatarFallback className="text-[6px]">{p.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {p.displayName}
                          </button>
                        );
                      })
                    ) : person ? (
                      <button 
                        onClick={() => setViewingProfile(person)}
                        className="flex items-center gap-1.5 bg-red-50 text-red-600 py-1 px-2 rounded-lg text-[9px] font-bold hover:bg-red-100 transition-colors"
                      >
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={person.photoURL} />
                          <AvatarFallback className="text-[6px]">{person.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {person.displayName}
                      </button>
                    ) : null}
                    
                    {team && (
                      <button 
                        onClick={() => setSelectedTeamView(team)}
                        className="bg-zinc-100 text-zinc-600 py-1 px-2 rounded-lg text-[9px] font-bold hover:bg-zinc-200 transition-colors"
                      >
                        Equipa: {team.name}
                      </button>
                    )}
                    {ev && (
                      <button 
                         onClick={() => setSelectedEventDetails(ev)}
                         className="bg-blue-50 text-blue-600 py-1 px-2 rounded-lg text-[9px] font-bold hover:bg-blue-100 transition-colors"
                      >
                        Evento: {ev.title}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <p className="text-xs text-zinc-400 italic text-center py-4">Sem anúncios novos esta semana. Vê o histórico clicando no relógio.</p>
          )}
        </div>
      </section>
    );
  };

  const renderAnnouncementManager = () => (
    <Dialog open={isManagingAnnouncements} onOpenChange={setIsManagingAnnouncements}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gerir Anúncios</DialogTitle>
          <DialogDescription>Cria ou edita anúncios para a comunidade.</DialogDescription>
        </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Título</Label>
                <Input 
                  className="h-12 rounded-xl border-zinc-200 shadow-sm" 
                  placeholder="Título do anúncio" 
                  value={announcementForm.title} 
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Imagem do Anúncio</Label>
                <div className="flex gap-2">
                   <Input 
                     className="h-10 rounded-xl border-zinc-200 text-xs flex-1 shadow-sm" 
                     placeholder="URL da imagem..." 
                     value={announcementForm.imageUrl} 
                     onChange={(e) => setAnnouncementForm({ ...announcementForm, imageUrl: e.target.value })} 
                   />
                   <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10" 
                        onChange={handleAnnouncementImageUpload}
                      />
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-zinc-50">
                        <Camera className="h-4 w-4 text-zinc-500" />
                      </Button>
                   </div>
                </div>
                {announcementForm.imageUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-100 mt-2">
                    <img src={announcementForm.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                      onClick={() => setAnnouncementForm({...announcementForm, imageUrl: ''})}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tipo</Label>
                  <Select value={announcementForm.type} onValueChange={(v: any) => setAnnouncementForm({ ...announcementForm, type: v })}>
                    <SelectTrigger className="rounded-xl border-zinc-200 h-10 shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="team">Equipa</SelectItem>
                      <SelectItem value="board">Board</SelectItem>
                      <SelectItem value="social">Cargos Sociais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Equipa Relacionada</Label>
                  <Select value={announcementForm.relatedTeamId} onValueChange={(v: any) => setAnnouncementForm({ ...announcementForm, relatedTeamId: v === 'none' ? '' : v })}>
                    <SelectTrigger className="rounded-xl border-zinc-200 h-10 shadow-sm"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Evento Relacionado</Label>
                <Select value={announcementForm.relatedEventId} onValueChange={(v: any) => setAnnouncementForm({ ...announcementForm, relatedEventId: v === 'none' ? '' : v })}>
                  <SelectTrigger className="rounded-xl border-zinc-200 h-10 shadow-sm"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="none">Nenhum</SelectItem>
                    {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Membros Relacionados</Label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 bg-zinc-50 rounded-xl border border-zinc-100 shadow-inner">
                  {announcementForm.relatedPersonIds?.map(pid => {
                    const m = allMembers.find(member => member.uid === pid);
                    return (
                      <Badge key={pid} className="bg-white border border-zinc-200 text-zinc-600 font-bold flex items-center gap-1 shadow-sm">
                        {m?.displayName}
                        <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => setAnnouncementForm({...announcementForm, relatedPersonIds: announcementForm.relatedPersonIds.filter(id => id !== pid)})} />
                      </Badge>
                    );
                  })}
                  {(!announcementForm.relatedPersonIds || announcementForm.relatedPersonIds.length === 0) && (
                    <span className="text-[10px] text-zinc-400 italic">Nenhum membro selecionado</span>
                  )}
                </div>
                <Select value="none" onValueChange={(v) => {
                  if (v !== 'none' && !announcementForm.relatedPersonIds?.includes(v)) {
                    setAnnouncementForm({ ...announcementForm, relatedPersonIds: [...(announcementForm.relatedPersonIds || []), v] });
                  }
                }}>
                  <SelectTrigger className="rounded-xl border-zinc-200 h-10 shadow-sm"><SelectValue placeholder="Adicionar Membro" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="none">Adicionar...</SelectItem>
                    {allMembers.map(m => <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Membro em Destaque (Foto)</Label>
              <div className="flex gap-2">
                 <Input 
                   className="h-10 rounded-xl border-zinc-200 text-xs flex-1 shadow-sm" 
                   placeholder="URL da foto do membro..." 
                   value={announcementForm.associatedPersonPhotoURL} 
                   onChange={(e) => setAnnouncementForm({ ...announcementForm, associatedPersonPhotoURL: e.target.value })} 
                 />
                 <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10" 
                      onChange={handleAnnouncementPersonPhotoUpload}
                    />
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-zinc-50">
                      <User className="h-4 w-4 text-zinc-500" />
                    </Button>
                 </div>
              </div>
              {announcementForm.associatedPersonPhotoURL && (
                <div className="flex items-center gap-3 mt-2 p-2 bg-zinc-50 rounded-xl border border-zinc-100">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                     <AvatarImage src={announcementForm.associatedPersonPhotoURL} />
                     <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Foto carregada</span>
                  <button className="ml-auto p-1 text-zinc-400 hover:text-red-500 transition-colors" onClick={() => setAnnouncementForm({...announcementForm, associatedPersonPhotoURL: ''})}>
                     <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2 mt-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Conteúdo</Label>
              <div className="space-y-1">
                <MarkdownToolbar onInsert={(snippet) => setAnnouncementForm({...announcementForm, content: (announcementForm.content || '') + snippet})} />
                <Textarea 
                  className="min-h-[150px] rounded-xl border-zinc-200 shadow-sm" 
                  placeholder="Escreve aqui o anúncio... (Suporta Markdown)" 
                  value={announcementForm.content} 
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} 
                />
              </div>
            </div>
            <Button className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold shadow-lg shadow-red-100" onClick={handleAdminUpdateAnnouncement}>
              {selectedAnnouncement ? 'Atualizar' : 'Publicar'}
            </Button>
            
            <div className="pt-4 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Anúncios Atuais</Label>
              <div className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {announcements.map(ann => (
                  <div key={ann.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <span className="text-xs font-bold truncate flex-1">{ann.title}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => {
                        setSelectedAnnouncement(ann);
                        setAnnouncementForm({ 
                          title: ann.title, 
                          content: ann.content,
                          imageUrl: ann.imageUrl || '',
                          associatedPersonPhotoURL: ann.associatedPersonPhotoURL || '',
                          relatedPersonId: ann.relatedPersonId || '',
                          relatedPersonIds: ann.relatedPersonIds || [],
                          relatedTeamId: ann.relatedTeamId || '',
                          relatedEventId: ann.relatedEventId || '',
                          type: ann.type || 'general'
                        });
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => {
                        requestConfirmation(
                          'Eliminar Anúncio',
                          `Tens a certeza que queres eliminar o anúncio "${ann.title}"?`,
                          () => handleAdminDeleteAnnouncement(ann.id)
                        );
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );

  const renderGlossary = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-red-900 uppercase tracking-tight">Glossário BEST</h2>
          <p className="text-sm text-zinc-500 font-medium">Siglas e termos comuns na nossa organização.</p>
        </div>
        {user?.role === 'admin' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-zinc-200 font-bold gap-2"
            onClick={() => setIsManagingGlossary(true)}
          >
            <Plus className="h-4 w-4" /> Gerir
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {glossary.sort((a, b) => a.acronym.localeCompare(b.acronym)).map((term) => (
          <Card key={term.id} className="border-none bg-white shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-red-600 text-white border-none font-black px-2 py-0.5">{term.acronym}</Badge>
                <h4 className="font-bold text-zinc-900">{term.meaning}</h4>
              </div>
              {term.description && (
                <p className="text-xs text-zinc-500 leading-relaxed">{term.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isManagingGlossary} onOpenChange={setIsManagingGlossary}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gerir Glossário</DialogTitle>
            <DialogDescription>Adiciona ou edita termos do glossário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sigla</Label>
                <Input 
                  className="h-12 rounded-xl border-zinc-200" 
                  placeholder="Ex: LBG" 
                  value={glossaryForm.acronym} 
                  onChange={(e) => setGlossaryForm({ ...glossaryForm, acronym: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Significado</Label>
                <Input 
                  className="h-12 rounded-xl border-zinc-200" 
                  placeholder="Ex: Local BEST Group" 
                  value={glossaryForm.meaning} 
                  onChange={(e) => setGlossaryForm({ ...glossaryForm, meaning: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descrição (Opcional)</Label>
              <Textarea 
                className="min-h-[80px] rounded-xl border-zinc-200" 
                placeholder="Breve explicação..." 
                value={glossaryForm.description} 
                onChange={(e) => setGlossaryForm({ ...glossaryForm, description: e.target.value })} 
              />
            </div>
            <Button className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold" onClick={handleAdminUpdateGlossary}>
              {selectedGlossaryTerm ? 'Atualizar' : 'Adicionar'}
            </Button>

            <div className="pt-4 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Termos Atuais</Label>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {glossary.map(term => (
                  <div key={term.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <span className="text-xs font-bold truncate flex-1">{term.acronym} - {term.meaning}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => {
                        setSelectedGlossaryTerm(term);
                        setGlossaryForm({ acronym: term.acronym, meaning: term.meaning, description: term.description || '' });
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => handleAdminDeleteGlossary(term.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isAdmin={user?.role === 'admin' || user?.role === 'management'} 
      user={user}
      teams={teams}
      opportunities={opportunities}
      helpContent={renderHelp()}
      glossaryContent={renderGlossary()}
      notificationCenter={
        <NotificationCenter 
          notifications={notifications} 
          onMarkRead={handleMarkNotificationRead} 
        />
      }
      renderSidebarPage={(id, title, icon, desc) => (
        <SidebarPage 
          id={id} 
          title={title} 
          icon={icon} 
          description={desc} 
          isAdmin={user?.role === 'admin' || user?.role === 'management'} 
        />
      )}
    >
      {(user?.status as string) === 'pending' ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center px-6 py-20 bg-white rounded-[3rem] shadow-2xl shadow-red-50 border border-red-50 border-dashed m-4">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-red-50 flex items-center justify-center animate-pulse">
              <ShieldAlert className="h-16 w-16 text-red-600" />
            </div>
            <div className="absolute -top-2 -right-2 h-10 w-10 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-3 max-w-sm">
            <h2 className="text-3xl font-black text-red-900 uppercase tracking-tighter leading-none">Acesso Pendente</h2>
            <p className="text-base text-zinc-500 font-medium leading-relaxed">
              Olá <span className="text-red-600 font-black">{user.displayName.split(' ')[0]}</span>! O teu perfil está à espera de ser aprovado por um administrador.
            </p>
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 italic text-xs text-zinc-400">
              "Enquanto esperas, podes aproveitar para ler sobre a nossa história no site oficial."
            </div>
          </div>
          <Button 
            variant="outline" 
            className="rounded-2xl h-12 px-8 border-zinc-200 text-zinc-500 font-black uppercase tracking-widest hover:bg-zinc-50 transition-all" 
            onClick={handleLogout}
          >
            Sair da Conta
          </Button>
        </div>
      ) : renderContent()}
      
      <Dialog open={!!viewingProfile} onOpenChange={(open) => !open && setViewingProfile(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-y-auto border-none rounded-[2rem] max-h-[95vh] custom-scrollbar">
          {viewingProfile && renderPublicProfile(viewingProfile)}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingMemberActivity} onOpenChange={(open) => !open && setViewingMemberActivity(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden">
          {viewingMemberActivity && (
            <div className="space-y-0">
               <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 text-white">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-white/20">
                      <AvatarImage src={viewingMemberActivity.photoURL} />
                      <AvatarFallback>{viewingMemberActivity.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black uppercase tracking-tight">{viewingMemberActivity.displayName}</h3>
                      <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{viewingMemberActivity.membership} • {viewingMemberActivity.status}</p>
                    </div>
                  </div>
               </div>
               <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[60vh]">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l-2 border-red-600 pl-2">Atividade em Projetos</h4>
                    <div className="grid gap-3">
                      {tasks.filter(t => t.assignedMemberIds?.includes(viewingMemberActivity.uid)).map(task => (
                        <div key={task.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-zinc-900">{task.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0",
                                task.status === 'Completed' ? "text-green-600 border-green-200 bg-green-50" : "text-amber-600 border-amber-200 bg-amber-50"
                              )}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      {tasks.filter(t => t.assignedMemberIds?.includes(viewingMemberActivity.uid)).length === 0 && (
                        <div className="p-8 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 text-center">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase">Nenhuma tarefa atribuída</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l-2 border-orange-600 pl-2">Atividade Social</h4>
                    <div className="grid gap-3">
                      {socialBodies.filter(m => m.userId === viewingMemberActivity.uid).map(m => (
                        <div key={m.id} className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-zinc-900">{m.position}</p>
                              <p className="text-[10px] text-zinc-500 font-medium">{m.term}</p>
                           </div>
                           <Shield className="h-4 w-4 text-orange-400" />
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingCall} onOpenChange={(open) => !open && setViewingCall(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-[2.5rem] max-h-[90vh] overflow-y-auto">
          {viewingCall && (
            <div className="bg-white">
              <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 text-white">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-white/20 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                    Call / Oportunidade
                  </Badge>
                  {viewingCall.deadline && (
                    <Badge className="bg-red-500/30 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> DL: {viewingCall.deadline}
                    </Badge>
                  )}
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight leading-tight">{viewingCall.title}</h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  {viewingCall.teamId && (
                    <Badge className="bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase whitespace-nowrap">
                      Equipa: {teams.find(t => t.id === viewingCall.teamId)?.name}
                    </Badge>
                  )}
                  {viewingCall.eventId && (
                    <Badge className="bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase whitespace-nowrap">
                      Evento: {events.find(e => e.id === viewingCall.eventId)?.title}
                    </Badge>
                  )}
                  <Badge className="bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase whitespace-nowrap">
                    Dificuldade: {viewingCall.difficulty}
                  </Badge>
                  <Badge className="bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase whitespace-nowrap">
                    Tipo: {viewingCall.category === 'Local' ? 'Nacional' : 'Internacional'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="prose prose-zinc max-w-none">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Descrição</h4>
                  <p className="text-sm text-zinc-600 font-medium leading-relaxed">{viewingCall.description}</p>
                </div>

                {viewingCall.responsibilities && viewingCall.responsibilities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Responsabilidades</h4>
                    <div className="grid gap-2">
                       {viewingCall.responsibilities.map((res, i) => (
                         <div key={i} className="flex gap-3 text-sm text-zinc-600 font-medium p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                           <div className="h-5 w-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-[10px] font-black">{i+1}</div>
                           {res}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                  {viewingCall.skillsRequired && viewingCall.skillsRequired.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Skills Necessárias</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingCall.skillsRequired.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-zinc-100 text-zinc-600 border-none px-3 py-1 rounded-full text-[10px] font-bold">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewingCall.developedSkills && viewingCall.developedSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Skills a Desenvolver</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingCall.developedSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-orange-50 text-orange-600 border-none px-3 py-1 rounded-full text-[10px] font-bold">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {viewingCall.applicationLink && (
                  <Button 
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-red-200"
                    onClick={() => window.open(viewingCall.applicationLink!, '_blank')}
                  >
                    Efetuar Candidatura
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTeamView} onOpenChange={(open) => !open && setSelectedTeamView(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2.5rem]">
          {selectedTeamView && (
            <div className="relative group overflow-hidden">
               <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 text-white">
                  <h3 className="text-3xl font-black uppercase tracking-tight">{selectedTeamView.name}</h3>
                  <p className="text-sm font-medium opacity-80 mt-2">{selectedTeamView.mission}</p>
               </div>
               <div className="p-8 bg-white space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                     <div 
                       className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 cursor-pointer hover:bg-zinc-100/50 hover:border-zinc-200 transition-all flex items-center justify-between group" 
                       onClick={() => {
                         const coord = allMembers.find(m => m.uid === selectedTeamView.coordinatorId);
                         if (coord) setViewingProfile(coord);
                       }}
                     >
                       <div>
                         <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Coordenador</span>
                         <p className="text-sm font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                           {allMembers.find(m => m.uid === selectedTeamView.coordinatorId)?.displayName || 'A definir'}
                         </p>
                       </div>
                       <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                         <AvatarImage src={allMembers.find(m => m.uid === selectedTeamView.coordinatorId)?.photoURL} />
                         <AvatarFallback>{allMembers.find(m => m.uid === selectedTeamView.coordinatorId)?.displayName.charAt(0)}</AvatarFallback>
                       </Avatar>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-l-2 border-red-600 pl-2">Membros da Equipa</h4>
                     <div className="flex flex-wrap gap-3">
                        {allMembers.filter(m => m.teamId === selectedTeamView.id).map(m => (
                          <div key={m.uid} className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100 cursor-pointer hover:bg-white hover:shadow-md transition-all" onClick={() => setViewingProfile(m)}>
                             <Avatar className="h-6 w-6">
                               <AvatarImage src={m.photoURL} />
                               <AvatarFallback className="text-[8px]">{m.displayName.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <span className="text-[11px] font-bold text-zinc-700">{m.displayName.split(' ')[0]}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Calls / Oportunidades</h4>
                      <Badge variant="secondary" className="bg-red-50 text-red-600 border-none text-[8px] font-black">
                        {opportunities.filter(o => (o.teamId === selectedTeamView.id || (o.eventId && o.eventId === selectedTeamView.eventId)) && !isCallExpired(o.deadline)).length} Abertas
                      </Badge>
                    </div>
                    {opportunities.filter(o => (o.teamId === selectedTeamView.id || (o.eventId && o.eventId === selectedTeamView.eventId)) && !isCallExpired(o.deadline)).length > 0 ? (
                      <div className="space-y-2">
                        {opportunities.filter(o => (o.teamId === selectedTeamView.id || (o.eventId && o.eventId === selectedTeamView.eventId)) && !isCallExpired(o.deadline)).map(call => (
                          <div key={call.id} className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between group hover:bg-red-50 transition-colors cursor-pointer" onClick={() => setViewingCall(call)}>
                            <div>
                              <p className="text-[10px] font-black text-red-900 uppercase tracking-tight">{call.title}</p>
                              <p className="text-[8px] text-red-600 font-bold">DL: {call.deadline}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {call.applicationLink && (
                                <Button size="sm" variant="ghost" className="h-6 text-[8px] font-black uppercase text-red-600 hover:bg-white" onClick={(e) => { e.stopPropagation(); window.open(call.applicationLink!, '_blank'); }}>
                                  Candidatar
                                </Button>
                              )}
                              <Badge variant="outline" className="h-6 text-[7px] font-black uppercase text-zinc-400">Ver Detalhes</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center">
                        <p className="text-[8px] font-bold text-zinc-400 uppercase">Sem calls abertas</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEventDetails} onOpenChange={(open) => !open && setSelectedEventDetails(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2.5rem] max-h-[90vh] overflow-y-auto">
          {selectedEventDetails && (
            <div className="relative group overflow-hidden">
               {selectedEventDetails.imageUrl && (
                 <div className="aspect-video w-full relative">
                   <img src={selectedEventDetails.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                 </div>
               )}
               <div className={cn("p-8 text-white relative", !selectedEventDetails.imageUrl && "bg-gradient-to-br from-red-600 to-red-900")}>
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                      {selectedEventDetails.category}
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight">{selectedEventDetails.title}</h3>
                  <div className="flex items-center gap-4 mt-4 text-xs font-bold opacity-80">
                    <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(selectedEventDetails.startDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {selectedEventDetails.location}</div>
                  </div>
                  {selectedEventDetails.coordinatorId && selectedEventDetails.coordinatorId !== 'none' && (
                    <div className="mt-4 flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarImage src={allMembers.find(m => m.uid === selectedEventDetails.coordinatorId)?.photoURL} />
                        <AvatarFallback>{allMembers.find(m => m.uid === selectedEventDetails.coordinatorId)?.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-60">Coordenador do Evento</p>
                        <p className="text-sm font-bold">{allMembers.find(m => m.uid === selectedEventDetails.coordinatorId)?.displayName}</p>
                      </div>
                    </div>
                  )}
               </div>
               <div className="p-8 bg-white space-y-6">
                  <div className="prose prose-zinc max-w-none">
                     <p className="text-sm text-zinc-600 leading-relaxed font-medium">{selectedEventDetails.description}</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-100">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Equipas Associadas</h4>
                    <div className="flex flex-wrap gap-2">
                       {teams.filter(t => t.eventId === selectedEventDetails.id).length > 0 ? (
                         teams.filter(t => t.eventId === selectedEventDetails.id).map(t => (
                           <Badge key={t.id} variant="secondary" className="bg-zinc-100 text-zinc-600 border-none px-3 py-1 rounded-full text-[10px] font-bold">
                             {t.name}
                           </Badge>
                         ))
                       ) : (
                         <span className="text-[10px] text-zinc-400 font-medium">Nenhuma equipa associada</span>
                       )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l-2 border-red-600 pl-2">Oportunidades / Calls</h4>
                    <div className="space-y-4">
                      {opportunities.filter(o => o.eventId === selectedEventDetails.id).length > 0 ? (
                        opportunities.filter(o => o.eventId === selectedEventDetails.id).map(opp => (
                          <OpportunityCard key={opp.id} opp={opp} teams={teams} />
                        ))
                      ) : (
                        <div className="p-8 rounded-[2rem] bg-zinc-50 border-2 border-dashed border-zinc-100 text-center">
                          <p className="text-xs font-bold text-zinc-400 uppercase">Sem calls abertas</p>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Editar Perfil</DialogTitle>
            <DialogDescription>Atualize as suas informações pessoais.</DialogDescription>
          </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nome de Exibição</Label>
                <Input 
                  className="h-12 rounded-xl" 
                  value={editForm.displayName} 
                  onChange={(e) => setEditForm({...editForm, displayName: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email</Label>
                  <Input 
                    className="h-12 rounded-xl" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Telefone</Label>
                  <Input 
                    className="h-12 rounded-xl" 
                    value={editForm.phoneNumber} 
                    onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Link Private Area (Opcional)</Label>
                <Input 
                  className="h-12 rounded-xl" 
                  placeholder="https://..."
                  value={editForm.privateAreaLink} 
                  onChange={(e) => setEditForm({...editForm, privateAreaLink: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Curso</Label>
                  <Input 
                    className="h-12 rounded-xl" 
                    placeholder="Ex: MEIC"
                    value={editForm.course} 
                    onChange={(e) => setEditForm({...editForm, course: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Interesses</Label>
                  <Input 
                    className="h-12 rounded-xl" 
                    placeholder="Ex: Design, Tech, Management"
                    value={editForm.interests?.join(', ')} 
                    onChange={(e) => setEditForm({...editForm, interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Bio</Label>
                <Textarea 
                  className="rounded-xl min-h-[100px]" 
                  value={editForm.bio} 
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})} 
                />
              </div>
              <Button className="w-full h-12 bg-red-600 hover:bg-red-700 font-bold rounded-xl" onClick={handleUpdateProfile} disabled={loading}>
                {loading ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewingTask && !!selectedTask} onOpenChange={setIsViewingTask}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2.5rem]">
          {selectedTask && (
            <div className="space-y-0">
              <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <CheckCircle2 className="h-24 w-24" />
                </div>
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                      {selectedTask.associationType === 'team' ? teams.find(t => t.id === selectedTask.teamId)?.name : events.find(e => e.id === selectedTask.eventId)?.title}
                    </Badge>
                    <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-[10px] font-black">{selectedTask.difficulty}/5</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{selectedTask.title}</h2>
                    <div className="flex items-center gap-2 opacity-80">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{selectedTask.deadline || 'Sem deadline'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 bg-zinc-50 overflow-y-auto max-h-[400px]">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Descrição</h3>
                  <div className="text-sm text-zinc-600 leading-relaxed font-medium markdown-content">
                    <SafeMarkdown>{selectedTask.description}</SafeMarkdown>
                  </div>
                </div>

                {selectedTask.coordinatorId && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Responsável / Contacto</h3>
                    <div className="flex items-center justify-between p-4 bg-white rounded-[2rem] border border-zinc-100 shadow-sm group">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-zinc-100 shadow-sm">
                          <AvatarImage src={allMembers.find(m => m.uid === selectedTask.coordinatorId)?.photoURL} />
                          <AvatarFallback className="bg-red-50 text-red-600 font-black">
                            {allMembers.find(m => m.uid === selectedTask.coordinatorId)?.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                            {allMembers.find(m => m.uid === selectedTask.coordinatorId)?.displayName}
                          </p>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Coordenador</p>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full bg-zinc-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        onClick={() => {
                          const coord = allMembers.find(m => m.uid === selectedTask.coordinatorId);
                          if (coord) setViewingProfile(coord);
                        }}
                      >
                        <Mail className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button 
                      className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-100 transition-all hover:-translate-y-0.5"
                      onClick={() => handleApplyToTask(selectedTask)}
                    >
                      Candidatar-me à Tarefa
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isManagingEvents} onOpenChange={setIsManagingEvents}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gestão de Eventos</DialogTitle>
            <DialogDescription className="font-medium text-zinc-500">Cria ou edita eventos do LBG.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-2">
              {events.map(ev => (
                <Badge 
                  key={ev.id} 
                  variant={selectedEvent?.id === ev.id ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => {
                    setSelectedEvent(ev);
                    setIsCreatingEvent(false);
                    setEventForm({
                      title: ev.title,
                      description: ev.description,
                      startDate: ev.startDate || '',
                      endDate: ev.endDate || '',
                      time: ev.time,
                      location: ev.location,
                      type: ev.type,
                      imageUrl: ev.imageUrl || '',
                      isHistorical: ev.isHistorical || false,
                      coordinatorId: ev.coordinatorId || '',
                      academicYear: ev.academicYear || ''
                    });
                  }}
                >
                  {ev.title}
                </Badge>
              ))}
              <Badge 
                variant={!selectedEvent ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 bg-green-50 text-green-700 border-green-200"
                onClick={() => {
                  setSelectedEvent(null);
                  setIsCreatingEvent(true);
                  setEventForm({ 
                    title: '', 
                    description: '', 
                    startDate: '', 
                    endDate: '', 
                    time: '', 
                    location: '', 
                    type: 'Local', 
                    imageUrl: '', 
                    isHistorical: false, 
                    coordinatorId: '',
                    academicYear: ''
                  });
                }}
              >
                + Novo Evento
              </Badge>
            </div>
            
            {(selectedEvent || isCreatingEvent) && (
              <div className="space-y-4 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400">{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</h5>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold" onClick={() => {
                    setSelectedEvent(null);
                    setIsCreatingEvent(false);
                  }}>Cancelar</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ano Académico</Label>
                    <Select value={eventForm.academicYear || getAcademicYearFromDate(eventForm.startDate)} onValueChange={v => setEventForm({...eventForm, academicYear: v})}>
                      <SelectTrigger className="rounded-xl border-zinc-200">
                        <SelectValue placeholder="Selecionar Ano Académico" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {Array.from({length: 10}, (_, i) => {
                          const year = new Date().getFullYear() - 5 + i;
                          const label = `${year}/${String(year + 1).slice(-2)}`;
                          return <SelectItem key={label} value={label}>{label}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Título</Label>
                    <Input className="rounded-xl border-zinc-200 focus:ring-blue-500" placeholder="Título do Evento" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descrição</Label>
                    <div className="flex justify-between items-center bg-zinc-900 p-2 rounded-t-xl mb-0">
                      <MarkdownToolbar onInsert={(t) => setEventForm({ ...eventForm, description: eventForm.description + t })} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40 pr-4">Editor</span>
                    </div>
                    <Textarea className="rounded-t-none rounded-b-xl border-zinc-200 focus:ring-blue-500 min-h-[80px]" placeholder="Descrição do evento" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Início</Label>
                    <Input className="rounded-xl border-zinc-200 focus:ring-blue-500" type="date" value={eventForm.startDate} onChange={e => setEventForm({...eventForm, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Fim</Label>
                    <Input className="rounded-xl border-zinc-200 focus:ring-blue-500" type="date" value={eventForm.endDate} onChange={e => setEventForm({...eventForm, endDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Hora</Label>
                    <Input className="rounded-xl border-zinc-200 focus:ring-blue-500" placeholder="18:30" value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Local</Label>
                    <Input className="rounded-xl border-zinc-200 focus:ring-blue-500" placeholder="Auditório 1" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tipo e Estado</Label>
                    <div className="grid grid-cols-[1fr,auto] gap-2">
                      <Select value={eventForm.type} onValueChange={v => setEventForm({...eventForm, type: v as any})}>
                        <SelectTrigger className="rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="Local">Local</SelectItem>
                          <SelectItem value="International">Internacional</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                          <SelectItem value="Training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant={eventForm.isHistorical ? "secondary" : "outline"}
                        className={cn("h-10 px-4 rounded-xl font-bold text-[9px] uppercase", eventForm.isHistorical && "bg-amber-100 text-amber-700 hover:bg-amber-200")}
                        onClick={() => setEventForm({...eventForm, isHistorical: !eventForm.isHistorical})}
                      >
                        Arquivo Histórico
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Coordenador do Evento</Label>
                    <Select value={eventForm.coordinatorId} onValueChange={v => setEventForm({...eventForm, coordinatorId: v})}>
                      <SelectTrigger className="rounded-xl border-zinc-200">
                        <SelectValue placeholder="Escolher Coordenador" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="none">Nenhum</SelectItem>
                        {allMembers.sort((a,b) => a.displayName.localeCompare(b.displayName)).map(m => (
                          <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Imagem do Evento (URL ou Upload)</Label>
                    <div className="flex gap-2">
                       <Input 
                         className="h-10 rounded-xl border-zinc-200 text-xs flex-1" 
                         placeholder="URL da imagem..." 
                         value={eventForm.imageUrl} 
                         onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })} 
                       />
                       <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10" 
                            onChange={handleEventImageUpload}
                          />
                          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-zinc-50">
                            <Camera className="h-4 w-4 text-zinc-500" />
                          </Button>
                       </div>
                    </div>
                    {eventForm.imageUrl && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-100 mt-2">
                        <img src={eventForm.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                          onClick={() => setEventForm({...eventForm, imageUrl: ''})}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedEvent && (
                    <div className="col-span-2 space-y-2 pt-4 border-t border-zinc-100">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Equipas Associadas</Label>
                      <div className="flex flex-wrap gap-2">
                        {teams.filter(t => t.eventId === selectedEvent.id).length > 0 ? (
                          teams.filter(t => t.eventId === selectedEvent.id).map(t => (
                            <Badge key={t.id} variant="secondary" className="px-2 py-1 text-[10px] bg-zinc-100 text-zinc-600">
                              <Users className="h-3 w-3 mr-1" /> {t.name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-[10px] text-zinc-400">Nenhuma equipa associada.</p>
                        )}
                      </div>
                      <p className="text-[9px] text-zinc-400 mt-1">Para associar uma equipa, vai à Gestão de Equipas.</p>
                    </div>
                  )}
                </div>
                <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100" onClick={handleAdminUpdateEvent} disabled={loading}>
                  {loading ? 'A processar...' : (selectedEvent ? 'Atualizar Evento' : 'Criar Evento')}
                </Button>
                {selectedEvent && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-600 font-bold text-xs mt-2" 
                    onClick={() => {
                      requestConfirmation(
                        'Eliminar Evento',
                        `Tens a certeza que queres eliminar "${selectedEvent.title}"? Todas as associações serão removidas.`,
                        async () => {
                          await deleteDoc(doc(db, 'events', selectedEvent.id));
                          toast.success('Evento eliminado');
                          setIsManagingEvents(false);
                          setSelectedEvent(null);
                        }
                      );
                    }}
                  >
                    Eliminar Evento permanentemente
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isManagingSocialBodies} onOpenChange={setIsManagingSocialBodies}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gestão de Órgãos Sociais</DialogTitle>
            <DialogDescription className="font-medium text-zinc-500">Gere os membros da Direção, Mesa e Conselho Fiscal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100 gap-4">
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight">Membros do LBG</h4>
                <p className="text-[10px] text-zinc-500 font-medium">Responsáveis atuais e históricos.</p>
              </div>
              <Button size="sm" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold" onClick={() => {
                setSelectedSocialBodyMember(null);
                setIsCreatingSocialBody(true);
                setSocialBodyForm({
                  userId: '',
                  position: 'Board' as any,
                  role: '',
                  isCurrent: true,
                  year: new Date().getFullYear(),
                  term: '',
                  profileLink: '',
                  contactDetails: ''
                });
              }}>
                <Plus className="h-4 w-4 mr-1" /> Novo Membro
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {socialBodies.sort((a, b) => (b.year || 0) - (a.year || 0)).map(m => (
                <div key={m.id} className={cn(
                  "flex items-center justify-between p-3 border rounded-2xl transition-all hover:shadow-md",
                  selectedSocialBodyMember?.id === m.id ? "border-orange-200 bg-orange-50/30" : "bg-white border-zinc-100"
                )}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={m.photoURL || allMembers.find(mem => mem.uid === m.userId)?.photoURL} />
                      <AvatarFallback>{allMembers.find(mem => mem.uid === m.userId)?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{allMembers.find(mem => mem.uid === m.userId)?.displayName}</span>
                      <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest leading-none truncate">
                        {m.position} • {m.year}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge variant={m.isCurrent ? "default" : "secondary"} className="text-[8px] h-3 px-1">
                          {m.isCurrent ? 'Atual' : 'Histórico'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="rounded-xl hover:bg-white h-8 w-8 p-0" onClick={() => {
                      setSelectedSocialBodyMember(m);
                      setIsCreatingSocialBody(false);
                      setSocialBodyForm({ ...m } as any);
                    }}>
                      <Edit2 className="h-4 w-4 text-zinc-400" />
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl hover:bg-red-50 text-red-600 h-8 w-8 p-0" onClick={() => deleteDoc(doc(db, 'socialBodies', m.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {(selectedSocialBodyMember || isCreatingSocialBody) && (
              <div className="space-y-4 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase tracking-widest text-zinc-400">{selectedSocialBodyMember ? 'Editar Membro' : 'Novo Membro'}</h5>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold" onClick={() => {
                    setSelectedSocialBodyMember(null);
                    setIsCreatingSocialBody(false);
                  }}>Cancelar</Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Membro</Label>
                    <Select value={socialBodyForm.userId} onValueChange={v => setSocialBodyForm({...socialBodyForm, userId: v})}>
                      <SelectTrigger className="rounded-xl border-zinc-200 h-12 shadow-sm"><SelectValue placeholder="Escolher Membro" /></SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {allMembers.sort((a,b) => a.displayName.localeCompare(b.displayName)).map(m => (
                          <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Posição</Label>
                      <Select value={socialBodyForm.position} onValueChange={v => setSocialBodyForm({...socialBodyForm, position: v})}>
                        <SelectTrigger className="rounded-xl border-zinc-200 h-12 shadow-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="Board">Board</SelectItem>
                          <SelectItem value="Mesa da Assembleia Geral">Mesa da Assembleia Geral</SelectItem>
                          <SelectItem value="Conselho Fiscal">Conselho Fiscal</SelectItem>
                          <SelectItem value="Coordenadores">Coordenadores</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Cargo Específico</Label>
                      <Input className="rounded-xl border-zinc-200 h-12 shadow-sm" placeholder="Ex: Presidente, Tesoureiro..." value={socialBodyForm.role} onChange={e => setSocialBodyForm({...socialBodyForm, role: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ano Histórico (Principal)</Label>
                      <Input 
                        type="number"
                        className="rounded-xl border-zinc-200 h-12 shadow-sm" 
                        placeholder="Ex: 2023" 
                        value={socialBodyForm.year} 
                        onChange={e => setSocialBodyForm({...socialBodyForm, year: parseInt(e.target.value) || new Date().getFullYear()})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mandato / Época (Texto)</Label>
                      <Input className="rounded-xl border-zinc-200 h-12 shadow-sm" placeholder="Ex: 2023/2024" value={socialBodyForm.term} onChange={e => setSocialBodyForm({...socialBodyForm, term: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estado de Exibição</Label>
                    <div className="flex h-12 items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors shadow-sm"
                         onClick={() => setSocialBodyForm({...socialBodyForm, isCurrent: !socialBodyForm.isCurrent})}>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{socialBodyForm.isCurrent ? 'Mandato Atual' : 'Arquivo Histórico'}</span>
                      <div className={cn("h-5 w-5 rounded-full border-2 border-white shadow-md transition-all", socialBodyForm.isCurrent ? "bg-orange-600 ml-4" : "bg-zinc-300")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Link de Perfil (Opcional)</Label>
                    <Input className="rounded-xl border-zinc-200 h-12 shadow-sm" placeholder="LinkedIn, Instagram..." value={socialBodyForm.profileLink} onChange={e => setSocialBodyForm({...socialBodyForm, profileLink: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contacto Público (Opcional)</Label>
                    <Input className="rounded-xl border-zinc-200 h-12 shadow-sm" placeholder="Email institucional" value={socialBodyForm.contactDetails} onChange={e => setSocialBodyForm({...socialBodyForm, contactDetails: e.target.value})} />
                  </div>
                </div>
                <Button className="col-span-2 bg-red-600 hover:bg-red-700 h-12 rounded-xl text-white font-bold" onClick={() => handleAdminUpdateSocialBody(socialBodyForm)}>
                  {selectedSocialBodyMember ? 'Atualizar Membro' : 'Registar Membro'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {renderAnnouncementManager()}
      {renderConfirmationDialog()}
      <Toaster position="top-center" />
    </Layout>
  );
}
