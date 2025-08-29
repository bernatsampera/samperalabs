# Sitemap Generation

This script generates sitemap URLs for posts and tags in the blog.

## Usage

To generate the sitemap URLs, run:

```bash
npm run generate-sitemap
```

This will:

1. Read all posts from the SQLite database
2. Extract all unique tags from the posts
3. Generate URL arrays for posts and tags
4. Save them to `src/integrations/postUrls.ts` and `src/integrations/tagUrls.ts`

## Files Generated

- `src/integrations/postUrls.ts` - Array of all post URLs
- `src/integrations/tagUrls.ts` - Array of all tag URLs

## Integration

The sitemap integration in `src/integrations/sitemap.ts` uses these generated files to include all post and tag URLs in the sitemap.

## When to Run

Run this script whenever you:

- Add new posts
- Update existing posts
- Add or remove tags

The script should be run before building the site to ensure the sitemap includes all current content.
