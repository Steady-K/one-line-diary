import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { subscriptionService } from "@/lib/supabase";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    apiVersion: "2023-10-16",
  }
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 결제 성공 처리
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        await subscriptionService.createSubscription({
          user_id: userId,
          plan_type: "premium",
          status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        });
      }
    }

    // 구독 취소 처리
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await subscriptionService.updateSubscriptionByStripeId(subscription.id, {
        status: "cancelled",
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook 처리 오류:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
