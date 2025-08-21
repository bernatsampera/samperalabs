export interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

/**
 * Generates a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extracts headings from HTML content and generates a flat list of TOC items
 */
export function extractHeadings(htmlContent: string): TOCItem[] {
  // Create a temporary DOM element to parse the HTML
  if (typeof document === 'undefined') {
    // Server-side: use a simple regex approach
    return extractHeadingsFromString(htmlContent);
  }

  // Client-side: use DOM parsing
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const tocItems: TOCItem[] = [];

  headings.forEach((heading) => {
    const text = heading.textContent?.trim() || '';
    const level = parseInt(heading.tagName.substring(1));
    const id = generateSlug(text);

    // Add ID to the heading for anchor navigation
    heading.id = id;

    tocItems.push({
      id,
      text,
      level,
    });
  });

  return tocItems;
}

/**
 * Server-side fallback for extracting headings using regex
 */
function extractHeadingsFromString(htmlContent: string): TOCItem[] {
  const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi;
  const tocItems: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].trim();
    const id = generateSlug(text);

    tocItems.push({
      id,
      text,
      level,
    });
  }

  return tocItems;
}

/**
 * Converts a flat list of headings into a nested structure
 */
export function buildNestedTOC(flatItems: TOCItem[]): TOCItem[] {
  const nested: TOCItem[] = [];
  const stack: TOCItem[] = [];

  flatItems.forEach((item) => {
    const newItem: TOCItem = { ...item, children: [] };

    // Find the appropriate parent
    while (stack.length > 0 && stack[stack.length - 1].level >= newItem.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      nested.push(newItem);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(newItem);
    }

    stack.push(newItem);
  });

  return nested;
}

/**
 * Adds IDs to heading elements in HTML content for anchor navigation
 */
export function addHeadingIds(htmlContent: string): string {
  return htmlContent.replace(/<h([1-6])([^>]*)>([^<]+)<\/h[1-6]>/gi, (match, level, attributes, text) => {
    const cleanText = text.trim();
    const id = generateSlug(cleanText);

    // Check if ID already exists in attributes
    if (attributes.includes('id=')) {
      return match; // Don't modify if ID already exists
    }

    return `<h${level}${attributes} id="${id}">${cleanText}</h${level}>`;
  });
}
