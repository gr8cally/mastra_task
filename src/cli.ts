import { createInterface } from 'readline/promises';
import { initializeMastra } from './mastra.js';
import { renderStreamChunk } from './utils/stream-renderer.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('--- Mastra CLI Assistant ---');
  console.log('Loading agent and knowledge base...');

  const mastra = await initializeMastra();
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

      process.stdout.write('Assistant: ');

      try {
        const result = await agent.stream(userInput, {
          memory: { thread: { id: threadId }, resource: 'cli-app' },
        });

        for await (const chunk of result.fullStream) {
          const rendered = renderStreamChunk(chunk);
          if (rendered) {
            process.stdout.write(rendered);
          }
        }
        process.stdout.write('\n');
      } catch (error) {
        console.error('\nError:', (error as Error).message);
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
