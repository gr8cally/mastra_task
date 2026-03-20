import { RAGEngine } from './utils/rag-engine.js';
import dotenv from 'dotenv';

dotenv.config();

async function testRAG() {
  const engine = new RAGEngine();
  
  try {
    console.log('Step 1: Initializing RAG Engine (Indexing documents from data/)...');
    await engine.init();
    
    console.log('\nStep 2: Querying the RAG engine...');
    const query = 'What are the key features of Mastra?';
    console.log(`Query: "${query}"`);
    
    const results = await engine.query(query);
    
    console.log('\nStep 3: Retrieval Results:');
    if (results && results.length > 0) {
      results.forEach((res, i) => {
        console.log(`\n--- Result ${i + 1} (Score: ${res.score}) ---`);
        console.log(`Source: ${res.metadata?.filename || 'Unknown'}`);
        console.log(`Content snippet: ${res.metadata?.text?.substring(0, 150)}...`);
      });
    } else {
      console.log('No results found. Ensure ChromaDB is running on http://localhost:8000.');
    }
  } catch (error) {
    console.error('Error during RAG verification:', (error as Error).message);
    console.error('Please ensure ChromaDB is running on http://localhost:8000 and valid API keys are in .env.');
  }
}

testRAG();
