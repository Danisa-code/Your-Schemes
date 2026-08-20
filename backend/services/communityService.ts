/**
 * Real-Time Community Service
 * Manages persistent community posts, comments, likes, and Server-Sent Events (SSE) broadcasting.
 * No fake/demo data is generated.
 */

import fs from "fs";
import path from "path";
import { EventEmitter } from "events";
import { supabase } from "../config/supabase.js";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface CommunityComment {
  id: string;
  postId: string;
  author: string;
  authorEmail?: string;
  authorSub?: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  isEdited?: boolean;
  editedAt?: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  authorEmail?: string;
  authorSub?: string;
  avatar: string;
  village: string;
  district?: string;
  createdAt: string;
  title: string;
  content: string;
  tag: "General" | "Fertilizer" | "Pest Alert" | "Pumps" | "Market";
  likes: number;
  likedBy: string[];
  repliesCount: number;
  isEdited?: boolean;
  editedAt?: string;
}

export interface CommunityEvent {
  type: 
    | "POST_CREATED"
    | "POST_UPDATED"
    | "POST_DELETED"
    | "POST_LIKED"
    | "COMMENT_CREATED"
    | "COMMENT_UPDATED"
    | "COMMENT_DELETED"
    | "COMMENT_LIKED";
  payload: any;
}

// ------------------------------------------------------------------
// Real-time Event Emitter
// ------------------------------------------------------------------

export const communityEmitter = new EventEmitter();
communityEmitter.setMaxListeners(200);

// ------------------------------------------------------------------
// Persistence Layer (Disk JSON + Supabase Sync)
// ------------------------------------------------------------------

const DB_DIR = path.join(process.cwd(), "backend", "database", "json");
const POSTS_FILE = path.join(DB_DIR, "community_posts.json");
const COMMENTS_FILE = path.join(DB_DIR, "community_comments.json");

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function loadPostsFromDisk(): CommunityPost[] {
  ensureDbDir();
  if (fs.existsSync(POSTS_FILE)) {
    try {
      const raw = fs.readFileSync(POSTS_FILE, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("[communityService] Error reading community_posts.json:", e);
    }
  }
  return [];
}

function savePostsToDisk(posts: CommunityPost[]) {
  ensureDbDir();
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");
  } catch (e) {
    console.error("[communityService] Error writing community_posts.json:", e);
  }
}

function loadCommentsFromDisk(): CommunityComment[] {
  ensureDbDir();
  if (fs.existsSync(COMMENTS_FILE)) {
    try {
      const raw = fs.readFileSync(COMMENTS_FILE, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("[communityService] Error reading community_comments.json:", e);
    }
  }
  return [];
}

function saveCommentsToDisk(comments: CommunityComment[]) {
  ensureDbDir();
  try {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), "utf8");
  } catch (e) {
    console.error("[communityService] Error writing community_comments.json:", e);
  }
}

// In-memory active stores for fast real-time access
let postsStore: CommunityPost[] = loadPostsFromDisk();
let commentsStore: CommunityComment[] = loadCommentsFromDisk();

// Basic Profanity & XSS Sanitization
const BANNED_WORDS = ["spam", "abuse", "xxx", "hate", "attack"];

function sanitizeText(text: string): string {
  if (!text) return "";
  // Strip HTML tags
  return text.replace(/<[^>]*>?/gm, "").trim();
}

function validateContent(text: string): boolean {
  const lower = text.toLowerCase();
  for (const w of BANNED_WORDS) {
    if (lower.includes(w)) return false;
  }
  return true;
}

// ------------------------------------------------------------------
// Service Methods
// ------------------------------------------------------------------

export async function getAllPosts(tag?: string): Promise<CommunityPost[]> {
  let result = [...postsStore];
  if (tag && tag !== "All") {
    result = result.filter(p => p.tag.toLowerCase() === tag.toLowerCase());
  }
  // Sort descending by createdAt
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPostById(id: string): Promise<CommunityPost | null> {
  return postsStore.find(p => p.id === id) || null;
}

export async function createPost(params: {
  author: string;
  authorEmail?: string;
  authorSub?: string;
  avatar?: string;
  village?: string;
  district?: string;
  title: string;
  content: string;
  tag?: CommunityPost["tag"];
}): Promise<CommunityPost> {
  const cleanTitle = sanitizeText(params.title);
  const cleanContent = sanitizeText(params.content);

  if (cleanTitle.length < 3) {
    throw new Error("Post title must be at least 3 characters long.");
  }
  if (cleanContent.length < 5) {
    throw new Error("Post content must be at least 5 characters long.");
  }
  if (!validateContent(cleanTitle) || !validateContent(cleanContent)) {
    throw new Error("Your post contains inappropriate or prohibited words.");
  }

  const validTag: CommunityPost["tag"] = ["General", "Fertilizer", "Pest Alert", "Pumps", "Market"].includes(params.tag as any)
    ? (params.tag as CommunityPost["tag"])
    : "General";

  const newPost: CommunityPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    author: sanitizeText(params.author) || "Farmer",
    authorEmail: params.authorEmail,
    authorSub: params.authorSub,
    avatar: params.avatar || "https://lh3.googleusercontent.com/a/default-user=s96-c",
    village: sanitizeText(params.village || params.district || "Tamil Nadu"),
    district: params.district,
    createdAt: new Date().toISOString(),
    title: cleanTitle,
    content: cleanContent,
    tag: validTag,
    likes: 0,
    likedBy: [],
    repliesCount: 0,
  };

  postsStore.unshift(newPost);
  savePostsToDisk(postsStore);

  // Broadcast real-time event to all connected clients
  communityEmitter.emit("event", {
    type: "POST_CREATED",
    payload: newPost,
  });

  return newPost;
}

export async function editPost(id: string, params: {
  title: string;
  content: string;
  tag?: CommunityPost["tag"];
  userSub?: string;
  userEmail?: string;
}): Promise<CommunityPost> {
  const post = postsStore.find(p => p.id === id);
  if (!post) {
    throw new Error("Post not found.");
  }

  // Authorization check (if sub/email is present)
  if (post.authorSub && params.userSub && post.authorSub !== params.userSub) {
    throw new Error("You are not authorized to edit this post.");
  }

  const cleanTitle = sanitizeText(params.title);
  const cleanContent = sanitizeText(params.content);

  if (cleanTitle.length < 3 || cleanContent.length < 5) {
    throw new Error("Title and content must meet minimum length requirements.");
  }
  if (!validateContent(cleanTitle) || !validateContent(cleanContent)) {
    throw new Error("Post contains prohibited words.");
  }

  post.title = cleanTitle;
  post.content = cleanContent;
  if (params.tag) post.tag = params.tag;
  post.isEdited = true;
  post.editedAt = new Date().toISOString();

  savePostsToDisk(postsStore);

  communityEmitter.emit("event", {
    type: "POST_UPDATED",
    payload: post,
  });

  return post;
}

export async function deletePost(id: string, params?: { userSub?: string; userEmail?: string }): Promise<boolean> {
  const index = postsStore.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error("Post not found.");
  }

  const post = postsStore[index];
  if (post.authorSub && params?.userSub && post.authorSub !== params.userSub) {
    throw new Error("You are not authorized to delete this post.");
  }

  postsStore.splice(index, 1);
  savePostsToDisk(postsStore);

  // Remove associated comments
  commentsStore = commentsStore.filter(c => c.postId !== id);
  saveCommentsToDisk(commentsStore);

  communityEmitter.emit("event", {
    type: "POST_DELETED",
    payload: { id },
  });

  return true;
}

export async function toggleLikePost(id: string, userIdOrEmail: string): Promise<CommunityPost> {
  const post = postsStore.find(p => p.id === id);
  if (!post) {
    throw new Error("Post not found.");
  }

  if (!post.likedBy) post.likedBy = [];

  const likedIndex = post.likedBy.indexOf(userIdOrEmail);
  if (likedIndex === -1) {
    post.likedBy.push(userIdOrEmail);
    post.likes = post.likedBy.length;
  } else {
    post.likedBy.splice(likedIndex, 1);
    post.likes = Math.max(0, post.likedBy.length);
  }

  savePostsToDisk(postsStore);

  communityEmitter.emit("event", {
    type: "POST_LIKED",
    payload: { id: post.id, likes: post.likes, likedBy: post.likedBy },
  });

  return post;
}

// ------------------------------------------------------------------
// Comments
// ------------------------------------------------------------------

export async function getCommentsByPostId(postId: string): Promise<CommunityComment[]> {
  return commentsStore
    .filter(c => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function addComment(params: {
  postId: string;
  author: string;
  authorEmail?: string;
  authorSub?: string;
  avatar?: string;
  text: string;
}): Promise<CommunityComment> {
  const post = postsStore.find(p => p.id === params.postId);
  if (!post) {
    throw new Error("Post not found.");
  }

  const cleanText = sanitizeText(params.text);
  if (cleanText.length < 2) {
    throw new Error("Comment is too short.");
  }
  if (!validateContent(cleanText)) {
    throw new Error("Comment contains prohibited words.");
  }

  const comment: CommunityComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    postId: params.postId,
    author: sanitizeText(params.author) || "Farmer",
    authorEmail: params.authorEmail,
    authorSub: params.authorSub,
    avatar: params.avatar || "https://lh3.googleusercontent.com/a/default-user=s96-c",
    text: cleanText,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
  };

  commentsStore.push(comment);
  saveCommentsToDisk(commentsStore);

  // Update reply count on post
  post.repliesCount = commentsStore.filter(c => c.postId === params.postId).length;
  savePostsToDisk(postsStore);

  communityEmitter.emit("event", {
    type: "COMMENT_CREATED",
    payload: { comment, postId: params.postId, repliesCount: post.repliesCount },
  });

  return comment;
}

export async function editComment(commentId: string, text: string, userSub?: string): Promise<CommunityComment> {
  const comment = commentsStore.find(c => c.id === commentId);
  if (!comment) {
    throw new Error("Comment not found.");
  }

  if (comment.authorSub && userSub && comment.authorSub !== userSub) {
    throw new Error("You are not authorized to edit this comment.");
  }

  const cleanText = sanitizeText(text);
  if (cleanText.length < 2) {
    throw new Error("Comment is too short.");
  }
  if (!validateContent(cleanText)) {
    throw new Error("Comment contains prohibited words.");
  }

  comment.text = cleanText;
  comment.isEdited = true;
  comment.editedAt = new Date().toISOString();

  saveCommentsToDisk(commentsStore);

  communityEmitter.emit("event", {
    type: "COMMENT_UPDATED",
    payload: comment,
  });

  return comment;
}

export async function deleteComment(commentId: string, userSub?: string): Promise<boolean> {
  const index = commentsStore.findIndex(c => c.id === commentId);
  if (index === -1) {
    throw new Error("Comment not found.");
  }

  const comment = commentsStore[index];
  if (comment.authorSub && userSub && comment.authorSub !== userSub) {
    throw new Error("You are not authorized to delete this comment.");
  }

  const postId = comment.postId;
  commentsStore.splice(index, 1);
  saveCommentsToDisk(commentsStore);

  // Update post replies count
  const post = postsStore.find(p => p.id === postId);
  if (post) {
    post.repliesCount = commentsStore.filter(c => c.postId === postId).length;
    savePostsToDisk(postsStore);
  }

  communityEmitter.emit("event", {
    type: "COMMENT_DELETED",
    payload: { commentId, postId, repliesCount: post?.repliesCount || 0 },
  });

  return true;
}

export async function toggleLikeComment(commentId: string, userIdOrEmail: string): Promise<CommunityComment> {
  const comment = commentsStore.find(c => c.id === commentId);
  if (!comment) {
    throw new Error("Comment not found.");
  }

  if (!comment.likedBy) comment.likedBy = [];

  const likedIndex = comment.likedBy.indexOf(userIdOrEmail);
  if (likedIndex === -1) {
    comment.likedBy.push(userIdOrEmail);
    comment.likes = comment.likedBy.length;
  } else {
    comment.likedBy.splice(likedIndex, 1);
    comment.likes = Math.max(0, comment.likedBy.length);
  }

  saveCommentsToDisk(commentsStore);

  communityEmitter.emit("event", {
    type: "COMMENT_LIKED",
    payload: { commentId: comment.id, postId: comment.postId, likes: comment.likes, likedBy: comment.likedBy },
  });

  return comment;
}
