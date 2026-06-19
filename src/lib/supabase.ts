/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Strip any literal surrounding quotes if present in env strings
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
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing or invalid. ' +
    'Please configure them in your environment settings.'
  );
}

// We initialize the client. In case keys are missing, we still create it with placeholders to prevent crashes,
// but warn the developer.
let currentClient = createClient(finalUrl, finalKey);

// We export a dynamic Proxy to route all attribute accesses directly to the currently active instance.
// This bypasses any live-binding or reference caching issues caused by bundling or compilation formats.
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    return Reflect.get(currentClient, prop);
  }
});

let activeUrl = finalUrl;
let activeHasKey = !!supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key';

console.log("[Supabase Init] URL configured:", finalUrl, "Has Key:", activeHasKey);

export const getSupabaseConfigInfo = () => {
  return {
    url: activeUrl,
    hasKey: activeHasKey,
    isPlaceholder: activeUrl.includes('your-supabase-project') || activeUrl === '',
    rawUrl: activeUrl
  };
};

export const initializeDynamicSupabase = async () => {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      let url = (data.supabaseUrl || '').trim();
      let key = (data.supabaseAnonKey || '').trim();
      
      url = url.replace(/^['"]|['"]$/g, '').trim();
      key = key.replace(/^['"]|['"]$/g, '').trim();

      const isValid = url.startsWith('http://') || url.startsWith('https://');

      if (isValid && key) {
        activeUrl = url;
        activeHasKey = true;
        currentClient = createClient(url, key);
        console.log("[Supabase Dynamic Init] Successfully loaded server-side config!", url);
        return true;
      }
    }
  } catch (err) {
    console.error("[Supabase Dynamic Init] Error fetching server-side credentials:", err);
  }
  return false;
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
