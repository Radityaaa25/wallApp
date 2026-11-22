"use client";

import type { Post } from "@/lib/posts";
import PostItem from "./PostItem";

type PostFeedProps = {
  posts: Post[];
  loading: boolean;
  error: string | null;
};

function SkeletonFeed() {
  return (
    <div className="loading-list" aria-label="Loading posts">
      {[0, 1, 2].map((item) => (
        <div className="skeleton-post" key={item} aria-hidden="true">
          <div className="skeleton-avatar" />
          <div className="skeleton-lines">
            <div className="skeleton-line short" />
            <div className="skeleton-line long" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PostFeed({ posts, loading, error }: PostFeedProps) {
  return (
    <section className="panel feed" aria-label="Recent posts">
      <h3 className="feed-heading">Recent Posts</h3>
      {loading ? (
        <SkeletonFeed />
      ) : error ? (
        <p className="feedback error feed-error" role="alert">
          {error}
        </p>
      ) : posts.length === 0 ? (
        <p className="empty-state">No posts yet. Be the first!</p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
