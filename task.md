Overview
Your task is to build a simple AI assistant using Mastra TypeScript Agent Framework that runs from the command line. The command line chatbot must send user prompts to the agent and render responses clearly while following modern AI UX best practices. The goal is to evaluate your ability to use Mastra Framework to build intelligent commandline agents — your implementation should demonstrate thoughtful handling of streaming, latency, conversation memory, and error conditions.

 

Objective
Create a TypeScript project that:

Defines a production-style Mastra agent
Runs a Mastra server
Accepts user input from the CLI
Streams the agent response to the terminal
Handles errors properly
 

Requirements
You must use the Mastra library and framework, no other frontend or backend framework allowed

You must use environment variables for all API keys.

Use the OPENROUTER_API_KEY for the API key.

Use the MODEL_NAME env variable for the model name.

Provide an .env-example

You must create the same tools as you did in the last task, including the RAG tool

You must define a Mastra Agent and provide it with all 4 tools

You must register it inside a Workspace
You must start a Mastra Server
Create a CLI script called cli.ts that will invoke the agent.
Prompt user for input
Send messages to the agent
Stream output to the terminal
Allow repeated interaction (loop)
Maintain conversation memory
Gracefully handle errors
Exit cleanly (Ctrl+C support)