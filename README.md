# Mastra CLI AI Assistant

A powerful command-line AI assistant built with the [Mastra](https://mastra.ai/) framework.

## Features

- **Retrieval-Augmented Generation (RAG)**: Automatically indexes documents in the `data/` directory into ChromaDB.
- **Local Embeddings**: Uses Hugging Face's `all-MiniLM-L6-v2` via the Inference API for vectorization.
- **Intelligent Reasoning**: Powered by OpenRouter's `nvidia/nemotron-3-nano-30b-a3b:free` by default.
- **Mastra Server**: Starts an HTTP server (default port `4111`) exposing the agent over REST alongside the CLI.
- **Streaming CLI**: Real-time responses with feedback when tools are being used.
- **Persistent Memory**: Maintains conversation context across multiple turns using an in-memory store (volatile).
- **Travel Tools**: Integrated tools for flight schedules, hotel information, and currency conversion (USD to NGN).

## Prerequisites

- Node.js (v18+)
- [ChromaDB](https://docs.trychroma.com/getting-started) running locally (typically at `http://localhost:8000`).
- Hugging Face API Key (for embeddings).
- OpenRouter API Key (for reasoning).

## Setup

1.  **Clone and Install**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Copy `.env-example` to `.env` and fill in your API keys:
    ```bash
    cp .env-example .env
    ```

3.  **Start ChromaDB**:
    Ensure your local ChromaDB instance is running.

4.  **Add Data**:
    Place any `.txt` or `.md` files you want the assistant to know about into the `data/` directory.

## Usage

**Development Mode**:
```bash
npm run dev
```

**Production Mode**:
```bash
npm run build
npm start
```

## Server API

When the CLI starts, it also launches an HTTP server on port `4111` (configurable via `MASTRA_SERVER_PORT`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Health check — returns `{ "status": "ok" }` |
| `POST` | `/api/agents/assistant/generate` | Stream a response from the agent (NDJSON) |

**Example:**
```bash
curl -X POST http://localhost:4111/api/agents/assistant/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": "What flights are available?"}'
```

## Storage

The assistant uses an `InMemoryStore` to maintain conversation history. Note that this memory is volatile and will be reset if the application is restarted. This approach was chosen to ensure maximum compatibility across different operating systems without requiring native compilation of database drivers.

## Available Tools

- `rag`: Search through your local documents.
- `flight`: Get flight schedules and prices between cities.
- `hotel`: Find hotel options and pricing in a city.
- `currency`: Convert USD to NGN.
