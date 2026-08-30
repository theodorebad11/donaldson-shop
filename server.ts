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

  // Google Search Console Site Verification file handlers
  app.get("/google02933b8597726617.html", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send("google-site-verification: google02933b8597726617.html");
  });

  app.get("/google:code.html", (req, res) => {
    const filename = `google${req.params.code}.html`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`google-site-verification: ${filename}`);
  });

  // Dynamic Sitemap XML compliant with Google Search Console
  app.get("/sitemap.xml", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.get("host") || "ais-pre-57fdy27vwcjvon73dbk52l-439719145388.europe-west2.run.app";
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split("T")[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/catalogue</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/nouveautes</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/promotions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  });

  // Dynamic robots.txt
  app.get("/robots.txt", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.get("host") || "ais-pre-57fdy27vwcjvon73dbk52l-439719145388.europe-west2.run.app";
    const baseUrl = `${protocol}://${host}`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });

  // AI Chatbot endpoint for DONALDSON SHOP sports assistant with Multimodal Image and Voice Recognition
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, imageUrl, audioUrl, history, userProfile, productsSummary } = req.body;

      if ((!message || typeof message !== 'string') && !imageUrl && !audioUrl) {
        return res.status(400).json({ error: "Un message, une image ou une note vocale est requise." });
      }

      if (!ai) {
        // Smart fallback response if API key is missing or not configured
        const isVoice = !!audioUrl;
        return res.json({
          reply: isVoice 
            ? `Bonjour ${userProfile?.firstName || 'cher client'} ! J'ai bien reçu votre note vocale. [TRANSFERRED_TO_ADMIN] Votre vocal a été directement transmis à l'administration de DONALDSON SHOP dans notre Espace Admin pour qu'un conseiller l'écoute et vous réponde sous peu.`
            : `Bonjour ${userProfile?.firstName || 'cher client'} ! Bienvenue chez DONALDSON SHOP ⚽🏋️‍♂️. J'ai bien reçu votre message ! Je suis votre assistant sportif virtuel. Nous proposons des articles de sport professionnels haut de gamme en FCFA. Pour toute question ou commande directe sur WhatsApp, contactez-nous au +228 90 79 54 16 !`,
          needsAdminAttention: isVoice
        });
      }

      const productsContext = Array.isArray(productsSummary) && productsSummary.length > 0
        ? `\n\nCatalogue Produits disponibles actuellement en boutique :\n` + productsSummary.slice(0, 35).map((p: any) => `- ${p.name} | Catégorie: ${p.category} | Prix: ${p.priceFCFA ? p.priceFCFA.toLocaleString('fr-FR') + ' FCFA' : 'Sur devis'} | Stock: ${p.stock || 'Disponible'}`).join('\n')
        : '';

      const systemInstruction = `
Vous êtes l'Assistant IA Officiel, Conseiller Sportif, Expert Visuel et Vocal de DONALDSON SHOP, une boutique e-commerce de prestige spécialisée dans les équipements, vêtements, maillots, chaussures et accessoires de sport professionnels en Afrique de l'Ouest (Togo, Lomé, Sanguéra, etc.).

CAPACITÉ DE COMPRÉHENSION DES NOTES VOCALES (AUDIO) :
- Vous êtes capable d'écouter et de comprendre les messages vocaux et enregistrements audio envoyés par les clients (en français, éwé, mina, mina/français, ou français avec accent togolais/ouest-africain).
- Si vous comprenez ce que le client dit ou demande dans son vocal : répondez-lui avec précision, bienveillance et dynamisme en respectant les consignes de formatage conversationnel.
- RÈGLE CRUCIALE LORSQUE LE VOCAL N'EST PAS COMPRIS (SON INAUDIBLE / BRUIT / INCOMPRÉHENSIBLE) :
  Si vous ne parvenez pas à comprendre le vocal (son trop faible, bruit de fond, murmures, propos inaudibles ou confus) :
  1. Répondez avec courtoisie et empathie en expliquant que vous n'avez pas pu bien saisir les propos de sa note vocale.
  2. Rassurez-le immédiatement : son vocal et l'historique de votre échange sont automatiquement transmis à l'administration de DONALDSON SHOP dans l'Espace Admin pour qu'un conseiller humain l'écoute et lui réponde directement ici.
  3. Terminez impérativement votre réponse avec la balise : [TRANSFERRED_TO_ADMIN].

CAPACITÉ DE VISION ET D'ANALYSE D'IMAGES :
- Vous possédez une excellente capacité de vision artificielle (Multimodal Vision). Vous pouvez analyser, reconnaître et interpréter avec précision toutes les photos et images que le client vous envoie (maillots de foot, crampons, baskets, survêtements, gants, matériel de musculation, logos d'équipes, étiquettes, etc.).
- Quand un client vous envoie une photo :
  1. Identifiez le produit, le sport, la marque, le club/pays ou le type d'équipement.
  2. Donnez vos conseils d'expert sur l'article présent sur l'image.
  3. Comparez avec le catalogue des produits disponibles chez DONALDSON SHOP (fourni ci-dessous) et indiquez-lui si nous avons cet article exact ou des modèles équivalents en stock, avec leurs prix en FCFA !

CAPACITÉ GLOBALE DE RÉPONSE :
Vous devez répondre avec intelligence, clarté et précision à TOUTES les questions posées par l'utilisateur :
1. **Boutique & Produits DONALDSON SHOP** : Prix en FCFA, maillots de football (clubs européens, équipes nationales, CAN, Ligue des Champions), crampons (Moulded, FG, SG, Turf), survêtements, gants de gardien, ballons pro, haltères, accessoires de musculation, flocages personnalisés, guide des pointures et tailles (S, M, L, XL, XXL / 39-45).
2. **Conseils Sportifs & Entraînement** : Routines de musculation, exercices cardiovasculaires, préparation physique football/fitness/combat, récupération, nutrition sportive, choix du matériel adapté aux terrains.
3. **Commandes & Logistique** : Explication de la prise de commande sur le site, gestion du panier, retrait gratuit en magasin à Sanguéra Lomé, estimations des livraisons personnalisées par quartier à Lomé, au Togo ou dans la sous-région.
4. **Culture Générale, Sport & Échanges Amicaux** : Vous répondez volontiers aux questions de culture générale, d'histoire du sport, de résultats sportifs célèbres, de règles de jeux, de salutations et de conversation naturelle, toujours en ramenant gentiment une touche chaleureuse et sportive.

INFORMATIONS CLÉS DE LA BOUTIQUE :
- Nom de l'enseigne : DONALDSON SHOP
- Devise officielle : FCFA (Franc CFA, ex: 15 000 FCFA)
- Nom de l'utilisateur : ${userProfile?.firstName || ''} ${userProfile?.lastName || 'Cher Client'}
- Adresse physique : Sanguéra, Lomé, Togo.
- Horaires d'ouverture : Lundi au Samedi de 08h00 à 20h00, Dimanche de 10h00 à 18h00.
- Numéros WhatsApp officiels : +228 90 79 54 16, +228 97 52 85 47, +228 98 14 09 53.
- Emails de contact : donaldsonshop@yahoo.com | Admin : tace616@gmail.com
- Politique de livraison : Les tarifs de livraison sont calculés sur mesure selon le quartier/ville/pays de l'acheteur. L'acheteur peut demander un devis exact via WhatsApp ou auprès du service client.
- Flocage : Flocage pro personnalisé disponible sur tous les maillots (Nom, Numéro, Badges).

TON ET STYLE (FORMATAGE CONVERSATIONNEL WHATSAPP) :
- Français irréprochable, courtois, chaleureux, passionné, dynamique et très élégant.
- DIRECTIVE CRUCIALE DE FORMATAGE : Ne JAMAIS écrire en code, n'utiliser aucun bloc de code (pas de \`\`\`, pas de JSON brut, pas de balises techniques HTML/XML, pas de backticks \`).
- Structurez vos réponses de manière claire et aérée comme dans une discussion WhatsApp :
  • Des paragraphes courts et faciles à lire sur mobile.
  • Utilisez des puces ou des tirets avec des émojis pour lister les articles, caractéristiques ou prix.
  • Mettez les mots clés ou prix en valeur avec du gras naturel (*mot* ou **mot**).
  • Utilisez des émojis sportifs et expressifs (⚽, 👟, 🏆, 🏋️‍♂️, 🥇, ✨, 💬, 📸, 🎙️, 📦, 📍, 💰) pour des échanges vivants et attrayants.

TRANSMISSION À L'ADMINISTRATION :
- Si la demande concerne une négociation financière très particulière, un litige spécifique sur une ancienne commande, une note vocale inaudible/incomprise ou une demande hors du scope habituel où l'intervention humaine directe est requise :
  Fournissez une première réponse très utile et courtoise, et terminez avec la mention :
  "[TRANSFERRED_TO_ADMIN] Votre message a été directement transmis à l'administration de DONALDSON SHOP dans notre Espace Admin pour qu'un conseiller réponde directement ici si nécessaire."
${productsContext}
      `;

      // Build multimodal parts for user's prompt
      const userParts: any[] = [];
      const textPrompt = (message && typeof message === 'string') ? message : '';
      if (textPrompt) {
        userParts.push({ text: textPrompt });
      } else if (imageUrl) {
        userParts.push({ text: "Voici une photo/image d'un article de sport que je vous envoie. Pouvez-vous l'analyser, identifier de quel produit il s'agit et me dire si DONALDSON SHOP propose cet article ou un modèle équivalent dans son catalogue ?" });
      } else if (audioUrl) {
        userParts.push({ text: "Voici une note vocale que je vous envoie. Veuillez l'écouter et y répondre." });
      }

      // Handle Image Data if present
      if (imageUrl && typeof imageUrl === 'string') {
        try {
          let mimeType = 'image/jpeg';
          let base64Data = '';

          if (imageUrl.startsWith('data:')) {
            const matches = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (matches) {
              mimeType = matches[1];
              base64Data = matches[2];
            }
          } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            const imgRes = await fetch(imageUrl);
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              base64Data = Buffer.from(arrayBuffer).toString('base64');
              const contentType = imgRes.headers.get('content-type');
              if (contentType && contentType.startsWith('image/')) {
                mimeType = contentType;
              }
            }
          }

          if (base64Data) {
            userParts.push({
              inlineData: {
                mimeType,
                data: base64Data
              }
            });
          }
        } catch (imgErr) {
          console.warn("Erreur chargement/conversion image pour Gemini:", imgErr);
        }
      }

      // Handle Voice Note Audio Data if present
      if (audioUrl && typeof audioUrl === 'string') {
        try {
          let audioMimeType = 'audio/webm';
          let audioBase64 = '';

          if (audioUrl.startsWith('data:')) {
            const matches = audioUrl.match(/^data:(audio\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
            if (matches) {
              audioMimeType = matches[1];
              audioBase64 = matches[2];
            }
          } else if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
            const audioRes = await fetch(audioUrl);
            if (audioRes.ok) {
              const arrayBuffer = await audioRes.arrayBuffer();
              audioBase64 = Buffer.from(arrayBuffer).toString('base64');
              const contentType = audioRes.headers.get('content-type');
              if (contentType && contentType.startsWith('audio/')) {
                audioMimeType = contentType;
              }
            }
          }

          if (audioBase64) {
            userParts.push({
              inlineData: {
                mimeType: audioMimeType,
                data: audioBase64
              }
            });
          }
        } catch (audioErr) {
          console.warn("Erreur chargement/conversion audio pour Gemini:", audioErr);
        }
      }

      const contents = history && Array.isArray(history) && history.length > 0 
        ? history.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text || (msg.imageUrl ? "[Photo attachée]" : (msg.audioUrl ? "[Note vocale]" : "")) }]
          })).concat([{ role: 'user', parts: userParts }])
        : [{ role: 'user', parts: userParts }];

      let responseText = '';
      const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest'];
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const resGen = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });
          if (resGen && resGen.text) {
            responseText = resGen.text;
            break;
          }
        } catch (mErr) {
          console.warn(`Gemini API warning with model ${modelName}:`, mErr);
          lastError = mErr;
        }
      }

      let rawReply = responseText || (audioUrl 
        ? "Je n'ai pas pu bien entendre ou comprendre votre message vocal. [TRANSFERRED_TO_ADMIN] Votre vocal a été directement transmis à l'administration de DONALDSON SHOP dans notre Espace Admin pour qu'un conseiller l'écoute et vous réponde ici." 
        : "Désolé, je n'ai pas la réponse exacte à votre question. [TRANSFERRED_TO_ADMIN] Votre message a été directement transmis à l'Espace Admin de DONALDSON SHOP pour qu'un administrateur vous réponde directement ici.");
      
      const isTransferred = rawReply.includes('[TRANSFERRED_TO_ADMIN]') || 
                          rawReply.toLowerCase().includes('je ne dispose pas') || 
                          rawReply.toLowerCase().includes('je n\'ai pas la réponse') || 
                          rawReply.toLowerCase().includes('pas pu bien comprendre') ||
                          rawReply.toLowerCase().includes('pas bien pu comprendre') ||
                          rawReply.toLowerCase().includes('pas pu comprendre') ||
                          rawReply.toLowerCase().includes('inaudible') ||
                          rawReply.toLowerCase().includes('bruit de fond') ||
                          rawReply.toLowerCase().includes('transmise à l\'administration') ||
                          rawReply.toLowerCase().includes('transmis à l\'administration') ||
                          rawReply.toLowerCase().includes('transmis à l\'espace admin');

      const reply = rawReply.replace(/\[TRANSFERRED_TO_ADMIN\]/g, '').trim();

      res.json({ reply, needsAdminAttention: isTransferred });

    } catch (err: any) {
      console.error("Erreur Gemini Chat:", err);
      res.json({
        reply: "Bienvenue chez DONALDSON SHOP ! Votre message a été enregistré et transmis à notre administration dans l'Espace Admin. Un administrateur ou conseiller va vous répondre sous peu.",
        needsAdminAttention: true
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
