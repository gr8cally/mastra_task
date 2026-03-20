export const renderStreamChunk = (chunk: any): string | null => {
  switch (chunk.type) {
    case 'text-delta':
      return chunk.textDelta || null;
    
    case 'tool-call':
      return `\n[Using tool: ${chunk.toolName}...]\n`;
    
    case 'tool-result':
      // Optionally show tool result if it's brief
      return null;
    
    case 'error':
      return `\n[Error: ${chunk.error}]\n`;

    default:
      return null;
  }
};
