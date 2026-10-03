/** Public Markdown code component. Input HTML must come from the Markdown highlighter. */
export interface CodeBlockProps {
  highlightedHtml: string;
  codeOpenTag: string;
  language?: string;
}
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));

export function renderCodeBlock({highlightedHtml, codeOpenTag, language}: CodeBlockProps): string {
  const plain = !language || ['text','txt','plaintext','tree','ascii'].includes(language.toLowerCase());
  const comment = highlightedHtml.match(/^\s*(?:<span [^>]*>)*\s*\/\/\s*([^\n<]+?)\s*(?:<\/span>)*\n/);
  const label = plain ? '' : escapeHtml(comment?.[1].trim() || language!);
  const action = plain ? 'Copy text' : 'Copy code';
  return `<div class="codewrap code-block ${plain ? 'code-block-plain' : 'code-block-source'}"><div class="codehead">${label ? `<span class="filename">${label}</span>` : ''}<button type="button" class="copy" data-copy aria-label="${action}">Copy</button></div><pre tabindex="0" aria-label="${plain ? 'Text diagram or plain text' : 'Source code'}">${codeOpenTag}${highlightedHtml}</code></pre></div>`;
}
