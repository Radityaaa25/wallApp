"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/posts";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_MESSAGE_LENGTH = 280;

type ShareBoxProps = {
  authorName: string;
  onAuthorNameChange: (name: string) => void;
  onShare: (message: string, image: File | null) => Promise<Post>;
};

export default function ShareBox({
  authorName,
  onAuthorNameChange,
  onShare
}: ShareBoxProps) {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const imagePreview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  const messageLength = Array.from(message).length;
  const tooLong = messageLength > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    setFeedback(null);
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setFeedback("Choose a JPG, PNG, WEBP, or GIF image.");
      setFeedbackIsError(true);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFeedback("Photo must be 5 MB or smaller.");
      setFeedbackIsError(true);
      return;
    }
    setImage(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || tooLong || submitting) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await onShare(trimmedMessage, image);
      setMessage("");
      setImage(null);
      setFeedback("Your post was shared.");
      setFeedbackIsError(false);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "The post could not be shared. Check your Supabase configuration and try again."
      );
      setFeedbackIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel share-panel" aria-label="Write a post">
      <div className="share-heading">
        <span className="share-heading-icon" aria-hidden="true">
          ▤
        </span>
        <span>Write something...</span>
      </div>
      <form onSubmit={submit}>
        <div className="share-composer">
          <label className="sr-only" htmlFor="wall-message">
            What&apos;s on your mind?
          </label>
          <Textarea
            id="wall-message"
            className="message-input"
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="What's on your mind?"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-describedby="character-count"
          />
          {imagePreview ? (
            <div className="photo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Selected photo preview" />
              <button
                type="button"
                className="remove-photo"
                aria-label="Remove selected photo"
                onClick={() => setImage(null)}
              >
                ×
              </button>
            </div>
          ) : null}
          <div className="composer-toolbar">
            <div className="toolbar-actions">
              <label className="attach-button" htmlFor="photo-upload">
                <span aria-hidden="true">▧</span> Photo
              </label>
              <input
                id="photo-upload"
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={chooseImage}
                disabled={submitting}
              />
              <span
                id="character-count"
                className={`character-count${messageLength >= 250 || tooLong ? " near-limit" : ""}`}
                aria-live="polite"
              >
                {messageLength}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <Button
              className="share-button"
              type="submit"
              disabled={!message.trim() || tooLong || submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Sharing...
                </>
              ) : (
                "Share"
              )}
            </Button>
          </div>
        </div>
        <label className="name-control" htmlFor="author-name">
          Your name
          <input
            id="author-name"
            className="name-input"
            type="text"
            maxLength={60}
            value={authorName}
            onChange={(event) => onAuthorNameChange(event.target.value)}
            placeholder="Your Name"
          />
        </label>
      </form>
      {feedback ? (
        <p
          className={`feedback${feedbackIsError ? " error" : " success"}`}
          role={feedbackIsError ? "alert" : "status"}
        >
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
