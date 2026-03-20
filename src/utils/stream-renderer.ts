export const renderStreamChunk = (chunk: any): { text?: string; type: string } | null => {
  if (!chunk || typeof chunk !== 'object') {
    return null;
  }

  // Handle Mastra's internal AgentStreamPart types first
  if (chunk.type === 'text-delta') {
    return { text: chunk.textDelta || '', type: 'text' };
  }
  if (chunk.type === 'reasoning-delta') {
    return { text: '.', type: 'reasoning' };
  }
  if (chunk.type === 'tool-call') {
    const name = chunk.toolName || chunk.name || (chunk as any).tool_call?.name || 'searching';
    return { text: `\n[Using tool: ${name}...]\n`, type: 'tool-call' };
  }
  if (chunk.type === 'error') {
    return { text: `\n[Error: ${chunk.error?.message || chunk.error}]\n`, type: 'error' };
  }

  // Fallback for raw provider chunks (OpenRouter/OpenAI delta format)
  const delta = chunk.choices?.[0]?.delta || chunk.delta;
  if (delta) {
    if (delta.content) {
      return { text: delta.content, type: 'text' };
    }
    if (delta.reasoning) {
      return { text: '.', type: 'reasoning' };
    }
    if (delta.tool_calls?.[0]?.function?.name) {
      return { text: `\n[Using tool: ${delta.tool_calls[0].function.name}...]\n`, type: 'tool-call' };
    }
  }

  // Final generic fallbacks
  if (typeof chunk.textDelta === 'string') return { text: chunk.textDelta, type: 'text' };
  if (typeof chunk.content === 'string') return { text: chunk.content, type: 'text' };
  if (typeof chunk.reasoning === 'string') return { text: '.', type: 'reasoning' };
  
  return null;
};
