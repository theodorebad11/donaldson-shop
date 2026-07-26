import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client server-side
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", shop: "DONALDSON SHOP" });
  });

  // AI Chatbot endpoint for DONALDSON SHOP sports assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, userProfile, productsCount } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Le message est requis." });
      }

      if (!ai) {
        // Smart fallback response if API key is missing or not configured
        return res.json({
          reply: `Bonjour ${userProfile?.firstName || 'cher client'} ! Bienvenue chez DONALDSON SHOP ⚽🏋️‍♂️. Je suis votre assistant sportif virtuel. Nous proposons des articles de sport professionnels haut de gamme en FCFA. Pour connaître les frais de livraison de votre quartier ou ville, contactez-nous directement sur WhatsApp au +228 90 79 54 16, 97 52 85 47 ou 98 14 09 53 !`
        });
      }

      const systemInstruction = `
Vous êtes l'Assistant IA Officiel de DONALDSON SHOP, une boutique e-commerce de prestige et ultra élégante spécialisée dans les équipements, vêtements, maillots, chaussures et accessoires de sport professionnels en Afrique de l'Ouest (Togo, Lomé, etc.).

Règles de communication et données clés :
- Nom du site : DONALDSON SHOP
- Devise utilisée : FCFA (Franc CFA, ex: 15 000 FCFA)
- Nom de l'utilisateur actuel : ${userProfile?.firstName || ''} ${userProfile?.lastName || 'Client'}
- Email support Yahoo : donaldsonshop@yahoo.com
- Email Admin principal : tace616@gmail.com
- Numéros WhatsApp de la boutique : +228 90 79 54 16, +228 97 52 85 47, +228 98 14 09 53.
- Politique de livraison importante : Les prix de livraison ne sont PAS fixes sur le site et ne sont PAS ajoutés automatiquement au panier. L'utilisateur doit contacter l'administration via WhatsApp ou le service client pour obtenir l'estimation exacte selon son lieu de livraison (Lomé, Aného, Tsévié, Atakpamé, Sokodé, Kara, Dapaong ou à l'international).
- Vous êtes toujours courtois, dynamique, sportif, élégant et très utile. Vos réponses sont claires, concises et en français impeccable.
      `;

      const contents = history && Array.isArray(history) && history.length > 0 
        ? history.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          })).concat([{ role: 'user', parts: [{ text: message }] }])
        : [{ role: 'user', parts: [{ text: message }] }];

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text || "Pardon, je n'ai pas pu générer une réponse. N'hésitez pas à nous écrire sur WhatsApp au +228 90795416 !";
      res.json({ reply });

    } catch (err: any) {
      console.error("Erreur Gemini Chat:", err);
      res.json({
        reply: "Bienvenue chez DONALDSON SHOP ! Nos conseillers sportifs sont disponibles sur WhatsApp au +228 90 79 54 16 / 97 52 85 47 pour vous guider et calculer vos frais de livraison personnalisés."
      });
    }
  });

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
    console.log(`[DONALDSON SHOP] Serveur démarré sur http://localhost:${PORT}`);
  });
}

startServer();
