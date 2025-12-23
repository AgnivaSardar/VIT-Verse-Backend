import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = Router();
const subscriptionController = SubscriptionController;

router.post("/subscribe", requireAuth, subscriptionController.subscribe);
router.post("/unsubscribe", requireAuth, subscriptionController.unsubscribe);
router.get("/mine", requireAuth, subscriptionController.listMySubscriptions);
export default router;