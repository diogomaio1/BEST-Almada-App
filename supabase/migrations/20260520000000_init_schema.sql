-- ====================================================================
-- SUPABASE / POSTGRESQL INITIAL DATABASE MIGRATION
-- Project: BEST Almada Hub
-- Description: Auto-generated from firebase-blueprint.json for Supabase integration.
-- File: /supabase/migrations/20260520000000_init_schema.sql
-- ====================================================================

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. CLEANUP (FOR RESET/IDEMPOTENCY)
-- ==========================================
DROP TABLE IF EXISTS "applications" CASCADE;
DROP TABLE IF EXISTS "social_bodies" CASCADE;
DROP TABLE IF EXISTS "announcements" CASCADE;
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "metas" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "families" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "gadgets" CASCADE;
DROP TABLE IF EXISTS "achievements" CASCADE;
DROP TABLE IF EXISTS "app_content" CASCADE;
DROP TABLE IF EXISTS "glossary" CASCADE;

-- ==========================================
-- 2. CREATE MASTER TABLES
-- ==========================================

-- 2.1 APP_CONTENT (Sidebar pages static content)
CREATE TABLE "app_content" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL
);

-- 2.2 GLOSSARY (BEST terminology and acronyms)
CREATE TABLE "glossary" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "acronym" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "description" TEXT
);

-- 2.3 GADGETS (Collectible virtual items for members)
CREATE TABLE "gadgets" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "rarity" TEXT CHECK ("rarity" IN ('Common', 'Rare', 'Epic', 'Legendary')),
    "category" TEXT CHECK ("category" IN ('Automatic', 'Manual', 'Seasonal', 'Monthly', 'Permanent')),
    "unlock_criteria" TEXT
);

-- 2.4 ACHIEVEMENTS (Milestones for members)
CREATE TABLE "achievements" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT CHECK ("category" IN ('Lifetime', 'Monthly', 'Team', 'Mentoring', 'Participation', 'Consistency', 'Leadership', 'International'))
);

-- 2.5 FAMILIES (Mentoring families)
CREATE TABLE "families" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "goals" TEXT[] DEFAULT '{}',
    "mentors" TEXT[] DEFAULT '{}',
    "mentees" TEXT[] DEFAULT '{}',
    "score" NUMERIC DEFAULT 0,
    "achievements" TEXT[] DEFAULT '{}',
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 2.6 EVENTS (LBG and International events)
CREATE TABLE "events" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "time" TEXT,
    "location" TEXT,
    "type" TEXT CHECK ("type" IN ('Local', 'International', 'Social', 'Training')),
    "image_url" TEXT
);

-- 2.7 TEAMS (BEST Internal Teams)
CREATE TABLE "teams" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "mission" TEXT,
    "department" TEXT,
    "contact_email" TEXT,
    "member_count" INT DEFAULT 0,
    "event_id" TEXT REFERENCES "events"("id") ON DELETE SET NULL
);

-- 2.8 USERS (BEST Member profiles)
-- Connects optionally with auth.users uuid if using Supabase Auth,
-- but uses text key to accommodate migrated Firebase uids or external systems.
CREATE TABLE "users" (
    "uid" TEXT PRIMARY KEY,
    "display_name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "phone_number" TEXT,
    "photo_url" TEXT,
    "role" TEXT DEFAULT 'member' CHECK ("role" IN ('admin', 'member', 'management')),
    "status" TEXT DEFAULT 'pending' CHECK ("status" IN ('pending', 'approved', 'rejected')),
    "team_id" TEXT REFERENCES "teams"("id") ON DELETE SET NULL,
    "family_id" TEXT REFERENCES "families"("id") ON DELETE SET NULL,
    "position" TEXT,
    "membership" TEXT,
    "bio" TEXT,
    "badges" TEXT[] DEFAULT '{}',
    "gadgets" TEXT[] DEFAULT '{}',
    "achievements" TEXT[] DEFAULT '{}',
    "skills" TEXT[] DEFAULT '{}',
    "previous_roles" TEXT[] DEFAULT '{}',
    "completed_tasks" INT DEFAULT 0,
    "activity_level" TEXT,
    "contribution_history" JSONB DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 2.9 ROLES (Internal positions within teams or events)
CREATE TABLE "roles" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "team_id" TEXT REFERENCES "teams"("id") ON DELETE CASCADE,
    "event_id" TEXT REFERENCES "events"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "responsibilities" TEXT[] DEFAULT '{}',
    "skills_required" TEXT[] DEFAULT '{}',
    "commitment" TEXT,
    "difficulty" TEXT CHECK ("difficulty" IN ('Easy', 'Medium', 'Hard')),
    "is_open" BOOLEAN DEFAULT true
);

-- 2.10 METAS (Organizational goals / targets)
CREATE TABLE "metas" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "team_id" TEXT REFERENCES "teams"("id") ON DELETE SET NULL,
    "event_id" TEXT REFERENCES "events"("id") ON DELETE SET NULL,
    "creator_id" TEXT REFERENCES "users"("uid") ON DELETE RESTRICT,
    "creator_role" TEXT,
    "deadline" TIMESTAMPTZ,
    "progress" NUMERIC DEFAULT 0,
    "status" TEXT DEFAULT 'Pending' CHECK ("status" IN ('Pending', 'In Progress', 'Completed')),
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 2.11 TASKS (Internal tasks for members)
CREATE TABLE "tasks" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMPTZ,
    "assigned_member_ids" TEXT[] DEFAULT '{}',
    "team_id" TEXT REFERENCES "teams"("id") ON DELETE SET NULL,
    "event_id" TEXT REFERENCES "events"("id") ON DELETE SET NULL,
    "meta_id" TEXT REFERENCES "metas"("id") ON DELETE SET NULL,
    "status" TEXT DEFAULT 'Pending' CHECK ("status" IN ('Pending', 'In Progress', 'Completed'))
);

-- 2.12 ANNOUNCEMENTS (Internal news and updates)
CREATE TABLE "announcements" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT REFERENCES "users"("uid") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 2.13 APPLICATIONS (Member recruitment applications)
CREATE TABLE "applications" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT REFERENCES "users"("uid") ON DELETE CASCADE,
    "role_id" TEXT REFERENCES "roles"("id") ON DELETE CASCADE,
    "status" TEXT DEFAULT 'pending' CHECK ("status" IN ('pending', 'accepted', 'rejected')),
    "motivation" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 2.14 SOCIAL_BODIES (Institutional organs e.g. Board, Assembleia, CF)
CREATE TABLE "social_bodies" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT REFERENCES "users"("uid") ON DELETE CASCADE,
    "role" TEXT NOT NULL,
    "position" TEXT CHECK ("position" IN ('Board', 'Mesa da Assembleia Geral', 'Conselho Fiscal')),
    "photo_url" TEXT,
    "profile_link" TEXT,
    "contact_details" TEXT
);


-- ==========================================
-- 3. SPEED OPTIMIZATION INDEXES
-- ==========================================
CREATE INDEX idx_users_email ON "users"("email");
CREATE INDEX idx_users_team ON "users"("team_id");
CREATE INDEX idx_tasks_status ON "tasks"("status");
CREATE INDEX idx_tasks_deadline ON "tasks"("deadline");
CREATE INDEX idx_announcements_created_at ON "announcements"("created_at" DESC);
CREATE INDEX idx_applications_user ON "applications"("user_id");
CREATE INDEX idx_applications_role ON "applications"("role_id");
CREATE INDEX idx_roles_team ON "roles"("team_id");


-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security (RLS) on all critical tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "families" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "metas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_bodies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gadgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_content" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "glossary" ENABLE ROW LEVEL SECURITY;

-- 4.1 USERS Policies
-- Public/Authenticated reads: Anyone can see profiles. Update: User can edit their own. All write: Admin/Management.
CREATE POLICY "Allow public read users" ON "users" 
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" ON "users" 
    FOR UPDATE USING (auth.uid()::text = "uid" OR "uid" = 'anonymous_id');

CREATE POLICY "Allow admin all access on users" ON "users" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "users" u 
            WHERE (u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management'))
        )
    );

-- 4.2 TEAMS Policies
CREATE POLICY "Allow public read teams" ON "teams" 
    FOR SELECT USING (true);

CREATE POLICY "Allow modification for admin on teams" ON "teams" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "users" u 
            WHERE (u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management'))
        )
    );

-- 4.3 FAMILIES Policies
CREATE POLICY "Allow public read families" ON "families" 
    FOR SELECT USING (true);

CREATE POLICY "Allow modification for admin on families" ON "families" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "users" u 
            WHERE (u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management'))
        )
    );

-- 4.4 EVENTS Policies
CREATE POLICY "Allow public read events" ON "events" 
    FOR SELECT USING (true);

CREATE POLICY "Allow modification for admin on events" ON "events" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "users" u 
            WHERE (u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management'))
        )
    );

-- 4.5 ROLES Policies
CREATE POLICY "Allow public read roles" ON "roles" 
    FOR SELECT USING (true);

CREATE POLICY "Allow modification for admin on roles" ON "roles" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "users" u 
            WHERE (u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management'))
        )
    );

-- 4.6 TASKS Policies
CREATE POLICY "Allow public read tasks" ON "tasks" 
    FOR SELECT USING (true);

-- Members can update task status (Pending <-> In Progress <-> Completed)
CREATE POLICY "Allow authenticated users to update tasks" ON "tasks" 
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow modification for admin on tasks" ON "tasks" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "users" u 
            WHERE (u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management'))
        )
    );

-- 4.7 ANNOUNCEMENTS Policies
CREATE POLICY "Allow public read announcements" ON "announcements" 
    FOR SELECT USING (true);

CREATE POLICY "Allow modification for admin on announcements" ON "announcements" 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "users" u 
            WHERE (u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management'))
        )
    );

-- 4.8 APPLICATIONS Policies
-- Users can see their own applications, Admins see all
CREATE POLICY "Allow users to read own applications" ON "applications" 
    FOR SELECT USING (
        auth.uid()::text = "user_id" OR 
        EXISTS (
            SELECT 1 FROM "users" u 
            WHERE (u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management'))
        )
    );

CREATE POLICY "Allow users to create applications" ON "applications" 
    FOR INSERT WITH CHECK (auth.uid()::text = "user_id");

-- 4.9 METAS, GADGETS, ACHIEVEMENTS, APP_CONTENT, GLOSSARY Policies
CREATE POLICY "Allow public read general metadata" ON "metas" FOR SELECT USING (true);
CREATE POLICY "Allow public read gadgets" ON "gadgets" FOR SELECT USING (true);
CREATE POLICY "Allow public read achievements" ON "achievements" FOR SELECT USING (true);
CREATE POLICY "Allow public read app_content" ON "app_content" FOR SELECT USING (true);
CREATE POLICY "Allow public read glossary" ON "glossary" FOR SELECT USING (true);
CREATE POLICY "Allow public read social_bodies" ON "social_bodies" FOR SELECT USING (true);

CREATE POLICY "Admin write access schemas" ON "metas" FOR ALL USING (EXISTS (SELECT 1 FROM "users" u WHERE u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management')));
CREATE POLICY "Admin write gadgets" ON "gadgets" FOR ALL USING (EXISTS (SELECT 1 FROM "users" u WHERE u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management')));
CREATE POLICY "Admin write achievements" ON "achievements" FOR ALL USING (EXISTS (SELECT 1 FROM "users" u WHERE u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management')));
CREATE POLICY "Admin write app_content" ON "app_content" FOR ALL USING (EXISTS (SELECT 1 FROM "users" u WHERE u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management')));
CREATE POLICY "Admin write glossary" ON "glossary" FOR ALL USING (EXISTS (SELECT 1 FROM "users" u WHERE u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management')));
CREATE POLICY "Admin write social_bodies" ON "social_bodies" FOR ALL USING (EXISTS (SELECT 1 FROM "users" u WHERE u."uid" = auth.uid()::text AND u."role" IN ('admin', 'management')));

-- ====================================================================
-- End of Migration Script
-- ====================================================================
