import { createInterface } from 'readline/promises';
import { initializeMastra } from './mastra.js';
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

  console.log('\nReady! Ask anything about your documents (or type "exit" to quit).');

  // Simple thread management
  const threadId = `cli-session-${Date.now()}`;

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
        if (chunk.type === 'text-delta' && chunk.payload?.text) {
          process.stdout.write(chunk.payload.text);
        }
      }
      process.stdout.write('\n');
    } catch (error) {
      console.error('\nError:', (error as Error).message);
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
