import { MDocument } from '@mastra/rag';
import { ChromaVector } from '@mastra/chroma';
import { HfInference } from '@huggingface/inference';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export class RAGEngine {
  private vectorStore: ChromaVector;
  private hf: HfInference;
  private collectionName = 'mastra_docs';
  private embeddingModel: string;

  constructor() {
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    const parsedUrl = new URL(chromaUrl);
    
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.embeddingModel = process.env.EMBEDDING_MODEL_NAME || 'sentence-transformers/all-MiniLM-L6-v2';

    this.vectorStore = new ChromaVector({
      id: 'chroma-store',
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port) || 8000,
    });
  }

  async init() {
    console.log('Initializing RAG Engine...');

    try {
      await this.vectorStore.createIndex({
        indexName: this.collectionName,
        dimension: 384, // Dimension for all-MiniLM-L6-v2
        metric: 'cosine',
      });
      console.log(`Collection ${this.collectionName} ready.`);
    } catch (error) {
      console.log(`Note: Collection setup info:`, (error as Error).message);
    }

    await this.indexDirectory(path.join(process.cwd(), 'data'));
  }

  private async indexDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      console.warn(`Data directory ${dirPath} does not exist.`);
      return;
    }

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        await this.indexFile(filePath);
      }
    }
  }

  private async indexFile(filePath: string) {
    console.log(`Indexing file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const doc = MDocument.fromText(content, { 
      source: filePath, 
      filename: path.basename(filePath)
    });

    const chunks = await doc.chunk({
      strategy: 'recursive',
      maxSize: 1000,
      overlap: 200,
    });

    const texts = chunks.map(c => c.text);
    
    const embeddings = await this.hf.featureExtraction({
      model: this.embeddingModel,
      inputs: texts,
    }) as number[][];

    await this.vectorStore.upsert({
      indexName: this.collectionName,
      vectors: embeddings,
      metadata: chunks.map(c => ({
        ...c.metadata,
        text: c.text,
        source: filePath
      })),
      deleteFilter: { source: filePath } as any,
    });

    console.log(`Successfully indexed ${chunks.length} chunks from ${filePath}`);
  }

  async query(userQuery: string) {
    const queryVector = await this.hf.featureExtraction({
      model: this.embeddingModel,
      inputs: userQuery,
    }) as number[];

    const results = await this.vectorStore.query({
      indexName: this.collectionName,
      queryVector,
      topK: 5,
    });

    return results;
  }
}
