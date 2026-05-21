import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';

// Print available process environment keys for diagnostics
console.log("[ENV DIAGNOSTIC] Available environment keys:", Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("URL") || k.includes("KEY")));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));

// Initialize Firebase (using client SDK on server for simplicity if Admin SDK creds aren't available)
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
    });
  });

  // Automated Notification Job (Simple implementation)
  const runReminderCheck = async () => {
    console.log("[CRON] Checking for event reminders...");
    try {
      const now = new Date();
      const eventsSnap = await getDocs(collection(db, 'events'));
      
      for (const eventDoc of eventsSnap.docs) {
        const event = { id: eventDoc.id, ...eventDoc.data() } as any;
        if (event.isHistorical) continue;
        
        const eventDate = new Date(event.startDate);
        const diffDays = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Reminder logic
        const remindersToCreate = [];
        if (diffDays === 7) remindersToCreate.push({ type: '7day', label: '1 semana' });
        if (diffDays === 1) remindersToCreate.push({ type: '1day', label: '1 dia' });
        if (diffDays === 0 && now.getDate() === eventDate.getDate()) remindersToCreate.push({ type: 'today', label: 'hoje' });

        for (const rem of remindersToCreate) {
          const reminderId = `reminder_${event.id}_${rem.type}`;
          // Check if already sent
          const existingSnap = await getDocs(query(collection(db, 'notifications'), where('resourceId', '==', reminderId)));
          
          if (existingSnap.empty) {
            await addDoc(collection(db, 'notifications'), {
              title: `Lembrete: ${event.title}`,
              message: `O evento "${event.title}" começa em ${rem.label}!`,
              type: 'reminder',
              resourceId: reminderId,
              createdAt: serverTimestamp(),
              isRead: false,
              link: `/events/${event.id}`
            });
            console.log(`[CRON] Created ${rem.type} reminder for event: ${event.title}`);
          }
        }
      }
    } catch (error) {
      console.error("[CRON] Error in reminder check:", error);
    }
  };

  // Run every 6 hours (or similar)
  setInterval(runReminderCheck, 6 * 60 * 60 * 1000);
  // Also run once on startup
  runReminderCheck();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
