/**
 * Wrap each <pre>…</pre> emitted by marked-highlight with a header bar
 * (filename or language) and a copy button. Matches both tagged fences
 * (`<code class="hljs language-X">`) and bare fences (`<code class="hljs">`).
 * Idempotent — won't re-wrap already-wrapped blocks.
 */
const PRE_RE = /<pre>(<code class="hljs(?: language-([^"]+))?">)([\s\S]*?)<\/code><\/pre>/g;

export function wrapCodeBlocks(html: string): string {
  return html.replace(PRE_RE, (_full, openTag, lang, body) => {
    const m = String(body).match(/^\s*(?:<span [^>]*>)*\s*\/\/\s*([^\n<]+?)\s*(?:<\/span>)*\n/);
    const filename = m ? m[1].trim() : (lang || 'code');
    return (
      `<div class="codewrap">` +
        `<div class="codehead">` +
          `<span class="filename">${escapeHtml(filename)}</span>` +
          `<button type="button" class="copy" data-copy aria-label="Copy code">copy</button>` +
        `</div>` +
        `<pre>${openTag}${body}</code></pre>` +
      `</div>`
    );
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]!
  ));
}
