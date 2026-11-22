"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/lib/posts";
import PostFeed from "./PostFeed";
import ShareBox from "./ShareBox";

export default function Wall() {
  const [authorName, setAuthorName] = useLocalStorage("wall-author-name", "Your Name");
  const { posts, loading, error, realtimeError, addPost } = usePosts();

  function handleShare(message: string, image: File | null): Promise<Post> {
    return addPost(authorName, message, image);
  }

  return (
    <section className="main-column" aria-label="Wall">
      <h2 className="wall-heading">Wall</h2>
      <ShareBox authorName={authorName} onAuthorNameChange={setAuthorName} onShare={handleShare} />
      <PostFeed posts={posts} loading={loading} error={error} />
      {realtimeError ? (
        <p className="feedback error" role="status">
          {realtimeError}
        </p>
      ) : null}
    </section>
  );
}
