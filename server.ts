import express, { Request, Response } from "express";
import path from "path";
import multer from "multer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Configure Multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set!");
}

// Helper to get active Gemini client or throw
function getAiClient(): GoogleGenAI {
  if (!ai) {
    throw new Error("Gemini API key is missing. Please configure it in Settings > Secrets.");
  }
  return ai;
}

// Custom API Error with HTTP status code to prevent exposing stack traces
class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

// Models Config
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// Utility sleep function for exponential backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Robust check to determine the exact type of Gemini error and bypass retries for quota/auth/config issues.
 * Throws specific developer/user friendly error messages immediately to prevent infinite retry loops.
 */
function handleAndThrowSpecificError(error: any): void {
  const status = error.status || error.statusCode || (error.response && error.response.status) || 500;
  const message = (error.message || "").toLowerCase();

  // 1. Quota / Rate limit (429) Error
  if (
    status === 429 ||
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("exhausted")
  ) {
    console.error(`Backend Error [HTTP 429]: Rate limit reached - ${error.message || "Quota exceeded"}`);
    throw new ApiError("Today's AI analysis limit has been reached. Please try again later.", 429);
  }

  // 2. Model Not Found / Deprecated / Inaccessible (404) Error
  if (
    status === 404 ||
    message.includes("404") ||
    message.includes("not_found") ||
    message.includes("not found") ||
    message.includes("no longer available")
  ) {
    console.error(`Backend Error [HTTP 404]: Model not found - ${error.message || "Model unavailable"}`);
    throw new ApiError("The requested Gemini model is not found or no longer available. Please verify model configuration.", 404);
  }

  // 3. Auth / Config / Invalid Request (400, 401, 403) Error
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    message.includes("api_key_invalid") ||
    message.includes("invalid api key") ||
    message.includes("api key is invalid") ||
    message.includes("key_invalid") ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    const errorStatus = (status === 400 || status === 403) ? status : 401;
    console.error(`Backend Error [HTTP ${errorStatus}]: Invalid credentials or bad request - ${error.message || "Unauthorized"}`);
    throw new ApiError("The request is invalid or unauthorized. Please check your Gemini API key configuration.", errorStatus);
  }
}

/**
 * Execute Gemini API calls with exponential backoff retries & fast-fail on 429/401 errors
 */
async function callGeminiWithRetry(
  prompt: string,
  systemInstruction: string,
  isJson = true
): Promise<string> {
  const client = getAiClient();
  const maxRetries = 2; // For 503/temporary server errors: retry at most 2 times
  const maxAttempts = 1 + maxRetries; // 1 initial attempt + 2 retries = 3 total attempts

  // Log as normal INFO message (not an error)
  console.info(`Starting analysis with stable model: ${GEMINI_MODEL}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Log as normal message
      console.log(`Sending API Request: Model = ${GEMINI_MODEL}, Attempt = ${attempt}/${maxAttempts}`);
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1,
          responseMimeType: isJson ? "application/json" : "text/plain",
        },
      });

      if (!response || !response.text) {
        throw new ApiError("Empty response from Gemini API", 502);
      }

      let responseText = response.text.trim();
      if (isJson) {
        if (responseText.startsWith("```")) {
          responseText = responseText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        }
      }

      // Success / info message
      console.info(`Successfully completed generation with model: ${GEMINI_MODEL} on attempt ${attempt}`);
      return responseText;
    } catch (error: any) {
      // Fast-fail check: If it is a 429 (quota) or 400/401/403/404 (auth/config), throw immediately!
      handleAndThrowSpecificError(error);

      // Inspect status code to see if it's a 503 or other retryable server-side error
      const status = error.status || error.statusCode || (error.response && error.response.status) || 500;
      const message = (error.message || "").toLowerCase();
      
      const isRetryableServerSelf = (
        status === 503 || 
        status === 500 || 
        status === 502 || 
        status === 504 || 
        status === 408 ||
        message.includes("503") ||
        message.includes("500") ||
        message.includes("502") ||
        message.includes("504") ||
        message.includes("408") ||
        message.includes("unavailable") ||
        message.includes("busy") ||
        message.includes("timeout")
      );

      const isLastAttempt = (attempt === maxAttempts);

      if (!isRetryableServerSelf || isLastAttempt) {
        // Actual failure logged as Backend Error
        console.error(`Backend Error [HTTP ${status}]: Gemini API request failed on attempt ${attempt}/${maxAttempts} - ${error.message || "Unknown failure"}`);
        throw new ApiError("AI analysis is temporarily unavailable. Please try again in a few moments.", status >= 400 && status < 600 ? status : 503);
      }

      // Informational retry with exponential backoff + jitter
      const retryCount = attempt - 1; // 0, 1
      const baseDelay = 2000;
      const exponentialFactor = Math.pow(2, retryCount);
      const jitter = Math.random() * 1000;
      const delay = (baseDelay * exponentialFactor) + jitter;

      console.log(`Temporary server retry in progress (HTTP ${status}). Retrying model ${GEMINI_MODEL} in ${Math.round(delay)}ms...`);
      await sleep(delay);
    }
  }

  console.error(`Backend Error [HTTP 503]: Gemini API reached maximum retry attempts.`);
  throw new ApiError("AI analysis is temporarily unavailable. Please try again in a few moments.", 503);
}

/**
 * Clean HTML and extract raw readable text
 */
function cleanHtmlText(html: string): string {
  // Remove scripts and styles
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  
  // Collapse whitespaces
  text = text.replace(/\s+/g, " ").trim();
  
  return text.slice(0, 15000); // safety cap
}

/**
 * Endpoint for portfolio URL validation and scraping
 */
app.post("/api/scrape-portfolio", async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: "Portfolio URL is required." });
    return;
  }

  // Basic URL Validation
  let validatedUrl = "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      res.status(400).json({ error: "Invalid URL protocol. Please use HTTP or HTTPS." });
      return;
    }
    validatedUrl = parsed.toString();
  } catch (err) {
    res.status(400).json({ error: "Please enter a valid portfolio website URL." });
    return;
  }

  try {
    console.log(`Scraping URL: ${validatedUrl}`);
    const fetchController = new AbortController();
    const timeoutId = setTimeout(() => fetchController.abort(), 8000); // 8s timeout

    const fetchResponse = await fetch(validatedUrl, {
      signal: fetchController.signal,
      headers: {
        "User-Agent": "CareerLensScraper/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
      },
    });

    clearTimeout(timeoutId);

    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch page. Status: ${fetchResponse.status}`);
    }

    const html = await fetchResponse.text();
    const rawText = cleanHtmlText(html);

    if (!rawText || rawText.length < 50) {
      res.status(422).json({
        error: "We couldn't extract enough text from this website.",
        needsFallback: true,
      });
      return;
    }

    res.json({ text: rawText, url: validatedUrl });
  } catch (error: any) {
    console.error("Backend Error [HTTP 422]: Scraping failed -", error.message || "Unable to access website");
    res.status(422).json({
      error: "We couldn't access this website. Please upload your portfolio or paste the content instead.",
      needsFallback: true,
    });
  }
});

/**
 * Handle File Text Extraction (PDF, DOCX, TXT)
 */
app.post("/api/extract-file", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file was uploaded." });
    return;
  }

  const file = req.file;
  const extension = path.extname(file.originalname).toLowerCase();
  let extractedText = "";

  try {
    if (extension === ".pdf" || file.mimetype === "application/pdf") {
      let parser: any = null;
      try {
        parser = new PDFParse({ data: file.buffer });
        const result = await parser.getText();
        extractedText = result.text || "";
      } catch (pdfErr: any) {
        console.error("Backend Error [HTTP 422]: PDF parsing failed -", pdfErr?.message || "Unreadable PDF");
        res.status(422).json({
          error: "Could not read this PDF file. Please ensure it is not password-protected or corrupted, and contains selectable text.",
        });
        return;
      } finally {
        if (parser && typeof parser.destroy === "function") {
          try {
            await parser.destroy();
          } catch (cleanupErr) {
            console.warn("PDF parser cleanup warning:", cleanupErr);
          }
        }
      }
    } else if (
      extension === ".docx" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    } else if (extension === ".txt" || file.mimetype === "text/plain") {
      extractedText = file.buffer.toString("utf-8");
    } else {
      res.status(400).json({
        error: "Unsupported file format. Please upload another PDF, DOCX or TXT file.",
      });
      return;
    }

    extractedText = extractedText.trim();
    if (!extractedText || extractedText.length < 10) {
      res.status(422).json({
        error: "We couldn't read any text from this file. It might be empty or scanned. Please upload another file.",
      });
      return;
    }

    res.json({
      text: extractedText.slice(0, 20000), // Cap for safety
      fileName: file.originalname,
    });
  } catch (error: any) {
    console.error("Backend Error [HTTP 422]: File parsing failed -", error?.message || "Unreadable file");
    res.status(422).json({
      error: "Failed to read the uploaded file. Please verify the file is not corrupted and try again.",
    });
  }
});

/**
 * Portfolio Analyzer API
 */
app.post("/api/analyze-portfolio", async (req: Request, res: Response) => {
  const { content, githubUrl, targetRole } = req.body;

  if (!content || content.trim().length < 20) {
    res.status(400).json({ error: "Portfolio content is empty or too short." });
    return;
  }

  const roleString = targetRole || "General Software/Tech Role";
  const gitString = githubUrl ? `GitHub: ${githubUrl}` : "No GitHub URL provided";

  const systemInstruction = `You are an expert technical portfolio reviewer and talent acquisition manager.
Your task is to analyze the provided portfolio content and target job role, and return a comprehensive, premium feedback report in structured JSON format.
CRITICAL COMPLIANCE RULES:
- Never invent missing information, statistics, company names, certifications, or projects.
- If info is unavailable for any section, set it as "Not enough information to verify this" rather than inventing it.
- Ensure the rating scores are realistic and constructive (not always 100/100).
- You MUST respond with a valid JSON matching this schema:
{
  "overallScore": 85,
  "categories": {
    "firstImpression": { "score": 80, "reason": "Reason string..." },
    "contentQuality": { "score": 85, "reason": "Reason string..." },
    "projects": { "score": 75, "reason": "Reason string..." },
    "technicalQuality": { "score": 90, "reason": "Reason string..." },
    "uiUx": { "score": 80, "reason": "Reason string..." },
    "recruiterReadiness": { "score": 85, "reason": "Reason string..." },
    "roleAlignment": { "score": 70, "reason": "Reason string..." },
    "accessibility": { "score": 75, "reason": "Reason string..." },
    "seo": { "score": 80, "reason": "Reason string..." }
  },
  "strengths": ["Strength 1", "Strength 2"],
  "importantIssues": ["Issue 1", "Issue 2"],
  "quickWins": ["Quick win 1", "Quick win 2"],
  "projectAnalysis": [
    {
      "projectName": "Project name or 'Unnamed Project'",
      "technologies": ["Tech 1", "Tech 2"],
      "strengths": ["Strength 1"],
      "problems": ["Problem 1"],
      "missingInformation": ["Missing info item or 'Not enough information to verify this'"],
      "recommendations": ["Rec 1"],
      "improvedDescription": "An optimized, highly persuasive description that uses ONLY the original details from the input."
    }
  ],
  "roleAlignmentDetails": "Detail analysis text about how well the portfolio fits the target role...",
  "actionPlan": ["Immediate action item", "Medium term item"],
  "sevenDayPlan": [
    { "day": "Day 1", "focus": "Focus of day 1", "tasks": ["Task A", "Task B"] },
    { "day": "Day 2", "focus": "Focus of day 2", "tasks": ["Task A"] },
    { "day": "Day 3", "focus": "Focus of day 3", "tasks": ["Task A"] },
    { "day": "Day 4", "focus": "Focus of day 4", "tasks": ["Task A"] },
    { "day": "Day 5", "focus": "Focus of day 5", "tasks": ["Task A"] },
    { "day": "Day 6", "focus": "Focus of day 6", "tasks": ["Task A"] },
    { "day": "Day 7", "focus": "Focus of day 7", "tasks": ["Task A"] }
  ]
}`;

  const prompt = `Target Role: ${roleString}
${gitString}

Portfolio Content:
---
${content}
---

Please perform a comprehensive technical review of the portfolio. Review projects, technologies, first impression, technical quality, UI/UX indicators, accessibility, SEO, recruiter readiness, and target role alignment. Make sure to generate detailed, actual feedback and valid JSON output. Do not truncate the JSON response.`;

  try {
    const rawJson = await callGeminiWithRetry(prompt, systemInstruction, true);
    // Safe validation/parsing
    const report = JSON.parse(rawJson);
    res.json(report);
  } catch (error: any) {
    const status = error.statusCode || error.status || 500;
    console.error(`Backend Error [HTTP ${status}]: Portfolio analysis endpoint failed - ${error.message || "Unknown failure"}`);
    res.status(status).json({ error: error.message || "AI analysis is temporarily unavailable. Please try again." });
  }
});

/**
 * Resume Analyzer API
 */
app.post("/api/analyze-resume", async (req: Request, res: Response) => {
  const { content, targetRole } = req.body;

  if (!content || content.trim().length < 20) {
    res.status(400).json({ error: "Resume content is empty or too short." });
    return;
  }

  const roleString = targetRole || "General Software/Tech Role";

  const systemInstruction = `You are an expert technical recruiter, executive resume writer, and ATS scanner algorithm specialist.
Your task is to analyze the uploaded resume text, compare it against the target role, and return a highly detailed review in structured JSON format.
CRITICAL COMPLIANCE RULES:
- Never invent missing achievements, metrics, degrees, certifications, or jobs.
- If information is unavailable for any category, use the string "Not enough information to verify this" instead of inventing facts.
- Scores must be analytical and realistic.
- You MUST respond with a valid JSON matching this schema:
{
  "overallScore": 82,
  "categories": {
    "contentQuality": { "score": 80, "reason": "Reason string..." },
    "structure": { "score": 85, "reason": "Reason string..." },
    "skills": { "score": 75, "reason": "Reason string..." },
    "projects": { "score": 70, "reason": "Reason string..." },
    "experience": { "score": 80, "reason": "Reason string..." },
    "education": { "score": 90, "reason": "Reason string..." },
    "atsCompatibility": { "score": 75, "reason": "Reason string..." },
    "readability": { "score": 85, "reason": "Reason string..." },
    "roleAlignment": { "score": 65, "reason": "Reason string..." }
  },
  "strengths": ["Strength 1", "Strength 2"],
  "importantIssues": ["Issue 1", "Issue 2"],
  "quickWins": ["Quick win 1", "Quick win 2"],
  "missingInformation": ["Missing item or 'Not enough information to verify this'"],
  "keywordSuggestions": ["ATS keyword 1", "ATS keyword 2"],
  "actionPlan": ["Step 1", "Step 2"],
  "improvedWording": [
    {
      "section": "Section name (e.g., Summary, Experience)",
      "original": "Original text fragment from user's resume...",
      "improved": "Improved, dynamic bullet point/phrase using strong action verbs and high-impact phrasing based ONLY on original facts.",
      "benefit": "Why this change benefits ATS and recruiter readers..."
    }
  ]
}`;

  const prompt = `Target Role: ${roleString}

Resume Content:
---
${content}
---

Analyze this resume content for ATS compatibility, readability, technical and soft skills, structural layout, project quality, professional experience clarity, and alignment with the target role. Provide actionable improvements and keyword suggestions. Produce a fully completed, valid JSON response.`;

  try {
    const rawJson = await callGeminiWithRetry(prompt, systemInstruction, true);
    // Safe validation/parsing
    const report = JSON.parse(rawJson);
    res.json(report);
  } catch (error: any) {
    const status = error.statusCode || error.status || 500;
    console.error(`Backend Error [HTTP ${status}]: Resume analysis endpoint failed - ${error.message || "Unknown failure"}`);
    res.status(status).json({ error: error.message || "AI analysis is temporarily unavailable. Please try again." });
  }
});

/**
 * AI Assistant / Chat Endpoint
 */
app.post("/api/assistant", async (req: Request, res: Response) => {
  const { messages, contextType, contextContent, targetRole } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Messages array is required." });
    return;
  }

  const cleanContextContent = contextContent ? String(contextContent).slice(0, 8000) : "None provided";
  const roleString = targetRole || "General Tech Role";

  const systemInstruction = `You are the CareerLens AI expert assistant. You have access to the user's uploaded ${contextType} content.
Your job is to answer questions, propose improvements (like summary formatting, bullet rewrites, or portfolio page structures), and guide them on their career transition.
CONTEXT DATA FOR ${contextType.toUpperCase()}:
- Target Job Role: ${roleString}
- Uploaded Content:
---
${cleanContextContent}
---

CRITICAL RULES:
- Ground all answers strictly on the facts present in the uploaded content.
- Do NOT invent fake achievements, project metrics, degrees, or companies.
- If they ask for improved wording, use only original information but make the language punchier, technical, and aligned with industry standards.
- Keep responses professional, encouraging, clear, and formatted in clean Markdown.`;

  // Format message history
  const formattedPrompt = messages
    .map((m: any) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n") + "\nAssistant:";

  try {
    const replyText = await callGeminiWithRetry(formattedPrompt, systemInstruction, false);
    res.json({ text: replyText });
  } catch (error: any) {
    const status = error.statusCode || error.status || 500;
    console.error(`Backend Error [HTTP ${status}]: AI Assistant endpoint failed - ${error.message || "Unknown failure"}`);
    res.status(status).json({ error: error.message || "AI assistant is temporarily offline. Please try again." });
  }
});

/**
 * Vite & Static Asset Handling
 */
async function startServer() {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
