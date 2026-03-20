# Implementation Plan: Mastra CLI AI Assistant

This document outlines a phased approach for developing a command-line AI assistant using the Mastra TypeScript Agent Framework.

## Phase 1: Project Setup & Infrastructure (Completed)
**Goal**: Establish a robust TypeScript development environment and configure essential dependencies.

### Specific Deliverables
- `package.json`: Project configuration and dependency management (ESM-ready with `tsx`).
- `tsconfig.json`: TypeScript compiler settings (`NodeNext`).
- `.env-example`: Template for required environment variables (Updated for RAG & Models).
- `.gitignore`: Standard exclusion patterns for Node.js projects.

### Measurable Goals
- Successfully install all project dependencies.
- Compile a basic TypeScript file using `tsc`.

### Technical Requirements
- Node.js (v18+) and npm/pnpm.
- TypeScript for type-safe development.
- `dotenv` for environment variable management.
- Mastra core library.

### Testing Criteria
- Run `npm install` and ensure zero errors.
- Run `npm run build` and verify output in `dist/`.

### Exit Criteria
- Project structure initialized.
- Environment variables configured and validated.
- Initial project build succeeds.

---

## Phase 2: RAG Implementation & Tool Foundation
**Goal**: Implement a robust RAG (Retrieval-Augmented Generation) system using ChromaDB and the Hugging Face Inference API for embeddings.

### Specific Deliverables
- `data/`: Directory for storing documents to be indexed.
- `src/tools/rag-tool.ts`: RAG tool implementation with ChromaDB integration.
- `src/utils/rag-engine.ts`: Logic for auto-indexing and querying, using the Hugging Face API (via `@huggingface/inference`) for embeddings.
- `src/tools/index.ts`: Tool export registry.

### Measurable Goals
- Any file placed in `data/` is automatically parsed and indexed into ChromaDB on startup.
- Embeddings are generated via the Hugging Face Inference API (Non-local).
- RAG tool correctly formats retrieved snippets for the reasoning model.

### Technical Requirements
- `@huggingface/inference` for API-based embeddings.
- `HUGGINGFACE_API_KEY` environment variable.
- ChromaDB locally hosted at `CHROMA_URL` (default: http://localhost:8000).
- `EMBEDDING_MODEL_NAME` for vectorization (e.g., `sentence-transformers/all-MiniLM-L6-v2`).
- `REASONING_MODEL_NAME` for the agent's core logic.

### Testing Criteria
- Verify ChromaDB connectivity on startup.
- Drop a `.txt` or `.md` file in `data/` and verify it appears in the vector store.
- Test queries to confirm that the RAG tool is retrieving relevant context.

### Exit Criteria
- RAG system is fully functional using the Hugging Face API.
- Auto-indexing logic is robust.

---

## Phase 3: Secondary Tools & Agent Integration
**Goal**: Complete the toolset and define a production-style agent registered in a Mastra Workspace.

### Specific Deliverables
- `src/tools/flight-tool.ts`: Flight schedule and pricing tool.
- `src/tools/hotel-tool.ts`: Hotel information and pricing tool.
- `src/tools/currency-tool.ts`: Currency conversion tool.
- `src/agent.ts`: Definition of the Mastra Agent with all tools and reasoning model.
- `src/mastra.ts`: Mastra Workspace configuration and server initialization.

### Measurable Goals
- Agent successfully routes queries to the correct tool (RAG vs. Flight vs. Hotel vs. Currency).
- Mastra server starts and exposes the agent via internal APIs.

### Technical Requirements
- Mastra Agent and Workspace APIs.
- Tool-specific logic for Flights, Hotels, and Currency.

### Testing Criteria
- Verify agent registration via Mastra diagnostics.
- Cross-tool validation: Ask "What's the flight from London to Paris?" and "Calculate USD to NGN conversion" and verify correct tool usage.

### Exit Criteria
- All 4 tools integrated and functional.
- Mastra server running and agent ready.

---

## Phase 4: CLI Implementation
**Goal**: Create a robust command-line interface for real-time interaction with the agent.

### Specific Deliverables
- `src/cli.ts`: The main entry point for the CLI application.
- `src/utils/stream-renderer.ts`: Logic for clear, real-time terminal output.

### Measurable Goals
- CLI accepts user input in a loop.
- Agent responses are streamed to the terminal.
- Conversation memory is maintained across interactions.

### Technical Requirements
- Node.js `readline` or `enquirer` for input handling.
- Streaming response processing from the Mastra server.
- Graceful `SIGINT` (Ctrl+C) handling.

### Testing Criteria
- Manual interaction testing: prompt -> stream response -> repeat.
- Verify that previous turns are remembered.
- Simulate errors (e.g., ChromaDB down) and verify graceful handling.

### Exit Criteria
- Functional CLI that satisfies all UX requirements.
- Clean exit on Ctrl+C.

---

## Phase 5: Quality Assurance & Final Refinement
**Goal**: Conduct final end-to-end testing and refine the user experience.

### Specific Deliverables
- Final verified codebase.
- Documentation on how to run and test the assistant.

### Measurable Goals
- 100% compliance with `task.md` requirements.
- Zero known critical bugs.

### Technical Requirements
- Linting and formatting checks.

### Testing Criteria
- End-to-end testing of the entire workflow (Setup -> Data Load -> Run -> Interact -> Exit).
- Latency and error handling validation.

### Exit Criteria
- All tests pass.
- Project is ready for handoff.
