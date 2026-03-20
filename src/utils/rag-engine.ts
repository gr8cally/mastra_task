import { MDocument } from '@mastra/rag';
import { ChromaVector } from '@mastra/chroma';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export class RAGEngine {
  private vectorStore: ChromaVector;
  private embeddingModel: ModelRouterEmbeddingModel;
  private collectionName = 'mastra_docs';

  constructor() {
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    const parsedUrl = new URL(chromaUrl);
    
    // Initialize Chroma Vector Store
    // host and port are extracted from CHROMA_URL
    this.vectorStore = new ChromaVector({
      id: 'chroma-store',
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port) || 8000,
    });

    // Initialize Embedding Model
    const modelId = process.env.EMBEDDING_MODEL_NAME || 'openai/text-embedding-3-small';
    this.embeddingModel = new ModelRouterEmbeddingModel(modelId);
  }

  async init() {
    console.log('Initializing RAG Engine...');
    
    // Ensure index exists
    try {
      // 1536 is standard for openai/text-embedding-3-small
      await this.vectorStore.createIndex({
        indexName: this.collectionName,
        dimension: 1536,
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
    
    // Create MDocument
    const doc = MDocument.fromText(content, { 
      source: filePath, 
      filename: path.basename(filePath)
    });

    // Chunk the document
    const chunks = await doc.chunk({
      strategy: 'recursive',
      maxSize: 1000,
      overlap: 200,
    });

    // Extract text for embeddings
    const texts = chunks.map(c => c.text);
    
    // Generate embeddings
    const { embeddings } = await this.embeddingModel.doEmbed({
      values: texts,
    });

    // Upsert with atomic delete of old source
    await this.vectorStore.upsert({
      indexName: this.collectionName,
      vectors: embeddings,
      metadata: chunks.map(c => ({
        ...c.metadata,
        text: c.text, // Store text in metadata for retrieval
        source: filePath
      })),
      deleteFilter: { source: filePath } as any,
    });

    console.log(`Successfully indexed ${chunks.length} chunks from ${filePath}`);
  }

  async query(userQuery: string) {
    // Generate embedding for query
    const { embeddings } = await this.embeddingModel.doEmbed({
      values: [userQuery],
    });

    // Query vector store
    const results = await this.vectorStore.query({
      indexName: this.collectionName,
      queryVector: embeddings[0],
      topK: 5,
    });

    return results;
  }
}
