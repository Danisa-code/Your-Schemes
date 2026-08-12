import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import mandiRoutes from "./backend/routes/mandiRoutes.js";
import { initScheduler } from "./backend/scraper/cron.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Supabase Client
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized successfully.");
} else {
  console.warn("Supabase environment variables not provided. Supabase client will be null.");
}

// Lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoint to parse natural language voice commands into structured directives
app.get("/api/health", async (req, res) => {
  try {
    let dbStatus = "disconnected";
    if (supabase) {
      // Just check if we can reach the auth service or similar ping
      const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
      dbStatus = error ? "error" : "connected";
    }
    
    return res.json({
      status: "ok",
      supabase: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: "Health check failed", details: (err as Error).message });
  }
});

app.post("/api/voice-command", async (req, res) => {
  try {
    const { text, currentLanguage, currentScreen } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing transcript text" });
    }

    let ai;
    try {
      ai = getAiClient();
    } catch (err) {
      // Gracefully handle missing API Key
      console.warn("Gemini API client not initialized:", (err as Error).message);
      
      // Fallback client-side rule processor if API key isn't provided
      return res.json({
        action: "NONE",
        target: "",
        data: {},
        voiceResponse: `Received: "${text}". Please configure your GEMINI_API_KEY in Settings to enable smart AI voice control.`,
        isFallback: true
      });
    }

    const systemPrompt = `You are the smart voice interpreter for "Your Schemes", a modern, spacious Indian agricultural app.
The user spoken text is: "${text}".
The current interface language is: "${currentLanguage || "en"}" (supported: "en" for English, "hi" for Hindi, "mr" for Marathi, "te" for Telugu, "pa" for Punjabi, "ta" for Tamil).
The current screen is: "${currentScreen || "home"}".

Analyze the user's spoken phrase and map it to a structured action.
Available actions:
1. "NAVIGATE": Go to a tab or screen. Target must be one of: "home", "schemes", "land", "profile", "apply_scheme", "calculators", "community", "mandi_prices".
   Examples: "go to schemes", "show land evaluation", "open my profile", "fill out the scheme application", "home tab details", "open calculators", "show crop profit calculator", "go to community", "crop disease identification scanner", "market prices mandi".
2. "FILL_FORM": Fill fields on the Schemes Application or Land Details form.
   Provide data parameters in the 'data' field. Valid keys are:
   - 'farmerName' (string)
   - 'phoneNumber' (string)
   - 'address' (string)
   - 'cropType' (e.g., "wheat", "rice", "cotton", "sugarcane", "maize")
   - 'landSize' (number, e.g. 4.2)
   - 'idType' ("Aadhaar Card", "Voter ID", "PAN Card", "Kisan Credit Card")
   - 'idNumber' (string)
   - 'bankName' (string)
   - 'bankAccount' (string)
   - 'ifscCode' (string)
   - 'branchName' (string)
   Examples: "my name is Rajesh Patel", "set crop to sugarcane", "my phone number is 9876543210", "land size is five acres", "bank account number is 123456789".
3. "SEARCH": Search for schemes. Set 'data.searchQuery'. Target must be "schemes".
   Examples: "search for gold loan", "find organic farming schemes", "search tractor".
4. "CHANGE_LANGUAGE": Switch app language. Set 'data.languageCode' to one of: "en", "hi", "mr", "te", "pa", "ta".
   Examples: "switch to hindi", "मराठी करा", "change language to punjabi", "english language please", "தெలుగు", "change language to tamil", "தமிழுக்கு மாற்றவும்".
5. "SUBMIT_FORM": Click the submit button or complete the application.
   Examples: "submit evaluation", "send form", "apply now", "next step please", "confirm submission".

Produce the output strictly in the requested JSON schema.
The 'voiceResponse' field must be a short, warm, human-like voice response spoken in the corresponding language of the query or target language (e.g., in Hindi if the command was in Hindi or language changed to Hindi; in Tamil if the command was in Tamil). Keep it encouraging and direct, like a friendly farming helper. Keep it under 15 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              description: "The matched action: NAVIGATE, FILL_FORM, SEARCH, CHANGE_LANGUAGE, SUBMIT_FORM, or NONE",
            },
            target: {
              type: Type.STRING,
              description: "The navigation target, field name, or screen",
            },
            data: {
              type: Type.OBJECT,
              description: "Extracted action variables (e.g., { cropType: 'wheat' }, { searchQuery: 'gold' }, { languageCode: 'hi' })",
              properties: {
                farmerName: { type: Type.STRING },
                phoneNumber: { type: Type.STRING },
                address: { type: Type.STRING },
                cropType: { type: Type.STRING },
                landSize: { type: Type.NUMBER },
                idType: { type: Type.STRING },
                idNumber: { type: Type.STRING },
                bankName: { type: Type.STRING },
                bankAccount: { type: Type.STRING },
                ifscCode: { type: Type.STRING },
                branchName: { type: Type.STRING },
                searchQuery: { type: Type.STRING },
                languageCode: { type: Type.STRING },
              }
            },
            voiceResponse: {
              type: Type.STRING,
              description: "Friendly voice feedback matching the user's spoken language.",
            },
          },
          required: ["action", "voiceResponse"],
        },
      },
    });

    const resultText = response.text || "{}";
    const structuredCommand = JSON.parse(resultText);
    return res.json(structuredCommand);

  } catch (error) {
    console.error("Error processing voice command:", error);
    return res.status(500).json({
      error: "Internal server error parsing voice command",
      details: (error as Error).message,
    });
  }
});

// AI Chatbot Portfolio Endpoint
app.post("/api/chatbot", async (req, res) => {
  try {
    const { messages, message } = req.body;
    if (!message && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: "Missing message query" });
    }

    const userQuery = message || (messages && messages[messages.length - 1]?.content);

    let ai;
    try {
      ai = getAiClient();
    } catch (err) {
      console.warn("Gemini API client not initialized for Chatbot:", (err as Error).message);
      
      // Intelligent local rule-based fallback if API key is not configured
      const queryLower = userQuery.toLowerCase();
      let fallbackText = "I would love to help you with that! Here is some information about Patel Rajeshbhai:\n\n";
      
      if (queryLower.includes("project") || queryLower.includes("work")) {
        fallbackText += "### 🛠️ Featured Projects\n\n" +
          "1. **Krishi Sahay Portal**: This very web platform designed to streamline Indian agricultural scheme applications with multilingual voice controls.\n" +
          "2. **Smart IoT Micro-Irrigation**: Custom solar-powered sensor arrays that save up to 40% water on crop fields.\n" +
          "3. **Canopy Drone Mapping**: Visual algorithms evaluating crop nitrogen and leaf density from above.";
      } else if (queryLower.includes("photo") || queryLower.includes("camera") || queryLower.includes("art")) {
        fallbackText += "### 📸 Photography Portfolio\n\n" +
          "Patel captures the raw, elegant essence of rural landscapes and agricultural cycles. His signature series includes:\n" +
          "- *Golden Hour Canopies*: A drone perspective of organic cotton fields.\n" +
          "- *Monsoon Inflow*: A long-exposure study of water distribution streams in Nashik.\n" +
          "- *Precision Shadows*: Minimalist monochrome studies of crop alignment patterns.";
      } else if (queryLower.includes("skill") || queryLower.includes("technolog")) {
        fallbackText += "### ⚡ Skills & Expertise\n\n" +
          "- **Agro-Tech**: IoT Sensor Networks, Soil Chemistry Analytics, GIS Mapping.\n" +
          "- **Software**: React 19, TypeScript, Node.js, Tailwind CSS, Recharts & D3.js visualization.\n" +
          "- **Hardware**: Arduino, Raspberry Pi, Solar-inverters, DJI Multispectral Drones.";
      } else if (queryLower.includes("resume") || queryLower.includes("experience") || queryLower.includes("education")) {
        fallbackText += "### 📄 Education & Experience\n\n" +
          "- **M.S. in Precision Agriculture & Computer Engineering** - IIT Bombay\n" +
          "- **Lead Agro-Tech Consultant** - Krishi cooperative groups (5+ years)\n" +
          "- **Founding Engineer** - Agri-IoT Solutions.";
      } else if (queryLower.includes("contact") || queryLower.includes("email") || queryLower.includes("reach")) {
        fallbackText += "### ✉️ Contact Information\n\n" +
          "You can reach out directly via:\n" +
          "- **Email**: [rajesh@krishisahay.in](mailto:rajesh@krishisahay.in)\n" +
          "- **Profile Tab**: Navigate to the 'Farmer Profile' tab to view contact options.";
      } else if (queryLower.includes("service")) {
        fallbackText += "### 💼 Professional Services\n\n" +
          "- **Farm-Automation Consulting**: Precision irrigation and solar setups.\n" +
          "- **Agri-Tech System Design**: Full-stack web platforms and hardware telemetry integration.\n" +
          "- **Landscape & Commercial Agriculture Photography**: Artistic crop documentation.";
      } else {
        fallbackText = "Hello! I am your **AI Assistant**. I can help you explore Patel Rajeshbhai's **Portfolio**, **Projects**, **Photography**, **Skills**, **Services**, and **Resume**. \n\nClick one of the suggested action chips below or ask me any question directly!";
      }

      return res.json({
        response: fallbackText,
        isFallback: true
      });
    }

    // Prepare message history structure for Gemini 3.5
    const systemPrompt = `You are a premium AI Assistant representing Patel Rajeshbhai. He is a high-tech agricultural engineer, landscape photographer, and the creator of this Krishi Sahay portal. 

You should answer questions elegantly, in detail, with a polished corporate portfolio vibe (like Linear or Stripe assistants).
Use rich Markdown, bullet points, numbered lists, and inline code formatting where relevant.

Information about Rajesh:
- **About Me**: Rajesh is a pioneer in combining rural wisdom with cutting-edge computer engineering. He graduated with an M.S. in Precision Agriculture and Computer Engineering from IIT Bombay.
- **Projects**:
  1. *Krishi Sahay (Our Scheme Portal)*: A React/TypeScript system with dynamic speech synthesis and server-side voice parsing that helps marginal farmers navigate government grants.
  2. *Smart IoT Micro-Irrigation*: Custom solar-powered telemetry sensors tracking soil moisture & nitrogen, integrated with solenoid drip valves.
  3. *Canopy Drone Analysis*: Multispectral drone imaging algorithms calculating crop health index and estimating crop yields.
- **Photography**: Captures rural Indian landscape art, focusing on farmers' daily triumphs, golden hour soil texture, and organic geometry.
- **Skills**: React 19, TypeScript, Tailwind CSS, Express, Python (AI/ML), D3.js, IoT Telemetry, Soil Hydrology, GIS Mapping, Drone Pilot (Licensed).
- **Services**:
  1. *Agri-Tech Consultations*: Setting up precision irrigation, solar-pump telemetry, and crop monitors.
  2. *Full-Stack Development*: Building web and mobile dashboards for agritech companies.
  3. *Agri-Photography & Videography*: High-resolution aerial and landscape capture for farms & brands.
- **Contact**: Email: [rajesh@krishisahay.in](mailto:rajesh@krishisahay.in), Phone: +91 99283-XXXXX. Nashik, India.

Formatting Rules:
- Support Markdown bold, italic, bullet lists, headers, and hyperlinks. Make links clickable (e.g. [Email Rajesh](mailto:rajesh@krishisahay.in)).
- Keep answers professional, concise, encouraging, and informative. Always relate questions back to Rajesh's impressive hybrid skill set of computer engineering and agriculture.`;

    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    // If there is message history, we can replay messages or format them as content parts.
    // For a single chat turn we can just send the message.
    const chatResponse = await chatSession.sendMessage({
      message: userQuery,
    });

    return res.json({
      response: chatResponse.text || "I apologize, but I couldn't formulate a response. Please try again.",
      isFallback: false
    });

  } catch (error) {
    console.error("Error in AI Chatbot endpoint:", error);
    return res.status(500).json({
      error: "Failed to generate chatbot response",
      details: (error as Error).message
    });
  }
});

// AgriVision AI Land Evaluation Endpoint
app.post("/api/land-evaluate", async (req, res) => {
  try {
    const params = req.body;

    let ai;
    try {
      ai = getAiClient();
    } catch (err) {
      console.warn("Gemini API client not initialized for Land Evaluation:", (err as Error).message);
      return res.json({ isFallback: true });
    }

    const systemPrompt = `You are AgriVision AI, an expert Agricultural Land Evaluation and Government Scheme Recommendation system built for Indian farmers.
Your purpose is to accurately evaluate agricultural land, estimate its productivity, determine loan eligibility, identify risks, and recommend suitable government schemes.
You must think like an agricultural officer, bank land assessor, soil scientist, irrigation expert, and satellite analyst simultaneously.

Input land parameters:
${JSON.stringify(params, null, 2)}

Evaluate the agricultural asset based on these parameters. 
Ensure you follow these rules:
1. Never make up facts. If information is missing (e.g. soil report, photographs, location metrics), you MUST clearly state that the confidence level decreases in the 'summary' and the respective section explanations.
2. For each scoring section, you must assign a numeric score and explain WHY that score was assigned based on the input details (or lack thereof).
   - Ownership (max 20): Assess government-issued records. Patta, Khata, RTC, EC, Survey documents, registered sale deed receive high score. Blurry, incomplete, or missing documents reduce the score and confidence.
   - Accessibility/Road (max 15): Adjacent to main road (Excellent: 15), Village road (Good: 12), Kachha road (Average: 8), No road (Poor: 3). Adjust for highway distance, town distance, and road quality.
   - Market Accessibility (max 10): Distance to APMC: 0-5 km (Excellent: 10), 5-15 km (Very Good: 8), 15-30 km (Average: 5), 30+ km (Poor: 2). Consider warehouses, cold storage, transport.
   - Water Availability (max 20): Assess Canal, River, Lake, Borewell, Rain-fed, Drip/Sprinkler, Water storage, groundwater availability, and water reliability.
   - Soil Health (max 15): If soil report is provided, analyze Organic Carbon, N, P, K, micronutrients, salinity, texture, drainage. If no soil report exists, clearly state that you are estimating from images/soil type and that the estimate is approximate (and reduce score/confidence).
   - Crop Suitability (max 10): Determine suitability for crops (Rice, Wheat, Cotton, Sugarcane, Groundnut, Maize, Millets, Vegetables, Fruits, Oil seeds) and recommend better alternatives if needed.
   - Image/Satellite Analysis (max 10): Analyze details like healthy vegetation, crop stress, yellow leaves, brown patches, water logging, weed infestation, pest damage, rocky terrain, slope, fencing, roads, buildings, storage, water source. Mention confidence percentage for this analysis. If no images, score is low and confidence drops.
3. Compute the overall score as the sum of these 7 sections (out of 100).
4. Assign a Grade based on:
   - 90-100: Grade A+ (Excellent Agricultural Asset)
   - 80-89: Grade A
   - 70-79: Grade B
   - 60-69: Grade C
   - 40-59: Grade D
   - Below 40: Needs Improvement
5. Determine Loan Eligibility (High, Medium, Low) based on ownership, land quality, water, crop potential. Explain it is an estimate, do NOT guarantee approval.
6. Provide Climate and Disease risks with severity (Low, Medium, High).
7. List matching Government Schemes (PM-KISAN, PM Fasal Bima Yojana, PMKSY, Soil Health Card, KCC, eNAM, Agriculture Infrastructure Fund, State subsidies, Solar pump subsidy, Drip subsidy) with matching reasons.
8. Suggest 4 practical improvements in priority order.
9. Write a Final Recommendation.

Generate a JSON response conforming strictly to the requested schema. Do not output anything other than valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            grade: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                ownership: { type: Type.INTEGER },
                roadAccessibility: { type: Type.INTEGER },
                waterAvailability: { type: Type.INTEGER },
                soilHealth: { type: Type.INTEGER },
                marketAccessibility: { type: Type.INTEGER },
                cropSuitability: { type: Type.INTEGER },
                imageAssessment: { type: Type.INTEGER }
              },
              required: ["ownership", "roadAccessibility", "waterAvailability", "soilHealth", "marketAccessibility", "cropSuitability", "imageAssessment"]
            },
            scoreExplanations: {
              type: Type.OBJECT,
              properties: {
                ownership: { type: Type.STRING },
                roadAccessibility: { type: Type.STRING },
                waterAvailability: { type: Type.STRING },
                soilHealth: { type: Type.STRING },
                marketAccessibility: { type: Type.STRING },
                cropSuitability: { type: Type.STRING },
                imageAssessment: { type: Type.STRING }
              },
              required: ["ownership", "roadAccessibility", "waterAvailability", "soilHealth", "marketAccessibility", "cropSuitability", "imageAssessment"]
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            climateRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            diseaseRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            loanEligibility: { type: Type.STRING },
            recommendedCrops: { type: Type.ARRAY, items: { type: Type.STRING } },
            governmentSchemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  schemeName: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["schemeName", "reason"]
              }
            },
            estimatedAgriculturalPotential: { type: Type.STRING },
            suggestedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
            finalRecommendation: { type: Type.STRING }
          },
          required: [
            "overallScore", "grade", "confidence", "summary", "scores", "scoreExplanations",
            "strengths", "weaknesses", "climateRisks", "diseaseRisks", "loanEligibility",
            "recommendedCrops", "governmentSchemes", "estimatedAgriculturalPotential",
            "suggestedImprovements", "finalRecommendation"
          ]
        }
      }
    });

    const resultText = response.text || "{}";
    const resultObj = JSON.parse(resultText);
    return res.json({ ...resultObj, isFallback: false });
  } catch (error) {
    console.error("Error in Land Evaluation API:", error);
    return res.status(500).json({ error: "Failed to evaluate land assets", details: (error as Error).message });
  }
});


// Memory store for temporary OTP verification
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Rate limit store for security verification
const rateLimitStore = new Map<string, { lastRequestTime: number; count: number; windowStart: number }>();

app.post("/api/send-otp", async (req, res) => {
  console.log(`[OTP Engine] Incoming POST request to /api/send-otp with body:`, req.body);
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn(`[OTP Engine] Invalid email format received: "${email}"`);
      return res.status(400).json({ success: false, error: "Invalid email address format." });
    }

    const now = Date.now();
    const clientLimit = rateLimitStore.get(email) || { lastRequestTime: 0, count: 0, windowStart: now };

    // Rate Limit 1: 60 seconds request cooldown
    const cooldown = 60 * 1000;
    if (now - clientLimit.lastRequestTime < cooldown) {
      const waitSeconds = Math.ceil((cooldown - (now - clientLimit.lastRequestTime)) / 1000);
      console.warn(`[Rate Limiter] Cooldown active for ${email}. Blocked request.`);
      return res.status(429).json({
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting another code.`
      });
    }

    // Rate Limit 2: 5 requests per 10 minutes rolling window
    const windowDuration = 10 * 60 * 1000;
    if (now - clientLimit.windowStart > windowDuration) {
      clientLimit.count = 0;
      clientLimit.windowStart = now;
    }

    if (clientLimit.count >= 5) {
      const resetMinutes = Math.ceil((windowDuration - (now - clientLimit.windowStart)) / (60 * 1000));
      console.warn(`[Rate Limiter] Limit exceeded (5/10min) for ${email}. Blocked request.`);
      return res.status(429).json({
        success: false,
        error: `Too many requests. Please try again in ${resetMinutes} minutes.`
      });
    }

    // Update rate limit stats
    clientLimit.lastRequestTime = now;
    clientLimit.count += 1;
    rateLimitStore.set(email, clientLimit);

    // Generate secure random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000;
    const otpRequestId = Math.random().toString(36).substring(2, 11).toUpperCase();

    console.log(`[OTP REQUEST] User Email: ${email} | Request ID: ${otpRequestId} | Expiration Time: ${new Date(expiresAt).toISOString()} | Code (Secure Server Log): ${otp}`);

    otpStore.set(email, {
      otp,
      expiresAt,
    });

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      console.log(`[EMAIL SERVICE] Provider Used: Resend | Status: SENDING...`);
      
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Your Schemes <onboarding@resend.dev>",
          to: email,
          subject: "Your Login Verification Code",
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #0f5238; font-size: 20px; font-weight: bold; margin-bottom: 16px; text-align: center;">Verify Your Account</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Welcome to Your Schemes. Please use the verification code below to log into your account. This code is valid for 5 minutes.</p>
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.25em; color: #0f172a; font-family: monospace;">${otp}</span>
              </div>
              <p style="color: #94a3b8; font-size: 11px; text-align: center;">If you did not request this login code, please ignore this email.</p>
            </div>
          `,
        }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        console.error(`[EMAIL SERVICE] Provider Used: Resend | Status: FAILED | Error messages:`, responseText);
        return res.status(500).json({ success: false, error: "Failed to dispatch email verification", details: responseText });
      }

      console.log(`[EMAIL SERVICE] Provider Used: Resend | Status: SENT`);
      return res.json({
        success: true,
        message: "Verification code sent successfully to your email."
      });
    } else {
      console.error(`[EMAIL SERVICE] Provider Used: None | Status: FAILED | Error messages: RESEND_API_KEY environment variable is missing`);
      return res.status(500).json({
        success: false,
        error: "Email dispatch service is not configured. Please define RESEND_API_KEY in your env configuration."
      });
    }
  } catch (error) {
    console.error("[OTP Engine] Unexpected exception during OTP send process:", error);
    return res.status(500).json({ success: false, error: "Internal server error sending OTP", details: (error as Error).message });
  }
});

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: "Missing email address or OTP code." });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      console.warn(`[OTP VERIFICATION] Entered OTP: "${code}" | Stored OTP: "NONE" | Match Result: FAIL (No request exists)`);
      return res.status(400).json({ success: false, error: "No OTP request found for this email address." });
    }

    if (Date.now() > storedData.expiresAt) {
      console.warn(`[OTP VERIFICATION] Entered OTP: "${code}" | Stored OTP: "${storedData.otp}" | Match Result: FAIL (Expired)`);
      otpStore.delete(email);
      return res.status(400).json({ success: false, error: "OTP code has expired." });
    }

    const isMatch = storedData.otp === code;
    console.log(`[OTP VERIFICATION] Entered OTP: "${code}" | Stored OTP: "${storedData.otp}" | Match Result: ${isMatch ? "SUCCESS" : "FAIL"}`);

    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Incorrect OTP code." });
    }

    otpStore.delete(email);
    return res.json({ success: true, message: "Verified successfully." });
  } catch (error) {
    console.error("[OTP Engine] Unexpected exception during OTP verification process:", error);
    return res.status(500).json({ success: false, error: "Internal server error verifying OTP", details: (error as Error).message });
  }
});

async function startServer() {
  // Proxy /api/auth requests to Spring Boot backend on port 8080
  app.use("/api/auth", async (req, res) => {
    const targetUrl = `http://localhost:8080/api/auth${req.path}`;
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (req.headers.authorization) {
        headers["Authorization"] = req.headers.authorization as string;
      }
      const springRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: ["POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined,
      });

      const contentType = springRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await springRes.json();
        return res.status(springRes.status).json(data);
      } else {
        const text = await springRes.text();
        return res.status(springRes.status).send(text);
      }
    } catch (err: any) {
      console.warn("[Spring Proxy] Spring Boot backend (port 8080) unavailable:", err.message);
      // Fallback for when Spring Boot is starting or standalone Express fallback
      return res.status(503).json({
        success: false,
        message: "Spring Boot authentication server connection pending. Please ensure Spring Boot is running on port 8080."
      });
    }
  });

  // ── Register all API routes BEFORE Vite middleware ─────────────────────────
  // This ensures /api/* requests are handled by Express, not Vite's SPA fallback.
  app.use("/api", mandiRoutes);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  initScheduler();

  const initialPort = parseInt(process.env.PORT || "3000", 10);
  
  function listenOnPort(port: number) {
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${port} under NODE_ENV=${process.env.NODE_ENV}`);
    });
    
    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`Port ${port} is occupied, trying port ${port + 1}...`);
        listenOnPort(port + 1);
      } else {
        console.error("Server error:", err);
      }
    });
  }

  listenOnPort(initialPort);
}

startServer();
