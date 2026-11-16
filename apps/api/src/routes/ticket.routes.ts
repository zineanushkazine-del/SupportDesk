import { Router } from "express";
import {
  getTickets,
  postTicket,
  putTicket,
  patchTicket,
} from "../controllers/ticket.controller";
import {
  getTicketComments,
  postTicketComment,
} from "../controllers/comment.controller";
import { requireAuth, requireRole } from "../auth.middleware";
const router = Router();

router.get("/", requireAuth, getTickets);
router.post("/", requireAuth, postTicket);
router.put("/:id", requireAuth, requireRole("agent", "admin"), putTicket);
router.patch("/:id", requireAuth, requireRole("agent", "admin"), patchTicket);
router.get("/:ticketId/comments", requireAuth, getTicketComments);
router.post("/:ticketId/comments", requireAuth, postTicketComment);
export default router;