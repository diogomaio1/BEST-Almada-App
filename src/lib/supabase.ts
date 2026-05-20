/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing. ' +
    'Please configure them in your environment settings.'
  );
}

// We initialize the client. In case keys are missing, we still create it with placeholders to prevent crashes,
// but warn the developer.
export const supabase = createClient(
  supabaseUrl || 'https://your-supabase-project.supabase.co',
  supabaseAnonKey || 'your-supabase-anon-key'
);

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
