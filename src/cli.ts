import { createInterface } from 'readline/promises';
import { initializeMastra } from './mastra.js';
import { startServer } from './server.js';
import { renderStreamChunk } from './utils/stream-renderer.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('--- Mastra CLI Assistant ---');
  console.log('Loading agent and knowledge base...');

  const mastra = await initializeMastra();

  // Start the Mastra HTTP server (task.md: "You must start a Mastra Server")
  await startServer(mastra);

  const agent = mastra.getAgent('assistant');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Handle Ctrl+C for a clean exit
  rl.on('SIGINT', () => {
    console.log('\nGoodbye! (Ctrl+C)');
    rl.close();
    process.exit(0);
  });

  console.log('\nReady! Ask anything about your documents (or type "exit" to quit).');

  // Simple thread management for persistent memory
  const threadId = `cli-session-${Date.now()}`;

  try {
    while (true) {
      const userInput = await rl.question('\nYou: ');

      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        break;
      }

      process.stdout.write('Assistant: Thinking...');

      try {
        const result = await agent.stream(userInput, {
          memory: { thread: { id: threadId }, resource: 'cli-app' },
          maxSteps: 5, // Explicitly allow tool loops
        });

        // Clear the "Thinking..." message
        process.stdout.write('\rAssistant:           \rAssistant: ');

        let hasTextOutput = false;
        let chunkCount = 0;
        let lastChunkType = '';

        for await (const chunk of result.fullStream) {
          chunkCount++;
          lastChunkType = (chunk as any).type || 'unknown';
          
          if (process.env.DEBUG === 'true') {
             console.log(`\n[DEBUG CHUNK ${chunkCount}]:`, JSON.stringify(chunk));
          }

          const rendered = renderStreamChunk(chunk);
          if (rendered) {
            const text = rendered.text || '';
            if (text) {
              process.stdout.write(text);
            }
            if (rendered.type === 'text' && text.trim()) {
              hasTextOutput = true;
            }
          }
        }
        
        // Final fallback: if we have reasoning/tools but NO natural language text, 
        // check if result.text has anything (Mastra might have consolidated it)
        if (!hasTextOutput) {
          if (process.env.DEBUG === 'true') console.log('\n[DEBUG]: No text output detected in stream, attempting fallback to result.text...');
          try {
            const finalResponse = await result.text;
            if (finalResponse && finalResponse.trim()) {
              process.stdout.write(finalResponse);
              hasTextOutput = true;
            }
          } catch (e) {
            if (process.env.DEBUG === 'true') console.error('\n[DEBUG ERROR]: result.text failed:', (e as Error).message);
          }
        }

        if (!hasTextOutput) {
          if (chunkCount === 0) {
            process.stdout.write('[Empty stream - no chunks received]');
          } else {
            // If we're here, it means the model really didn't say anything human-readable.
            // We'll try to provide a generic confirmation if tools were called.
            process.stdout.write('[Task completed, but the model provided no text summary]');
          }
        }
        process.stdout.write('\n');
      } catch (error) {
        process.stdout.write('\rAssistant: ');
        console.error('\nError during stream:', (error as Error).message);
      }
    }
  } catch (error: any) {
    // If we catch an AbortError (Ctrl+C during question), we exit gracefully
    if (error.code === 'ABORT_ERR') {
      console.log('\nGoodbye!');
    } else {
      throw error;
    }
  }

  console.log('Goodbye!');
  rl.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
