const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require("dotenv").config(); // Loads your API key from .env

// 1. YOUR KNOWLEDGE CHUNKS (from Step 1)
// We will store our "chunks" of text here.
const knowledgeChunks = [
  { id: "chunk-1", text: "Hello, I’m Adil Hasan. Full‑stack developer crafting AI‑powered web experiences and automation. Web developer & AI tinkerer | JavaScript, Python, Node.js | Building automation, AI‑powered tools & creative experiments in code. Full-stack learner." },
  { id: "chunk-2", text: "I build web apps end‑to‑end and explore AI/ML to create useful, human‑friendly tools. Currently focused on automation, transliteration, and developer utilities. I like turning ideas into working products with clean, accessible UI and practical engineering." },
  { id: "chunk-3", text: "Current Focus: Arabic Romanizer (AI transliteration tool using ChatGPT 5 API, coming soon). VeoCreator (AI video generation tool using Google Gemini’s Veo 3, coming soon). Experimenting with AI APIs and web automation workflows. Open to collaborations and freelance opportunities." },
  { id: "chunk-4", text: "Collaboration Policy: I welcome meaningful projects and respectful collaboration. I maintain clear religious boundaries and do not work on projects that promote, support, or endorse anything contrary to my faith and practice—such as shirk, kufr, zandaqah (heresy), false deities (ṭawāġīt), or bidʿah (innovations in Islām). I also avoid using flags or symbolism that may represent anti‑Islamic ideologies. If your project aligns with these principles, I’m happy to discuss." },
  { id: "chunk-5", text: "Quick Facts: Company: Raven Corp.Tech. Role: Full‑stack Developer. Open to: Internships, Junior roles, Freelance. Location: Remote." },
  { id: "chunk-6", text: "Skills: HTML, CSS, JavaScript, Python, Node.js, AI APIs, Web Automation, Exploring AI/ML" },
  { id: "chunk-7", text: "Experience: Independent Developer — Raven Corp.Tech. 2024 — Present • Remote. Building “Arabic Romanizer” (AI tool for Arabic → Roman transliteration using ChatGPT 5 API). Developing “VeoCreator” (AI video generator using Google Gemini’s Veo 3). Prototyping automation scripts and AI utilities using JavaScript, Python, and Node.js." },
  { id: "chunk-8", text: "Project - Arabic Romanizer: (Coming soon). AI‑powered Arabic → Roman transliteration tool. Tags: JavaScript, AI, Web App." },
  { id: "chunk-9", text: "Project - The Olden Ways: A minimal, aesthetic website project. Tags: HTML, CSS, JavaScript. Status: Live." },
  { id: "chunk-10", text: "Project - Selcouth: A clean, elegant site exploring uncommon aesthetics. Tags: HTML, CSS, JavaScript. Status: Live." },
  { id: "chunk-11", text: "Project - Portfolio Website: This site — responsive, SEO‑friendly personal portfolio. Tags: HTML, CSS, JavaScript. Status: Live." },
  { id: "chunk-12", text: "Project - The Nobles of Sudan: The official historical and genealogical website of the Nobles of Sudan (أشراف السودان), documenting their Hashemite lineage, families, and heritage. Tags: HTML, CSS, JavaScript, History, Genealogy. Status: Live." },
  { id: "chunk-13", text: "Project - Shaykh Dr. Khālid al-Ḥāyik Website: A dedicated site presenting the work, teachings, and publications of Shaykh Dr. Khālid al-Ḥāyik. Tags: HTML, CSS, JavaScript. Status: Live." },
  { id: "chunk-14", text: "Project - VeoCreator: (Coming soon). An AI‑powered video generation tool that uses Google Gemini’s Veo 3 model. Tags: JavaScript, Web App, Creative Tools, AI." }
];

// 2. CONFIGURE THE API
// Initialize the Generative AI client with your API key (expects GEMINI_API_KEY)
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing API key. Set GEMINI_API_KEY in your .env file.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);
// Get the embedding model
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// 3. A simple "database" to store our embeddings
// In a real app, you'd use a real vector database (ChromaDB, Pinecone, etc.)
// For this portfolio, a simple JSON file is perfectly fine.
let vectorDatabase = [];

// 4. MAIN FUNCTION TO CREATE EMBEDDINGS
async function createEmbeddings() {
  console.log("Starting to generate embeddings...\nModel: text-embedding-004\nChunks:", knowledgeChunks.length);

  try {
    for (const chunk of knowledgeChunks) {
      // Call the API to get the embedding for the text chunk
      const result = await embeddingModel.embedContent({
        content: { parts: [{ text: chunk.text }] }
      });
      const embedding = result?.embedding?.values || result?.embedding?.value;
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error(`No embedding returned for ${chunk.id}`);
      }

      // Store the chunk text and its embedding in our "database"
      vectorDatabase.push({
        id: chunk.id,
        text: chunk.text,
        embedding: embedding,
      });

      console.log(`Successfully created embedding for chunk: ${chunk.id} (dims: ${embedding.length})`);
    }

    // Save the entire database to a local JSON file
    fs.writeFileSync(
      "vector-database.json",
      JSON.stringify(vectorDatabase, null, 2)
    );

    console.log("\n✅ Embedding generation complete!");
    console.log("Your vector database is saved to 'vector-database.json'");

  } catch (error) {
    console.error("Error creating embeddings:", error?.message || error);
  }
}

// Run the main function
createEmbeddings();