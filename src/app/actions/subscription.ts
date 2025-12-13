"use server";

import payjp from "payjp";

const client = payjp(process.env.PAYJP_SECRET_KEY!);

export async function createSubscription(
  token: string,
  email: string,
  planId: string = "basic_plan",
) {
  try {
    console.log("顧客作成開始...");

    const customer = await client.customers.create({
      card: token,
      email: email,
    });

    console.log("顧客作成成功:", customer.id);

    const subscription = await client.subscriptions.create({
      customer: customer.id,
      plan: planId,
    });

    console.log("サブスクリプション作成成功:", subscription.id);

    return {
      success: true,
      data: {
        customerId: customer.id,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      },
    };
  } catch (error) {
    console.error("エラー詳細:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
