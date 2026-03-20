export const renderStreamChunk = (chunk: any): string | null => {
  if (!chunk || typeof chunk !== 'object') {
    return null;
  }

  // Handle various AI SDK and Mastra chunk formats
  const type = chunk.type || (chunk.toolCall ? 'tool-call' : chunk.textDelta ? 'text-delta' : 'unknown');

  switch (type) {
    case 'text-delta':
      return chunk.textDelta || chunk.delta?.content || chunk.content || '';
    
    case 'reasoning-delta':
      // Make reasoning much more subtle (just a dot)
      return '.';
    
    case 'tool-call':
      // OpenRouter and other providers vary in where they put the name
      const name = chunk.toolName || 
                   chunk.name || 
                   chunk.toolCall?.name || 
                   chunk.toolCall?.toolName || 
                   (chunk.toolCall?.function?.name) || 
                   'unknown';
      return `\n[Using tool: ${name}...]\n`;
    
    case 'tool-result':
      return '';
    
    case 'error':
      const errorMsg = chunk.error?.message || chunk.error || 'Unknown error';
      return `\n[Error: ${errorMsg}]\n`;

    case 'finish':
      return '';

    default:
      // Fallback for common patterns in various providers
      if (typeof chunk.textDelta === 'string') return chunk.textDelta;
      if (typeof chunk.content === 'string') return chunk.content;
      if (typeof chunk.delta?.content === 'string') return chunk.delta.content;
      if (typeof chunk.reasoning === 'string' || type === 'reasoning') return '.';
      
      return null;
  }
};
