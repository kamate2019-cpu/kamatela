// Copy to src/lib/waffo.ts as written. Browser code: it calls the Waffo Edge Functions, never Waffo itself.
// src/lib/waffo.ts
import { supabase } from "@/client/supabase";

export type OrderStatus = "pending" | "completed" | "canceled" | "refund_pending" | "refunded";
export type SubscriptionStatus = "pending" | "active" | "canceling" | "past_due" | "canceled";
export type PaymentState = {
    status: OrderStatus | SubscriptionStatus;
    verified: boolean;
    testMode?: boolean | null;
    checkoutUrl?: string | null;   // present only while the checkout page can still be paid on
    currentPeriodEnd?: string | null;
    willRenew?: boolean | null;
    refundFailed?: boolean;
};
export type PaymentRef = { order_id: string } | { subscription_id: string };
// Rows of the example tables. Orders carry `total_amount`, subscriptions `amount`: show both with formatMoney.
export type OrderRow = {
    id: string;
    user_id: string | null;
    items: { product_id: string; name: string; price: number; quantity: number; image_url?: string | null }[];
    total_amount: number | string;
    currency: string;
    status: OrderStatus;
    checkout_url: string | null;
    test_mode: boolean | null;
    completed_at: string | null;
    created_at: string;
};
export type SubscriptionRow = {
    id: string;
    user_id: string;
    plan_id: string;
    amount: number | string;
    currency: string;
    status: SubscriptionStatus;
    checkout_url: string | null;
    current_period_end: string | null;
    will_renew: boolean | null;
    test_mode: boolean | null;
    created_at: string;
};
type CheckoutStart = { checkoutUrl: string; orderId?: string; subscriptionId?: string };

// Money for display. Numeric columns may arrive as numbers or strings: never call toFixed on them directly.
export function formatMoney(amount: number | string | null | undefined, currency: string | null | undefined): string {
    const value = Number(amount);
    if (amount === null || amount === undefined || amount === "" || !Number.isFinite(value)) return "—";
    return new Intl.NumberFormat(undefined, { style: "currency", currency: (currency || "USD").toUpperCase() }).format(value);
}

// Where buyers manage what they bought, signed in with the email they paid with: payment method, invoices, renewal.
export const WAFFO_CUSTOMER_PORTAL = "https://pancake.waffo.ai/consumer/portal/login";

// Returns the inner data object of a Waffo Edge Function, or throws its message (with the HTTP status).
export async function callWaffo<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
    const { data, error } = await supabase.functions.invoke(name, { body });
    // A non-2xx answer arrives as an error whose context is the Response carrying the same envelope.
    const envelope = error ? await error.context?.json?.().catch(() => null) : data;
    if (envelope?.code !== "SUCCESS") {
        throw Object.assign(
            new Error(envelope?.message ?? "Payment is unavailable. Check the Waffo configuration."),
            { status: error?.context?.status as number | undefined },
        );
    }
    return envelope.data as T;
}

let configCheck: Promise<void> | null = null;

// Whether Waffo is configured for this app. A success is remembered for the page load however often components
// mount or re-render; a failure is not, so the next mount (for example after signing in) asks again.
// Pass true only from a "Retry" button.
export function waffoReady(retry = false): Promise<void> {
    if (!configCheck || retry) {
        const check: Promise<void> = callWaffo<unknown>("waffo_config").then(() => undefined, (error) => {
            if (configCheck === check) configCheck = null;
            throw error;
        });
        configCheck = check;
    }
    return configCheck;
}

// The checkout this tab started. Storage can be unavailable (blocked site data): checkout then still works,
// only the recovery after a reload is lost.
const PENDING_KEY = "waffo_pending_payment";
const pendingRef = {
    get(): PaymentRef | null {
        try {
            return JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? "null");
        } catch {
            return null;
        }
    },
    set(ref: PaymentRef) {
        try {
            sessionStorage.setItem(PENDING_KEY, JSON.stringify(ref));
        } catch {
            // Not stored.
        }
    },
    clear() {
        try {
            sessionStorage.removeItem(PENDING_KEY);
        } catch {
            // Nothing stored.
        }
    },
};

// Start a checkout; call it directly from the click handler. The hosted page opens in a new tab so the app keeps
// its state. The tab is opened before the first await: a tab opened after one is blocked as a popup.
export async function startCheckout(body: { items: { product_id: string; quantity: number }[] } | { plan_id: string }) {
    const tab = window.open("", "_blank");
    try {
        const started = await callWaffo<CheckoutStart>("create_waffo_checkout", body);
        const ref: PaymentRef = started.orderId ? { order_id: started.orderId } : { subscription_id: started.subscriptionId! };
        if (tab) {
            tab.opener = null;
            tab.location.replace(started.checkoutUrl);
        }
        pendingRef.set(ref);
        // opened is false when the browser blocked the tab: the page must then show checkoutUrl as a link.
        return { checkoutUrl: started.checkoutUrl, ref, opened: !!tab };
    } catch (error) {
        tab?.close();
        throw error;
    }
}

// Asks the server until the payment is verified or no longer pending. A failed request (network, Waffo busy)
// is tried again; a refusal (not signed in, not your order) is thrown.
// The buyer closed the payment panel: an unfinished checkout is no longer brought back on load. If it is paid
// later, order history and the membership page still pick it up. With a ref, only that checkout is forgotten.
export function forgetPending(ref?: PaymentRef) {
    if (ref && JSON.stringify(pendingRef.get()) !== JSON.stringify(ref)) return;
    pendingRef.clear();
    resumed = null;
}

export async function waitForPayment(ref: PaymentRef, delays = [2, 3, 5, 8, 13]): Promise<PaymentState> {
    let state: PaymentState = { status: "pending", verified: false };
    for (const seconds of [0, ...delays]) {
        if (seconds) await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
        try {
            state = await callWaffo<PaymentState>("verify_waffo_payment", ref);
            if (state.verified || state.status !== "pending") break;
        } catch (error) {
            const status = (error as { status?: number }).status;
            if (status && status < 500 && status !== 429) throw error;
        }
    }
    if (state.status !== "pending") pendingRef.clear();
    return state;
}

// /payment-success?order=<id> or ?subscription=<id>: the page Waffo sends the buyer back to.
export function confirmPayment(params: URLSearchParams): Promise<PaymentState> {
    const subscription = params.get("subscription");
    return waitForPayment(subscription ? { subscription_id: subscription } : { order_id: params.get("order") ?? "" });
}

// The checkout this tab started and has not seen the end of. Call it when the app loads and when the tab
// becomes visible again: the buyer may pay and never come back through the success page.
export function resumePending(): Promise<{ ref: PaymentRef; state: PaymentState } | null> {
    if (!resumed || Date.now() - resumed.at > 5000) resumed = { at: Date.now(), result: verifyStored() };
    return resumed.result;
}

let resumed: { at: number; result: ReturnType<typeof verifyStored> } | null = null;

async function verifyStored(): Promise<{ ref: PaymentRef; state: PaymentState } | null> {
    const ref = pendingRef.get();
    if (!ref) return null;
    try {
        const state = await callWaffo<PaymentState>("verify_waffo_payment", ref);
        if (state.status !== "pending") pendingRef.clear();
        return { ref, state };
    } catch (error) {
        const status = (error as { status?: number }).status;
        if (status && status < 500 && status !== 429) pendingRef.clear();
        return null;
    }
}

// Order history and admin orders pages call it with the rows they loaded, before rendering them: orders that
// can still change (unpaid, refund in progress, recently closed) are checked with Waffo, the newest ten of them.
// Calls for the same orders within 5 seconds share one round of requests.
export async function refreshOrders<T extends { id: string; status: string; created_at: string }>(
    rows: T[],
): Promise<(T & { checkoutUrl?: string | null })[]> {
    const recent = Date.now() - 48 * 3600 * 1000;
    const open = rows
        .filter((row) => row.status === "pending" || row.status === "refund_pending" ||
            (row.status === "canceled" && Date.parse(row.created_at) > recent))
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 10)
        .map((row) => row.id);
    const key = open.join(",");
    let round = refreshed.get(key);
    if (!round || Date.now() - round.at > 5000) {
        round = { at: Date.now(), result: verifyOrders(open) };
        refreshed.set(key, round);
    }
    const fresh = await round.result;
    return rows.map((row) => {
        const state = fresh.get(row.id);
        return state ? { ...row, status: state.status, checkoutUrl: state.checkoutUrl } : row;
    });
}

const refreshed = new Map<string, { at: number; result: Promise<Map<string, PaymentState>> }>();

async function verifyOrders(ids: string[]): Promise<Map<string, PaymentState>> {
    const fresh = new Map<string, PaymentState>();
    for (const id of ids) {
        try {
            fresh.set(id, await callWaffo<PaymentState>("verify_waffo_payment", { order_id: id }));
        } catch {
            // The row keeps the status it was loaded with.
        }
    }
    return fresh;
}

const synced = new Map<string, { at: number; result: Promise<PaymentState> }>();

// The membership page and the paywall call it with the user's latest subscription id, from an effect that depends
// on that id (a string), never on the user object. Calls for the same id within 5 seconds share one request.
export function syncSubscription(subscriptionId: string): Promise<PaymentState> {
    const last = synced.get(subscriptionId);
    if (last && Date.now() - last.at < 5000) return last.result;
    const result = callWaffo<PaymentState>("verify_waffo_payment", { subscription_id: subscriptionId });
    synced.set(subscriptionId, { at: Date.now(), result });
    return result;
}

export const cancelSubscription = (subscriptionId: string) =>
    callWaffo<PaymentState>("cancel_waffo_subscription", { subscription_id: subscriptionId });

// Only from the administrator's click on "Refund" for one order. Never call it to refresh a list:
// for a completed order it opens a refund.
export const refundOrder = (orderId: string) =>
    callWaffo<{ status: OrderStatus }>("refund_waffo_payment", { order_id: orderId });
