import {enhancePostWithMetadata, getDB, type PostStore} from './db';
import {applyPostRevision} from './postRevisions';

// Use this read-only view for public pages. The database retains status, dates,
// URLs, and admin content. Revisions cannot create or publish a missing post.
export function getPublicPostStore(): Pick<PostStore, 'getAllPosts' | 'getPostBySlug'> {
  return {
    async getAllPosts() {
      const posts = await getDB().getAllPosts();
      return posts.map((post) => enhancePostWithMetadata(applyPostRevision(post)));
    },
    async getPostBySlug(slug) {
      const post = await getDB().getPostBySlug(slug);
      return post ? enhancePostWithMetadata(applyPostRevision(post)) : null;
    },
  };
}
