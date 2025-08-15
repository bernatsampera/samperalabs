/**
 * Utility functions for markdown processing
 */

/**
 * Preprocesses markdown content to fix double-escaped links and other formatting issues
 *
 * Fixes patterns like:
 * - \\[[text](url)\\]([url](url)) -> [text](url)
 * - Escaped brackets and parentheses
 *
 * @param content Raw markdown content
 * @returns Processed markdown content
 */
export function preprocessMarkdownContent(content: string): string {
  // Fix pattern 1: \\[[text](url)\\]([url](url)) -> [text](url)
  // Double-escaped links with duplicate URLs
  content = content.replace(/\\?\\\[\[([^\]]+)\]\(([^)]+)\)\\?\\\]\(\[[^\]]+\]\([^)]+\)\)/g, '[$1]($2)');

  // Fix pattern 2: \\[text\\]([url](url)) -> [text](url)
  // Single-escaped links with parentheses around the URL part
  content = content.replace(/\\?\\\[([^\]]+)\\?\\\]\(\[([^\]]+)\]\(([^)]+)\)\)/g, '[$1]($3)');

  // Fix pattern 3: \\[text\\](url) -> [text](url)
  // Simple escaped brackets
  content = content.replace(/\\?\\\[([^\]]+)\\?\\\]\(([^)]+)\)/g, '[$1]($2)');

  // Fix remaining individual escaped markdown characters (only if not already part of valid markdown)
  content = content.replace(/\\(?=[\[\]()])/g, '');

  return content;
}

/**
 * Configures marked.js with standard options for the blog
 *
 * @param marked The marked instance to configure
 */
export function configureMarked(marked: typeof import('marked').marked): void {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
}
