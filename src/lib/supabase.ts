/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Colocamos os teus dados reais diretamente aqui para cortar intermediários
const finalUrl = "https://efcxoqrjspnkyeqtdwiz.supabase.co";
const finalKey = "sb_publishable_AhzhpgsAqhpr6hd9fv0rjg_NsUoMwxf";

// Inicializa o cliente diretamente com as tuas chaves prontas
let currentClient = createClient(finalUrl, finalKey);

// Mantemos o Proxy ativo para o resto da aplicação não quebrar
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    return Reflect.get(currentClient, prop);
  }
});

let activeUrl = finalUrl;
let activeHasKey = !!finalKey && (finalKey as string) !== 'your-supabase-anon-key';

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

      const isPlaceholder = url.includes('your-supabase-project') || key === 'your-supabase-anon-key' || !key || !url;
      const isValid = (url.startsWith('http://') || url.startsWith('https://')) && !isPlaceholder;

      if (isValid && key) {
        activeUrl = url;
        activeHasKey = true;
        currentClient = createClient(url, key);
        console.log("[Supabase Dynamic Init] Successfully loaded server-side config!", url);
        return true;
      } else {
        console.log("[Supabase Dynamic Init] Ignored placeholder or empty values from server config. Keeping default instance.");
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
