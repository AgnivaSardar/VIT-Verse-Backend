import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";

const router = Router();
const subscriptionController = SubscriptionController;

router.post("/subscribe", subscriptionController.subscribe);
router.post("/unsubscribe", subscriptionController.unsubscribe);
export default router;