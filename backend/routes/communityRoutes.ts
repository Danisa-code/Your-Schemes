/**
 * Community Routes — REST and Server-Sent Events (SSE) endpoints for real-time community forum.
 */

import { Router, Request, Response } from "express";
import * as communityService from "../services/communityService.js";

const router = Router();

// ------------------------------------------------------------------
// Real-Time SSE Stream Endpoint
// ------------------------------------------------------------------

router.get("/events", (req: Request, res: Response) => {
  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: new Date().toISOString() })}\n\n`);

  // Listener for events
  const onCommunityEvent = (event: communityService.CommunityEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  communityService.communityEmitter.on("event", onCommunityEvent);

  // Heartbeat ping every 25 seconds to keep the connection alive through proxies
  const heartbeat = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 25000);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    communityService.communityEmitter.off("event", onCommunityEvent);
  });
});

// ------------------------------------------------------------------
// Posts Endpoints
// ------------------------------------------------------------------

// GET /api/community/posts
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const { tag } = req.query;
    const posts = await communityService.getAllPosts(tag as string);
    res.json(posts);
  } catch (err: any) {
    console.error("[communityRoutes] getPosts error:", err.message);
    res.status(500).json({ error: "Failed to fetch community posts", message: err.message });
  }
});

// POST /api/community/posts
router.post("/posts", async (req: Request, res: Response) => {
  try {
    const { author, authorEmail, authorSub, avatar, village, district, title, content, tag } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const newPost = await communityService.createPost({
      author: author || "Farmer",
      authorEmail,
      authorSub,
      avatar,
      village,
      district,
      title,
      content,
      tag,
    });

    res.status(201).json(newPost);
  } catch (err: any) {
    console.error("[communityRoutes] createPost error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/community/posts/:id
router.get("/posts/:id", async (req: Request, res: Response) => {
  try {
    const post = await communityService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/community/posts/:id
router.put("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { title, content, tag, userSub, userEmail } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const updated = await communityService.editPost(req.params.id, {
      title,
      content,
      tag,
      userSub,
      userEmail,
    });

    res.json(updated);
  } catch (err: any) {
    console.error("[communityRoutes] editPost error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/community/posts/:id
router.delete("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { userSub, userEmail } = req.body;
    await communityService.deletePost(req.params.id, { userSub, userEmail });
    res.json({ success: true, message: "Post deleted successfully." });
  } catch (err: any) {
    console.error("[communityRoutes] deletePost error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/community/posts/:id/like
router.post("/posts/:id/like", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const identifier = userId || req.ip || "anonymous_farmer";
    const post = await communityService.toggleLikePost(req.params.id, identifier);
    res.json(post);
  } catch (err: any) {
    console.error("[communityRoutes] likePost error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// Comments Endpoints
// ------------------------------------------------------------------

// GET /api/community/posts/:id/comments
router.get("/posts/:id/comments", async (req: Request, res: Response) => {
  try {
    const comments = await communityService.getCommentsByPostId(req.params.id);
    res.json(comments);
  } catch (err: any) {
    console.error("[communityRoutes] getComments error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/community/posts/:id/comments
router.post("/posts/:id/comments", async (req: Request, res: Response) => {
  try {
    const { author, authorEmail, authorSub, avatar, text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    const comment = await communityService.addComment({
      postId: req.params.id,
      author: author || "Farmer",
      authorEmail,
      authorSub,
      avatar,
      text,
    });

    res.status(201).json(comment);
  } catch (err: any) {
    console.error("[communityRoutes] addComment error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/community/comments/:id
router.put("/comments/:id", async (req: Request, res: Response) => {
  try {
    const { text, userSub } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    const updated = await communityService.editComment(req.params.id, text, userSub);
    res.json(updated);
  } catch (err: any) {
    console.error("[communityRoutes] editComment error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/community/comments/:id
router.delete("/comments/:id", async (req: Request, res: Response) => {
  try {
    const { userSub } = req.body;
    await communityService.deleteComment(req.params.id, userSub);
    res.json({ success: true, message: "Comment deleted successfully." });
  } catch (err: any) {
    console.error("[communityRoutes] deleteComment error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/community/comments/:id/like
router.post("/comments/:id/like", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const identifier = userId || req.ip || "anonymous_farmer";
    const comment = await communityService.toggleLikeComment(req.params.id, identifier);
    res.json(comment);
  } catch (err: any) {
    console.error("[communityRoutes] likeComment error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
