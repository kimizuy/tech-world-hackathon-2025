declare module "payjp" {
  interface Card {
    number: string;
    exp_month: string;
    exp_year: string;
    cvc: string;
  }

  interface Token {
    id: string;
    object: "token";
    card: object;
    created: number;
    livemode: boolean;
    used: boolean;
  }

  interface Customer {
    id: string;
    object: "customer";
    email: string;
    cards: object;
    created: number;
    livemode: boolean;
  }

  interface Subscription {
    id: string;
    object: "subscription";
    status: string;
    current_period_end: number;
    customer: string;
    plan: string;
    created: number;
    livemode: boolean;
  }

  interface PayjpClient {
    tokens: {
      create(params: { card: Card }): Promise<Token>;
    };
    customers: {
      create(params: { card: string; email: string }): Promise<Customer>;
    };
    subscriptions: {
      create(params: { customer: string; plan: string }): Promise<Subscription>;
      retrieve(subscriptionId: string): Promise<Subscription>;
      cancel(subscriptionId: string): Promise<Subscription>;
    };
  }

  function payjp(secretKey: string): PayjpClient;
  export default payjp;
}
