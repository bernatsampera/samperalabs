import {parseFragment, type DefaultTreeAdapterMap} from 'parse5';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

export function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    .replace(/-+/g, '-').trim().replace(/^-|-$/g, '');
}

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];

function textContent(node: Node): string {
  if (node.nodeName === '#text') return (node as DefaultTreeAdapterMap['textNode']).value;
  if (['script', 'style', 'template'].includes(node.nodeName)) return '';
  return 'childNodes' in node ? node.childNodes.map(textContent).join('') : '';
}

/** Add heading anchors and build their contents list from the same parsed HTML. */
export function prepareTableOfContents(html: string): {html: string; headings: TOCItem[]} {
  const root = parseFragment(html, {sourceCodeLocationInfo: true});
  const reserved = new Set<string>();
  const headings: Element[] = [];
  function visit(node: Node) {
    if ('attrs' in node) {
      const id = node.attrs.find((attr) => attr.name === 'id');
      if (id) reserved.add(id.value);
      if (/^h[1-6]$/.test(node.tagName)) headings.push(node);
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(root);

  // Reserve plain-heading anchors before new formatted headings can claim them.
  // Use the source text here to keep old anchors for entity-encoded headings.
  const legacyIds = new Map<Element, string>();
  for (const heading of headings) {
    const location = heading.sourceCodeLocation;
    if (heading.attrs.some((attr) => attr.name === 'id') || !location?.startTag || !location.endTag) continue;
    const source = html.slice(location.startTag.endOffset, location.endTag.startOffset);
    const legacy = !source.includes('<') ? generateSlug(source.trim()) : '';
    if (legacy && !reserved.has(legacy)) {
      legacyIds.set(heading, legacy);
      reserved.add(legacy);
    }
  }

  const items: TOCItem[] = [];
  const insertions: {offset: number; text: string}[] = [];
  for (const heading of headings) {
    const text = textContent(heading).replace(/\s+/g, ' ').trim();
    const existing = heading.attrs.find((attr) => attr.name === 'id');
    let id = existing?.value ?? legacyIds.get(heading);
    if (id === undefined) {
      const base = generateSlug(text) || 'section';
      id = base;
      let suffix = 2;
      while (reserved.has(id)) id = `${base}-${suffix++}`;
      reserved.add(id);
    }
    if (!existing && heading.sourceCodeLocation?.startTag) {
      insertions.push({offset: heading.sourceCodeLocation.startTag.endOffset - 1, text: ` id="${id}"`});
    }
    // An empty label or ID cannot provide a useful navigation link.
    if (text && id) items.push({id, text, level: Number(heading.tagName[1])});
  }
  for (const insertion of insertions.sort((a, b) => b.offset - a.offset)) {
    html = html.slice(0, insertion.offset) + insertion.text + html.slice(insertion.offset);
  }
  return {html, headings: items};
}

export function extractHeadings(htmlContent: string): TOCItem[] {
  return prepareTableOfContents(htmlContent).headings;
}

export function addHeadingIds(htmlContent: string): string {
  return prepareTableOfContents(htmlContent).html;
}

export function buildNestedTOC(flatItems: TOCItem[]): TOCItem[] {
  const nested: TOCItem[] = [];
  const stack: TOCItem[] = [];
  for (const item of flatItems) {
    const current: TOCItem = {...item, children: []};
    while (stack.length && stack[stack.length - 1].level >= current.level) stack.pop();
    if (stack.length) stack[stack.length - 1].children!.push(current);
    else nested.push(current);
    stack.push(current);
  }
  return nested;
}
