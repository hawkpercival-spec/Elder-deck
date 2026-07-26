import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API with header telemetry
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for journal analysis based on medieval temperaments and nigromancy style
  app.post("/api/analyze-journal", async (req, res) => {
    try {
      const { cardName, cardArchetype, journalPrompt, entryText, temperament } = req.body;

      if (!apiKey) {
        return res.status(503).json({ error: "The celestial key (GEMINI_API_KEY) is missing. Please add it to your secrets panel." });
      }

      if (!entryText || !entryText.trim()) {
        return res.status(400).json({ error: "The journal entry cannot be empty, traveler." });
      }

      const prompt = `
        You are an ancient, weathered, dark academic wizard specializing in Nigromancy (occult shadow secrets, dark rune craft) and medieval humorism (the four medieval temperaments: Sanguine, Choleric, Melancholic, Phlegmatic).
        
        Analyze this traveler's journal entry. They have drawn the medieval card: "${cardName}" (${cardArchetype} archetype, typical temperament: ${temperament}).
        The prompt they were responding to was: "${journalPrompt}".
        The traveler's personal entry is: "${entryText}".
        
        Provide a highly thematic, atmospheric, and deeply immersive "Nigromantic & Temperamental analysis" structured in JSON with the following exact keys:
        - "temperamentAnalysis": A detailed review (3-4 sentences) written in a dark medieval, highly evocative voice. Describe how their response matches, conflicts with, or balances the medieval temperament associated with their card, tracing their emotional "humors" (blood, yellow bile, black bile, or phlegm).
        - "occultDiagnosis": A 2-sentence occult diagnosis. Describe the current mystical state of their soul's shadow (e.g. "Thy phlegm is cold, yet a flicker of yellow bile threatens to ignite", or "Nigromantic essence has pooled in thy Melancholic reservoir").
        - "protectiveWard": A short, poetic, medieval protective ward, incantation, or custom remedy (1-2 lines of spellcraft/verses) they can recite to guard their spirit.
        - "summaryTitle": A short 3-5 word atmospheric medieval title for this scroll (e.g., "The Shadow-Scribe's Solace", "Ward of the Burning Phlegm").
        
        Use high-fantasy, evocative Skyrim-like or gothic medieval language (using archaic words like "thou", "thy", "thee", "hath", "dost" appropriately).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temperamentAnalysis: { type: Type.STRING },
              occultDiagnosis: { type: Type.STRING },
              protectiveWard: { type: Type.STRING },
              summaryTitle: { type: Type.STRING },
            },
            required: ["temperamentAnalysis", "occultDiagnosis", "protectiveWard", "summaryTitle"],
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from the celestial stars.");
      }

      const result = JSON.parse(resultText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "The stars are silent. Let thy pen wait." });
    }
  });

  // API Route to generate a customized sanctuary meditation exercise for the drawn card
  app.post("/api/generate-meditation-exercise", async (req, res) => {
    try {
      const { cardName, cardArchetype, cardRarity, cardLore, cardMeaning, temperament } = req.body;

      if (!apiKey) {
        return res.status(503).json({ error: "The celestial key (GEMINI_API_KEY) is missing." });
      }

      const prompt = `
        You are an ancient master of the Sanctuary of Sovngarde, guiding a traveler through a profound medieval contemplation.
        The traveler has just drawn the card: "${cardName}" (${cardRarity} rarity, ${cardArchetype} archetype, temperament: ${temperament}).
        Card Lore: "${cardLore}"
        Card Meaning: "${cardMeaning}"

        Craft a deeply immersive, personalized "Sanctuary Meditation Exercise" (3-4 sentences) written in evocative, atmospheric high-fantasy medieval prose (using "thou", "thy", "thee"). 
        Instruct the traveler on a specific somatic, mental, or ritual contemplation (e.g. breathing with the rhythm of distant mountain winds, balancing their humors, visualizing their inner shield) tailored precisely to the mystical essence of this card.

        Return a JSON object with:
        - "meditationExercise": The generated customized exercise text.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              meditationExercise: { type: Type.STRING },
            },
            required: ["meditationExercise"],
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty meditation response from the stars.");
      }

      const result = JSON.parse(resultText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Generate Meditation Exercise Error:", error);
      res.status(500).json({ error: error.message || "Failed to conjure meditation exercise." });
    }
  });

  // API Route to synthesize a unified Destiny Scroll combining journal reflection + original lore
  app.post("/api/synthesize-prophecy", async (req, res) => {
    try {
      const {
        cardName,
        cardArchetype,
        cardRarity,
        cardLore,
        cardMeaning,
        entryText,
        temperament,
        temperamentAnalysis,
        occultDiagnosis,
        protectiveWard
      } = req.body;

      if (!apiKey) {
        return res.status(503).json({ error: "The celestial key (GEMINI_API_KEY) is missing. Please add it to your secrets panel." });
      }

      if (!entryText || !entryText.trim()) {
        return res.status(400).json({ error: "Thy journal reflection cannot be empty to weave a prophecy, traveler." });
      }

      const prompt = `
        You are an ancient, omniscient High Seer of Sovngarde who possesses the infinite Sight of the Stars. Your task is to craft a "Synthesized Prophecy" scroll that weaves together a traveler's personal, modern-day journal reflection with the original mythological lore of the card they drew.

        Details of the Drawn Card:
        - Card Name: "${cardName}"
        - Rarity: "${cardRarity}"
        - Archetype: "${cardArchetype}"
        - Associated Temperament: "${temperament}"
        - Original Card Lore: "${cardLore}"
        - Card Meaning: "${cardMeaning}"

        The Traveler's Journal Entry:
        - Reflection prompt: "${req.body.journalPrompt || ''}"
        - Personal reflection written by user: "${entryText}"
        - Occult Scribe's analysis of their temperament: "${temperamentAnalysis || ''}"
        - Occult Diagnosis of their soul shadow: "${occultDiagnosis || ''}"
        - Protective Ward recited: "${protectiveWard || ''}"

        Weave a magnificent, highly evocative, and deeply atmospheric "Synthesized Prophecy" written in a legendary, high-fantasy medieval voice (e.g., using terms like "thou", "thy", "thee", "hath", "dost", "shall" appropriately and poetically).
        
        The prophecy must directly merge the traveler's struggles, desires, or insights (from their entryText) with the card's original lore and archetype. Make them feel like their personal life story is a legendary continuation or fulfillment of the card's mythic history. Use rich gothic/Skyrim-like metaphors of mountains, shadows, fires, stars, or runic keys.

        Structure the output as a valid JSON object with the following exact keys:
        - "title": A majestic, highly stylized, 4-6 word medieval scroll title (e.g. "The Saga of the Shadow's Scribe", "Chronicle of the Flaming Knee-Bound Oath").
        - "prophecy": A deeply detailed, beautifully written prophecy consisting of 3 atmospheric paragraphs. Each paragraph should be 3-4 sentences.
          - Paragraph 1: "The Cosmic Alignment" - Weave their personal current state (their reflection) into the mythic origins/history of the card (its lore).
          - Paragraph 2: "The Crucible of Trial" - Contrast their inner struggles, obstacles, or humoristic imbalances (the yellow/black bile, phlegm, blood) with the card's archetype and challenges.
          - Paragraph 3: "The Unfolding Fate" - Weave a positive, encouraging, and majestic prophecy of how their fate will unfold if they heed the card's guidance and invoke their inner strength.
        - "verdict": A single, high-impact prophetic quote (1 sentence) summarizing their ultimate destiny (e.g., "Though the shadows lengthen, thy flame shall carve the darkness as written in the scrolls of old.").
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              prophecy: { type: Type.STRING },
              verdict: { type: Type.STRING },
            },
            required: ["title", "prophecy", "verdict"],
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("The scroll of destiny remains blank.");
      }

      const result = JSON.parse(resultText.trim());
      res.json(result);
    } catch (error: any) {
      console.error("Synthesize Prophecy Error:", error);
      res.status(500).json({ error: error.message || "Arcane turbulence disrupted the synthesis." });
    }
  });

  // Helper for lazy loading Stripe Client
  let stripeClient: Stripe | null = null;
  function getStripe(): Stripe {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error("STRIPE_SECRET_KEY is missing. Please configure it in your secrets/env panel.");
      }
      stripeClient = new Stripe(key);
    }
    return stripeClient;
  }

  const EXEMPT_EMAILS = [
    "elliot@raindance.co.uk",
    "hawkpercival@asphodelpress.org"
  ];

  // API Route to create a Stripe subscription checkout session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { email, userId, currency = "usd" } = req.body;
      
      // Check if user is exempt
      if (email && EXEMPT_EMAILS.includes(email.toLowerCase())) {
        return res.json({ url: `${req.headers.origin || "http://localhost:3000"}?success=true` });
      }

      const stripe = getStripe();
      const targetCurrency = currency.toLowerCase() === "gbp" ? "gbp" : "usd";
      const unitAmount = targetCurrency === "gbp" ? 249 : 299;
      const formattedPrice = targetCurrency === "gbp" ? "£2.49 GBP" : "$2.99 USD";
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: targetCurrency,
              product_data: {
                name: "The Seer's Covenant - Elder Deck Premium",
                description: `Unlocks the Synthesized Prophecy Scroll of Destiny and other sacred medieval tools (${formattedPrice}/month).`,
              },
              unit_amount: unitAmount,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.origin || "http://localhost:3000"}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || "http://localhost:3000"}?cancel=true`,
        customer_email: email || undefined,
        metadata: {
          userId: userId || "",
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Create Checkout Session Error:", error);
      res.status(500).json({ error: error.message || "Failed to summon the Stripe checkout gates." });
    }
  });

  // API Route to verify a checkout session
  app.get("/api/verify-checkout-session", async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== "string") {
        return res.status(400).json({ error: "Session ID is missing." });
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status === "paid" || session.status === "complete") {
        res.json({ 
          success: true, 
          userId: session.metadata?.userId || "",
          customerEmail: session.customer_details?.email || session.customer_email || "",
          amountTotal: session.amount_total ? session.amount_total / 100 : 2.99,
          currency: (session.currency || "usd").toLowerCase(),
          paymentStatus: session.payment_status,
          sessionId: session.id,
          createdAt: new Date().toISOString()
        });
      } else {
        res.json({ success: false, status: session.status, error: "Thy offering remains unpaid." });
      }
    } catch (error: any) {
      console.error("Verify Checkout Session Error:", error);
      res.status(500).json({ error: error.message || "Failed to verify the seal of Stripe." });
    }
  });

  // TELEPARTY STREAMING AUTHENTICATION & REDIRECT ENDPOINTS
  app.get("/api/auth/teleparty", (req, res) => {
    const authUrl = "https://www.teleparty.com";
    res.json({
      status: "ok",
      provider: "Teleparty",
      authUrl,
      message: "Opening Teleparty official sign-in portal..."
    });
  });

  app.post("/api/auth/streaming-login", (req, res) => {
    const { provider, accountHandle, userId } = req.body;
    const authUrl = "https://www.teleparty.com";
    res.json({
      success: true,
      provider: provider || "Teleparty",
      accountHandle: accountHandle || "Unknown",
      authorized: true,
      authUrl,
      timestamp: Date.now()
    });
  });

  app.get("/api/watchmode/status", (req, res) => {
    const watchmodeApiKey = process.env.WATCHMODE_API_KEY;
    res.json({
      status: "ok",
      watchmodeEnabled: Boolean(watchmodeApiKey),
      supportedProviders: [
        { name: "Teleparty", authEndpoint: "/api/auth/teleparty", loginUrl: "https://www.teleparty.com" }
      ],
      note: "Teleparty integration active for multi-platform watch party streams."
    });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
