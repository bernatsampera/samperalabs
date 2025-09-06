import { I18N } from 'samperalabs:config';

export const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(I18N?.language, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const getFormattedDate = (date: Date): string => (date ? formatter.format(date) : '');

export const trim = (str = '', ch?: string) => {
  let start = 0,
    end = str.length || 0;
  while (start < end && str[start] === ch) ++start;
  while (end > start && str[end - 1] === ch) --end;
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};

// Function to format a number in thousands (K) or millions (M) format depending on its value
export const toUiAmount = (amount: number) => {
  if (!amount) return 0;

  let value: string;

  if (amount >= 1000000000) {
    const formattedNumber = (amount / 1000000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'B';
    } else {
      value = formattedNumber + 'B';
    }
  } else if (amount >= 1000000) {
    const formattedNumber = (amount / 1000000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'M';
    } else {
      value = formattedNumber + 'M';
    }
  } else if (amount >= 1000) {
    const formattedNumber = (amount / 1000).toFixed(1);
    if (Number(formattedNumber) === parseInt(formattedNumber)) {
      value = parseInt(formattedNumber) + 'K';
    } else {
      value = formattedNumber + 'K';
    }
  } else {
    value = Number(amount).toFixed(0);
  }

  return value;
};

export const getReadingTime = (content: string) => {
  return Math.max(Math.floor(content.length / 1000), 1);
};

// Simple content type determination based on reading time
export const getContentTypeFromReadingTime = (readingTime: number): 'quick post' | 'post' | 'article' => {
  if (readingTime <= 2) {
    return 'quick post'; // Short reads (2 min or less)
  } else if (readingTime <= 10) {
    return 'post'; // Medium reads (3-10 min)
  } else {
    return 'article'; // Long reads (more than 10 min)
  }
};

// Find related posts based on tags and content similarity
export const findRelatedPosts = (
  currentPost: { id: number; tags: string[]; contentType: string; readingTime: number; pub_date: string },
  allPosts: { id: number; tags: string[]; contentType: string; readingTime: number; pub_date: string }[],
  maxResults: number = 3
): {
  id: number;
  tags: string[];
  contentType: string;
  readingTime: number;
  pub_date: string;
  similarityScore: number;
}[] => {
  if (!currentPost || allPosts.length <= 1) {
    return [];
  }

  const relatedPosts = allPosts
    .filter((post) => post.id !== currentPost.id) // Exclude current post
    .map((post) => {
      let score = 0;

      // Score based on shared tags (highest weight)
      const sharedTags = currentPost.tags.filter((tag: string) => post.tags.includes(tag));
      score += sharedTags.length * 3;

      // Score based on content type similarity
      if (post.contentType === currentPost.contentType) {
        score += 2;
      }

      // Score based on reading time similarity (prefer similar length posts)
      const timeDiff = Math.abs((post.readingTime || 1) - (currentPost.readingTime || 1));
      if (timeDiff <= 2) score += 1; // Similar reading time

      // Score based on recency (slight boost for newer posts)
      const daysDiff =
        Math.abs(new Date(post.pub_date).getTime() - new Date(currentPost.pub_date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 30) score += 0.5; // Published within 30 days

      return { ...post, similarityScore: score };
    })
    .filter((post) => post.similarityScore > 0) // Only include posts with some similarity
    .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity score
    .slice(0, maxResults);

  return relatedPosts;
};
