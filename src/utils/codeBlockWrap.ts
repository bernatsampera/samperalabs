import {renderCodeBlock} from '../components/content/CodeBlock';

/** Wrap highlighted Markdown fences with the shared public code component. */
const PRE_RE = /<pre>(<code class="hljs(?: language-([^"]+))?">)([\s\S]*?)<\/code><\/pre>/g;
export function wrapCodeBlocks(html: string): string {
  return html.replace(PRE_RE, (_full, codeOpenTag, language, highlightedHtml, offset) => {
    // Preserve already-rendered blocks if the pipeline calls this function twice.
    const before = html.slice(0, offset);
    const lastWrapper = before.lastIndexOf('<div class="codewrap');
    if (lastWrapper >= 0 && before.lastIndexOf('</pre>') < lastWrapper) return _full;
    return renderCodeBlock({highlightedHtml, codeOpenTag, language});
  });
}
