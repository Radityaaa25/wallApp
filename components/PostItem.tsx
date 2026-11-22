"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/posts";

type PostItemProps = {
  post: Post;
};

function formatRelativeTime(date: Date, now: number): string {
  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export default function PostItem({ post }: PostItemProps) {
  const createdAt = new Date(post.created_at);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <article className="post">
      <div className="post-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="post-avatar" src="/profile-placeholder.svg" alt="" width={38} height={38} />
        <div className="post-content">
          <span className="post-author">{post.author_name || "Anonymous"} wrote:</span>
          <p className="post-message">{post.message}</p>
          {post.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img className="post-image" src={post.image_url} alt="Photo attached to post" />
          ) : null}
          <time className="post-time" dateTime={post.created_at} title={createdAt.toLocaleString()}>
            {formatRelativeTime(createdAt, now)}
          </time>
        </div>
      </div>
    </article>
  );
}
