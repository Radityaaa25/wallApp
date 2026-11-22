"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel, RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { getSupabase, supabase } from "@/lib/supabase";
import type { Post } from "@/lib/posts";

const PHOTO_BUCKET = "wall-photos";
const FEED_LIMIT = 50;

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

function getDatabaseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.startsWith("Supabase is not configured.")) {
    return error.message;
  }
  if (typeof error !== "object" || error === null) return fallback;

  const databaseError: SupabaseErrorLike = {
    code: "code" in error && typeof error.code === "string" ? error.code : undefined,
    message: "message" in error && typeof error.message === "string" ? error.message : undefined
  };
  if (databaseError.code === "42501") {
    return "Supabase denied access to posts. In the SQL Editor, run: GRANT SELECT, INSERT ON public.posts TO anon;";
  }
  if (databaseError.code === "42P01" || databaseError.code === "PGRST205") {
    return "The public.posts table was not found. Run supabase/schema.sql in the Supabase SQL Editor.";
  }
  if (databaseError.code === "42703" || databaseError.code === "PGRST204") {
    return "The posts table is missing a required column. Update it by running supabase/schema.sql in the Supabase SQL Editor.";
  }
  if (databaseError.code === "23514") {
    return "The post was rejected by a database constraint. Check that the message is 1–280 characters and rerun supabase/schema.sql.";
  }
  if (databaseError.message) {
    const code = databaseError.code ? ` (${databaseError.code})` : "";
    return `${fallback}${code}: ${databaseError.message}`;
  }
  return fallback;
}

function mergePosts(...groups: Post[][]): Post[] {
  const postsById = new Map<string, Post>();
  for (const group of groups) {
    for (const post of group) postsById.set(post.id, post);
  }
  return [...postsById.values()]
    .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))
    .slice(0, FEED_LIMIT);
}

function getErrorMessage(error: unknown): string {
  return getDatabaseErrorMessage(
    error,
    "Could not load posts. Please check the Supabase table permissions and try again."
  );
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let channel: RealtimeChannel | null = null;

    async function loadPosts() {
      try {
        const client = getSupabase();
        channel = client
          .channel("wall-posts")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "posts" },
            (payload: RealtimePostgresInsertPayload<Post>) => {
              if (!active) return;
              const insertedPost = payload.new;
              setPosts((current) => {
                if (current.some((post) => post.id === insertedPost.id)) return current;
                return [insertedPost, ...current].slice(0, FEED_LIMIT);
              });
            }
          )
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR" && active) {
              setRealtimeError("Live updates are unavailable. Reload the page to check for new posts.");
            } else if (status === "SUBSCRIBED" && active) {
              setRealtimeError(null);
            }
          });

        const { data, error: queryError } = await client
          .from("posts")
          .select("id, author_name, message, image_url, created_at")
          .order("created_at", { ascending: false })
          .limit(FEED_LIMIT);

        if (queryError) throw queryError;
        if (active) {
          setPosts((current) => mergePosts(data ?? [], current));
          setError(null);
        }
      } catch (loadError) {
        console.error("Failed to load posts from Supabase:", loadError);
        if (active) setError(getErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPosts();
    return () => {
      active = false;
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, []);

  const addPost = useCallback(
    async (authorName: string, message: string, image: File | null): Promise<Post> => {
      const client = getSupabase();
      let imageUrl: string | null = null;

      if (image) {
        const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await client.storage
          .from(PHOTO_BUCKET)
          .upload(filePath, image, { contentType: image.type, upsert: false });
        if (uploadError) {
          console.error("Failed to upload wall photo:", uploadError);
          throw new Error(
            getDatabaseErrorMessage(uploadError, "Failed to upload photo. Please try again.")
          );
        }
        imageUrl = client.storage.from(PHOTO_BUCKET).getPublicUrl(filePath).data.publicUrl;
      }

      const cleanAuthor = authorName.trim().slice(0, 60) || "Anonymous";
      const { data, error: insertError } = await client
        .from("posts")
        .insert({ author_name: cleanAuthor, message, image_url: imageUrl })
        .select("id, author_name, message, image_url, created_at")
        .single();

      if (insertError) {
        console.error("Failed to save wall post:", insertError);
        throw new Error(
          getDatabaseErrorMessage(insertError, "Failed to save your post. Please try again.")
        );
      }

      setPosts((current) => {
        if (current.some((post) => post.id === data.id)) return current;
        return [data, ...current].slice(0, FEED_LIMIT);
      });
      return data;
    },
    []
  );

  return { posts, loading, error, realtimeError, addPost };
}
