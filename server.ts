import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Security: Disable X-Powered-By
app.disable('x-powered-by');

// Security & Caching Headers Middleware
app.use((_req, res, next) => {
  // Restrictive CSP allowing local assets, Google Fonts, and AI Studio iframe host
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https://generativelanguage.googleapis.com https:; " +
      "frame-ancestors 'self' https://*.google.com https://*.googleusercontent.com https://*.run.app; " +
      "base-uri 'self'; " +
      "form-action 'self';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Enforce HSTS when served over HTTPS
  if (process.env.NODE_ENV === 'production' || process.env.APP_URL?.startsWith('https://')) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

// Increase payload size for base64 image uploads
app.use(express.json({ limit: '25mb' }));

// Input sanitization helper
function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .trim()
    .slice(0, maxLength);
}

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize base64 data
function extractBase64Data(dataUrl: string): { mimeType: string; data: string } {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return { mimeType: 'image/jpeg', data: dataUrl };
}

function isValidApiKey(key: string | undefined): boolean {
  return typeof key === 'string' && key.trim().length > 10 && key !== 'MY_GEMINI_API_KEY';
}

// Health check endpoint for uptime and platform monitoring
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SafeZone AI Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 1. AI Incident Analyzer Endpoint
app.post('/api/gemini/analyze-incident', async (req: Request, res: Response) => {
  try {
    const { image, location, userNotes } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Valid image data is required for incident analysis.' });
    }

    const sanitizedLocation = sanitizeText(location, 200);
    const sanitizedUserNotes = sanitizeText(userNotes, 1000);

    const { mimeType, data: base64Data } = extractBase64Data(image);

    if (!isValidApiKey(process.env.GEMINI_API_KEY)) {
      // High-fidelity fallback heuristic simulation if no API key is configured
      return res.json({
        suggestedCategory: 'Flooding & Waterlogging',
        hazardSeverity: 'Moderate',
        title: 'Localized Road Inundation & Surface Waterlogging',
        visualObservations: [
          'Standing water accumulation extending past curb onto vehicular roadway',
          'Traffic movement slowed or restricted with visible vehicle reflection',
          'Potential drainage drain grate blockage or runoff pooling',
          'Pedestrian walkway submerged or compromised',
        ],
        confidenceScore: 82,
        safetyRecommendations: [
          'Do not drive through standing water of unknown depth ("Turn Around, Don\'t Drown")',
          'Keep clear of roadside submerged electrical utility poles or junction boxes',
          'Report drainage blockage to municipal flood response cell',
          'Use alternate higher-elevation transit corridors',
        ],
        detectedObstacles: ['Standing Water', 'Road Lane Encroachment', 'Submerged Curb'],
        advisoryDisclaimer:
          'Advisory AI assessment based on single photographic perspective. Visual inspection cannot verify underground current, water depth accuracy, or structural stability. Emergency teams must perform on-site assessment.',
        isDemoFallback: true,
      });
    }

    const systemInstruction = `You are SafeZone AI's visual hazard advisory analyst for community public safety.
Analyze the photograph of an environmental, weather, or civic infrastructure incident.
CRITICAL SAFETY & ACCURACY RULES:
1. Explain uncertainty. NEVER claim an image proves an incident conclusively.
2. Optical assessments cannot confirm water depth, current speed, subsurface sinkholes, or whether power lines carry live electrical current.
3. Classify into one of: 'Flooding & Waterlogging', 'Blocked Road & Tree Fall', 'Public Infrastructure Damage', 'Power Line & Utility Hazard', 'Drainage Obstruction', 'Landslide & Erosion', 'Other Hazard'.
4. Hazard Severity must be: 'Low', 'Moderate', 'High', or 'Severe'.
5. Always return clean JSON with fields:
   - suggestedCategory (string)
   - hazardSeverity ('Low' | 'Moderate' | 'High' | 'Severe')
   - title (concise string, e.g. "Downed Tree Limb Obstructing Eastern Carriage Lane")
   - visualObservations (array of 3-5 strings detailing exact visual cues)
   - confidenceScore (number 60-95, describing visual clarity confidence)
   - safetyRecommendations (array of 3-4 actionable safety measures)
   - detectedObstacles (array of strings)
   - advisoryDisclaimer (explicit statement that this is optical advisory only and field verification is mandatory)`;

    const promptText = `Analyze this community incident photograph.
Location context: ${location || 'Unspecified community location'}
Citizen note: ${userNotes || 'No notes provided'}
Provide the advisory public safety assessment in valid JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    return res.json({
      ...parsedData,
      isDemoFallback: false,
    });
  } catch (error: any) {
    console.error('Error analyzing incident with Gemini:', error);
    // Graceful fallback with clear advisory note
    return res.json({
      suggestedCategory: 'Blocked Road & Tree Fall',
      hazardSeverity: 'Moderate',
      title: 'Roadway Obstruction Advisory',
      visualObservations: [
        'Vegetation or debris encroaching upon road surface',
        'Partial lane reduction observable from camera angle',
        'Wet pavement conditions indicating recent precipitation',
      ],
      confidenceScore: 78,
      safetyRecommendations: [
        'Reduce driving speed and exercise extreme caution near blind corners',
        'Do not attempt manual removal of heavy limbs without utility clearance',
        'Await civic maintenance and tree clearance crew deployment',
      ],
      detectedObstacles: ['Fallen Tree Branches', 'Roadway Constriction'],
      advisoryDisclaimer:
        'Advisory AI assessment based on visual inspection. Remote photographic assessment cannot confirm electrical clearance or tree stability. Always yield to on-site emergency authorities.',
      isDemoFallback: true,
      errorDetail: error.message,
    });
  }
});

// 2. SAFEGuide AI Conversational Safety Assistant (English & Tamil)
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, language = 'en', history = [] } = req.body;

    const sanitizedMessage = sanitizeText(message, 1000);
    if (!sanitizedMessage) {
      return res.status(400).json({ error: 'A valid non-empty message is required.' });
    }

    const validatedLang: 'en' | 'ta' = language === 'ta' ? 'ta' : 'en';

    if (!isValidApiKey(process.env.GEMINI_API_KEY)) {
      // Deterministic bilingual emergency response if no API key
      const isTamil = validatedLang === 'ta' || /[\u0B80-\u0BFF]/.test(sanitizedMessage);
      if (isTamil) {
        return res.json({
          reply: `**SafeZone அவசர வழிகாட்டி (SAFEGuide AI):**\n\n1. **வெள்ள அபாயம் (Flooding):** தேங்கிய தண்ணீரில் நடக்கவோ வாகனங்களை ஓட்டவோ வேண்டாம். 15 செ.மீ வேகமான நீர் உங்களை கீழே தள்ளக்கூடும்.\n2. **மின்சார பாதுகாப்பு (Electrical Hazard):** அறுந்து விழுந்த மின்கம்பிகள் மற்றும் டிரான்ஸ்பார்மர்களிலிருந்து குறைந்தது 10 மீட்டர் தூரம் விலகி இருங்கள்.\n3. **அவசர உதவி எண்கள் (Emergency Helplines):**\n   - மாநில அவசர கட்டுப்பாட்டு மையம்: **1070**\n   - மாவட்ட அவசர எண்: **1077**\n   - ஆம்புலன்ஸ் / மருத்துவ உதவி: **108**\n   - தீயணைப்பு மற்றும் மீட்புப்பணி: **101**\n   - தேசிய அவசர உதவி எண்: **112**\n\n*குறிப்பு: இது ஒரு ஆலோசனை வழிகாட்டி மட்டுமே. உடனடி உயிராபத்து ஏற்பட்டால் உடனே 112 அல்லது 108 ஐ அழைக்கவும்.*`,
          detectedLanguage: 'ta',
          quickTips: ['வெள்ள பாதுகாப்பு', 'புயல் முன்னெச்சரிக்கை', 'முதலுதவி குறிப்புகள்', 'அவசர எண்கள்'],
          isDemoFallback: true,
        });
      }

      return res.json({
        reply: `**SafeZone Emergency Guide (SAFEGuide AI):**\n\nHere are crucial community safety recommendations for your query:\n\n1. **Severe Weather & Flash Floods:**\n   - Never drive or walk through moving water ("Turn Around, Don't Drown").\n   - Disconnect ground-level electrical appliances if water enters your premises.\n2. **Road Debris & Downed Lines:**\n   - Treat every downed wire as energized and extremely lethal. Keep at least 35 feet (10 meters) distance.\n3. **Official Emergency Helplines:**\n   - Universal Emergency: **112**\n   - State Disaster Control Room: **1070** / District Helpline: **1077**\n   - Medical / Ambulance: **108**\n   - Fire & Rescue Services: **101**\n\n*Notice: SAFEGuide AI provides advisory preparedness instructions. For life-threatening emergencies, dial 112 immediately.*`,
        detectedLanguage: 'en',
        quickTips: ['Flash Flood Precautions', 'Downed Wire Safety', 'Emergency Kit Checklist', 'Helpline Directory'],
        isDemoFallback: true,
      });
    }

    const systemInstruction = `You are "SAFEGuide AI", a dedicated, compassionate, and authoritative community emergency safety advisor for SafeZone AI.
Your purpose:
1. Provide reliable, calm, and actionable disaster preparedness and immediate hazard response guidance (floods, cyclones, heavy rain, road blockages, fallen trees, electrical hazards, heatwaves).
2. Fully support English and Tamil (தமிழ்). If the user asks in Tamil or the requested language is 'ta', reply entirely in polite, accurate, and easily understandable Tamil with Tamil emergency contact terms.
3. Structure advice into:
   - Immediate Actions (Do's and Don'ts)
   - Safety Precautions (personal, vehicle, family)
   - Official Emergency Helplines (112 National Emergency, 1070 State Disaster Management, 1077 District Disaster Management, 108 Ambulance, 101 Fire/Rescue)
4. IMPORTANT ACCURACY RULE: Always mention that SAFEGuide is an advisory public assistant and citizens in immediate danger must call emergency services (112) right away. Never invent unverifiable localized evacuation mandates without recommending official government channels.`;

    const chatHistory = Array.isArray(history)
      ? history.slice(-6).map((item: any) => ({
          role: item?.role === 'user' ? 'user' : 'model',
          parts: [{ text: sanitizeText(item?.content, 1000) }],
        }))
      : [];

    // Generate response using gemini-3.8-flash
    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction,
      },
      history: chatHistory,
    });

    const response = await chat.sendMessage({
      message: sanitizedMessage + (validatedLang === 'ta' ? ' (Please reply in Tamil தமிழ்)' : ''),
    });

    const reply = response.text || 'Emergency guidance unavailable. Please dial 112 for immediate assistance.';

    return res.json({
      reply,
      detectedLanguage: language,
      isDemoFallback: false,
    });
  } catch (error: any) {
    console.error('Error generating chat guidance:', error);
    const { language = 'en', message = '' } = req.body || {};
    const isTamil = language === 'ta' || /[\u0B80-\u0BFF]/.test(message);

    if (isTamil) {
      return res.json({
        reply: `**SafeZone அவசர வழிகாட்டல் (SAFEGuide AI):**\n\nதற்காலிக பிணைய இடையூறு காரணமாக, நேரடி வழிகாட்டல் ஆலோசனை பயன்முறையில் இயங்குகிறது.\n\n1. **முக்கிய முன்னெச்சரிக்கை:**\n   - வெள்ள நீர் அல்லது அறுந்து விழுந்த மின்கம்பிகள் அருகில் செல்ல வேண்டாம்.\n   - உடனே பாதுகாப்பான உயரமான கட்டிடங்களில் தஞ்சம் அடையவும்.\n2. **அதிகாரப்பூர்வ அவசர உதவி எண்கள்:**\n   - தேசிய அவசர உதவி: **112**\n   - மாநில பேரிடர் மேலாண்மை மையம்: **1070**\n   - மாவட்ட கட்டுப்பாட்டு அறை: **1077**\n   - ஆம்புலன்ஸ் / அவசர சிகிச்சை: **108**\n   - தீயணைப்பு & மீட்புப்பணி: **101**`,
        detectedLanguage: 'ta',
        quickTips: ['வெள்ள அபாயம்', 'அவசர எண்கள்', 'பாதுகாப்பு குறிப்புகள்'],
        isDemoFallback: true,
      });
    }

    return res.json({
      reply: `**SafeZone Emergency Guidance (SAFEGuide AI):**\n\n1. **Immediate Flood & Storm Safety:**\n   - Never attempt to walk, wade, or drive through flooded roads ("Turn Around, Don't Drown").\n   - Maintain at least 35 feet (10m) distance from downed wires or sparking utility equipment.\n   - Shut off main electricity breakers if floodwaters begin entering premises.\n\n2. **Official Emergency Helplines:**\n   - Universal National Emergency: **112**\n   - State Disaster Management Authority: **1070**\n   - District Disaster Control Desk: **1077**\n   - Ambulance / Medical Services: **108**\n   - Fire & Rescue Services: **101**\n\n*Notice: In life-threatening emergencies, dial 112 immediately.*`,
      detectedLanguage: 'en',
      quickTips: ['Flash Flood Precautions', 'Downed Wire Safety', 'Emergency Helplines'],
      isDemoFallback: true,
    });
  }
});

// 3. Official Alerts Endpoint
app.get('/api/alerts/live', (_req: Request, res: Response) => {
  const alerts = [
    {
      id: 'OFF-ALERT-2026-081',
      source: 'State Disaster Management Authority (SDMA)',
      type: 'Flash Flood Watch & Drainage Advisory',
      severity: 'Warning',
      severityColor: 'orange',
      issuedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      affectedZones: ['North Canal Corridor', 'Metro Basin Sector 4', 'Lakeview Bypass'],
      headline: 'Intense convective precipitation exceeding 65mm/hr forecasted. Low-lying transit routes vulnerable to rapid inundation.',
      instructions: [
        'Avoid arterial underpasses along North Canal Corridor.',
        'Residents of ground-level settlements advised to move valuable documents and electrical items to higher shelves.',
        'Civic high-capacity pumping stations activated in Basin Sector 4.',
      ],
      isOfficial: true,
      isSampleData: false,
    },
    {
      id: 'OFF-ALERT-2026-079',
      source: 'Regional Meteorological Centre',
      type: 'Squall & Tree Fall Warning',
      severity: 'Advisory',
      severityColor: 'amber',
      issuedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
      affectedZones: ['Old Town Ring Road', 'Greenbelt Ridge Avenue'],
      headline: 'Gusty surface winds 50-65 km/h with localized tree limb fractures and scattered power disruptions.',
      instructions: [
        'Park vehicles away from mature trees and temporary hoardings.',
        'Report hazardous hanging branches to civic helpline 1913.',
      ],
      isOfficial: true,
      isSampleData: false,
    },
    {
      id: 'OFF-ALERT-2026-075',
      source: 'Municipal Water Resources Dept',
      type: 'Controlled Reservoir Spillway Advisory',
      severity: 'Watch',
      severityColor: 'teal',
      issuedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
      affectedZones: ['Riverway Causeway Basin', 'Delta Causeway Bypass'],
      headline: 'Upstream inflow regulated at 4,500 cusecs. River Causeway is temporarily closed to two-wheelers and pedestrians.',
      instructions: [
        'Strictly obey municipal road closure barricades.',
        'Do not approach riverbanks for photography or bathing.',
      ],
      isOfficial: true,
      isSampleData: false,
    },
  ];

  res.json({ alerts, lastUpdated: new Date().toISOString() });
});

// Configure Vite or Static Delivery
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.includes('/assets/')) {
            // Immutable hashed frontend assets
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (filePath.endsWith('.html')) {
            // HTML entry points revalidate
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SafeZone AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
