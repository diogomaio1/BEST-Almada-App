import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

// Print available process environment keys for diagnostics
console.log("[ENV DIAGNOSTIC] Available environment keys:", Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("URL") || k.includes("KEY") || k.includes("GEMINI")));

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8"));

// Initialize Firebase Admin (bypasses security rules securely on the server side)
const adminApp = admin.initializeApp({
  projectId: firebaseConfig.projectId,
});
const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);

// Lazy-initialized Gemini Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[WARN] GEMINI_API_KEY environment variable is missing. Chatbot will run in fallback rule-based mode.");
      return null;
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy to handle X-Forwarded-For headers securely behind Cloud Run / reverse proxies
  app.set('trust proxy', 1);

  // 1. HTTP Security Headers (Helmet) - configured specifically to be safe, secure, and compatible with AI Studio's iframe preview
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Required for React/Vite in-page hydration/execution
            "'unsafe-eval'",   // Required for Vite development bundling/HMR
            "https://apis.google.com",
            "https://*.googleapis.com"
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // Required for Tailwind CSS / styling libraries
            "https://fonts.googleapis.com"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://picsum.photos",
            "https://*.picsum.photos",
            "https://lh3.googleusercontent.com", // Google profile images
            "https://images.unsplash.com"
          ],
          connectSrc: [
            "'self'",
            "https://*.supabase.co",
            "https://*.supabase.in",
            "https://*.googleapis.com",
            "https://*.firebaseio.com",
            "wss://*.firebaseio.com",
            "https://identitytoolkit.googleapis.com",
            "https://securetoken.googleapis.com"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com"
          ],
          frameAncestors: ["*"], // MANDATORY: allows embedding inside the AI Studio iframe/preview safely
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      frameguard: false, // MANDATORY: disables X-Frame-Options to prevent blocking the AI Studio iframe
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  // Disable powered-by header for extra security
  app.disable("x-powered-by");

  // 2. API Rate Limiting - protect endpoints from abuse, spam, or denial of service
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Muitos pedidos a partir deste IP. Por favor tente novamente após 15 minutos."
    }
  });

  // Apply rate limiter to all API endpoints
  app.use("/api/", apiLimiter);

  // Middleware to parse JSON request bodies
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Generate Firebase Custom Token for authenticated Supabase user ID
  app.post("/api/firebase-token", async (req, res) => {
    const { userId } = req.body;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "O parâmetro 'userId' é obrigatório." });
    }
    try {
      // Generate a custom token with the same user ID so their UID matches exactly
      const customToken = await admin.auth().createCustomToken(userId);
      res.json({ token: customToken });
    } catch (err: any) {
      console.log("[INFO] Custom token generation not available in this environment. Falling back to unauthenticated connection:", err?.message || err);
      res.json({ token: null, error: "not_supported" });
    }
  });

  // Chatbot Assistant API endpoint
  app.post("/api/chatbot", async (req, res) => {
    const { message, history } = req.body;
    
    // 3. Robust input validation and sanitization (payload-size protection)
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "O campo 'message' é obrigatório e deve ser uma string de texto." });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: "A mensagem é demasiado longa. Limite de 2000 caracteres." });
    }

    const ai = getGenAI();
    if (!ai) {
      // Elegant rule-based fallback if Gemini API key is missing
      let fallbackReply = "Olá! Atualmente o assistente inteligente está a funcionar em modo offline. ";
      const msg = message.toLowerCase();
      if (msg.includes("lbg") || msg.includes("almada") || msg.includes("fct")) {
        fallbackReply += "O LBG Almada (Local BEST Group Almada) é o grupo local do BEST sediado na FCT NOVA desde 2011! Promovemos o desenvolvimento de soft skills, eventos científicos, cursos internacionais de excelência e criamos pontes entre estudantes, universidades e empresas. 🔴✨";
      } else if (msg.includes("membro") || msg.includes("entrar") || msg.includes("aderir") || msg.includes("recruta")) {
        fallbackReply += "Podes fazer parte do LBG Almada participando no nosso recrutamento anual! Temos vários graus de envolvimento: Bebé, Observador, Membro Efetivo e Alumnus. Podes colaborar em departamentos como FR (Fundraising), HR (Human Resources), PR (Public Relations), IT ou Design. Fala com a Board para saber mais! 🤝🚀";
      } else if (msg.includes("curso") || msg.includes("course") || msg.includes("internacional") || msg.includes("viagem") || msg.includes("europa")) {
        fallbackReply += "Os BEST Courses são cursos académicos incríveis de 1 a 2 semanas em mais de 90 universidades europeias! Para os membros do LBG Almada (ou alunos da FCT NOVA), o custo é baixíssimo (ou quase gratuito) e inclui alojamento, 3 refeições por dia e todas as atividades sociais e académicas! 🌍✨";
      } else if (msg.includes("departamento") || msg.includes("fr") || msg.includes("hr") || msg.includes("pr") || msg.includes("it") || msg.includes("design")) {
        fallbackReply += "Temos 5 departamentos principais: FR (consegue fundos e parcerias), HR (recruta, forma e motiva membros), PR (faz as publicações e divulgação), IT (desenvolve este Hub e ferramentas digitais) e Design (desenha posts, t-shirts e branding)! Todos cooperam para fazer as coisas acontecerem. 🔴";
      } else {
        fallbackReply += "O BEST (Board of European Students of Technology) ajuda os estudantes de tecnologia a desenvolverem-se através de Educação Complementar, Apoio à Carreira e Envolvimento Educacional! Coloca a tua chave API de Gemini nas definições para me dares inteligência total e podermos conversar livremente! 🔴✨";
      }
      return res.json({ text: fallbackReply });
    }

    try {
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }));

      const systemInstruction = `És o BESTie, o assistente virtual inteligente e carismático do BEST Almada (Board of European Students of Technology). O teu objetivo é tirar dúvidas sobre o BEST e o LBG Almada de forma entusiástica, simpática, profissional e em português de Portugal.

Eis o contexto fundamental sobre o BEST Almada para responderes a qualquer pergunta:
- O que é o BEST: Uma organização europeia de estudantes de tecnologia, sem fins lucrativos, apolítica e não governamental. Presente em mais de 90 universidades de 30 países.
- Missão: Desenvolvimento dos estudantes de tecnologia através de 3 pilares: Educação Complementar, Apoio à Carreira e Envolvimento Educacional.
- LBG Almada: Local BEST Group sediado na FCT NOVA (Almada, Portugal). Fundado para criar oportunidades para os estudantes locais.
- Estrutura de Órgãos Sociais (Board atual):
  - Presidente (President)
  - Tesoureiro (Treasurer)
  - Secretário (Secretary)
  - Vice-Presidente para Recursos Humanos (VPHR)
  - Vice-Presidente para Relações Públicas (VPPR)
  - Vice-Presidente para Captação de Recursos (VPFR)
  - Vice-Presidente para Serviços de Informação (VPIT)
- Tipos de Memberships (Níveis de envolvimento):
  - Bebé/Baby: Novo membro acabado de entrar, a aprender o básico e a integrar-se.
  - Observador/Observer: Membro em fase de observação que quer tornar-se membro efetivo.
  - Membro Efetivo/Full Member: Membro ativo com direito de voto nas Assembleias Gerais, elegível para cargos locais e internacionais.
  - Alumnus: Antigo membro que já terminou o curso ou o percurso ativo no LBG mas continua a apoiar.
- Departamentos Locais:
  - FR (Fundraising): Contacto com empresas, patrocinadores e captação de recursos financeiros.
  - HR (Human Resources): Motivação dos membros, recrutamento, team building e formação interna.
  - PR (Public Relations): Imagem do LBG, redes sociais, marketing e promoção de eventos.
  - IT (Information Technology): Gestão de plataformas web, servidores e ferramentas digitais.
  - Design: Identidade visual, cartazes, branding e material gráfico.
- Oportunidades Internacionais:
  - Courses: Cursos sazonais académicos e tecnológicos por toda a Europa (outono, inverno, primavera, verão).
  - Events on Education (EoE): Discussões sobre o ensino superior na Europa.
  - Trainings: Eventos de desenvolvimento de soft/hard skills.
  - Exchanges: Intercâmbios culturais entre LBG's.

Instruções de Resposta:
- Responde sempre de forma acolhedora, com energia positiva e emojis adequados (ex: 🔴, ✨, 🚀).
- Mantém as respostas focadas, claras, em parágrafos bem estruturados ou pontos simples.
- Incentiva sempre os membros a participarem nas reuniões, assembleias e a falarem com a Board se tiverem mais dúvidas.
- Escreve estritamente em português de Portugal.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("[ERROR] Chatbot backend error:", error);
      res.status(500).json({ error: error.message || "Erro interno do assistente" });
    }
  });

  app.get("/api/config", (req, res) => {
    const sUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const sKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    
    const mask = (str: string) => {
      if (!str) return "empty";
      if (str.length <= 8) return "***";
      return `${str.substring(0, 4)}...${str.substring(str.length - 4)}`;
    };

    res.json({
      supabaseUrl: sUrl,
      supabaseAnonKey: sKey,
      diagnostics: {
        hasUrl: !!sUrl,
        hasKey: !!sKey,
        urlLength: sUrl.length,
        keyLength: sKey.length,
        maskedUrl: mask(sUrl),
        maskedKey: mask(sKey),
        allKeys: Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("URL") || k.includes("KEY"))
      }
    });
  });

  // Automated Notification Job (Simple implementation)
  const runReminderCheck = async () => {
    console.log("[CRON] Checking for event reminders...");
    try {
      const now = new Date();
      const eventsSnap = await db.collection("events").get();
      
      for (const eventDoc of eventsSnap.docs) {
        const event = { id: eventDoc.id, ...eventDoc.data() } as any;
        if (event.isHistorical) continue;
        
        const eventDate = new Date(event.startDate);
        const diffDays = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Reminder logic
        const remindersToCreate = [];
        if (diffDays === 7) remindersToCreate.push({ type: "7day", label: "1 semana" });
        if (diffDays === 1) remindersToCreate.push({ type: "1day", label: "1 dia" });
        if (diffDays === 0 && now.getDate() === eventDate.getDate()) remindersToCreate.push({ type: "today", label: "hoje" });

        for (const rem of remindersToCreate) {
          const reminderId = `reminder_${event.id}_${rem.type}`;
          // Check if already sent
          const existingSnap = await db.collection("notifications").where("resourceId", "==", reminderId).get();
          
          if (existingSnap.empty) {
            await db.collection("notifications").add({
              title: `Lembrete: ${event.title}`,
              message: `O evento "${event.title}" começa em ${rem.label}!`,
              type: "reminder",
              resourceId: reminderId,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
