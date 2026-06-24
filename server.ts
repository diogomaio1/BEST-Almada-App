import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import { GoogleGenAI } from "@google/genai";

// Print available process environment keys for diagnostics
console.log("[ENV DIAGNOSTIC] Available environment keys:", Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("URL") || k.includes("KEY") || k.includes("GEMINI")));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));

// Initialize Firebase (using client SDK on server for simplicity if Admin SDK creds aren't available)
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

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

  // Middleware to parse JSON request bodies
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Chatbot Assistant API endpoint
  app.post("/api/chatbot", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message field" });
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
