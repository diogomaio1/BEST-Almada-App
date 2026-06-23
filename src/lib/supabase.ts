/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// O Vite vai ler estas variáveis diretamente do ambiente do AI Studio / Vercel
let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Remove aspas literais se existirem por acidente
supabaseUrl = supabaseUrl.replace(/^['"]|['"]$/g, '').trim();
supabaseAnonKey = supabaseAnonKey.replace(/^['"]|['"]$/g, '').trim();

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://your-supabase-project.supabase.co';
const finalKey = supabaseAnonKey || 'your-supabase-anon-key';

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn('Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing or invalid.');
}

let currentClient = createClient(finalUrl, finalKey);

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    return Reflect.get(currentClient, prop);
  }
});

let activeUrl = finalUrl;
let activeHasKey = !!supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key';

export const getSupabaseConfigInfo = () => {
  return {
    url: activeUrl,
    hasKey: activeHasKey,
    isPlaceholder: activeUrl.includes('your-supabase-project') || activeUrl === '',
    rawUrl: activeUrl
  };
};

export const initializeDynamicSupabase = async () => {
  return true;
};

/**
 * Types helper matching our Supabase schema
 */
export interface SupabaseSchema {
  users: {
    uid: string;
    display_name: string;
    email: string;
    phone_number?: string;
    photo_url?: string;
    role: 'admin' | 'member' | 'management';
    status: 'pending' | 'approved' | 'rejected';
    team_id?: string;
    family_id?: string;
    position?: string;
    membership?: string;
    bio?: string;
    badges: string[];
    gadgets: string[];
    achievements: string[];
    skills: string[];
    previous_roles: string[];
    completed_tasks: number;
    activity_level?: string;
    contribution_history: Array<{ action: string; date: string }>;
    created_at: string;
  };
  teams: {
    id: string;
    name: string;
    mission?: string;
    department?: string;
    contact_email?: string;
    member_count: number;
    event_id?: string;
  };
  tasks: {
    id: string;
    title: string;
    description?: string;
    deadline?: string;
    assigned_member_ids: string[];
    team_id?: string;
    event_id?: string;
    meta_id?: string;
    status: 'Pending' | 'In Progress' | 'Completed';
  };
  announcements: {
    id: string;
    title: string;
    content: string;
    author_id?: string;
    created_at: string;
  };
}
