# Create order: `create_paypal_order`

Read this whole file, in one go, before writing the function that starts a payment. It contains, in order:

- **Rules**: what the function must do, in order. The example follows them.
- **Function**: the complete `create_paypal_order/index.ts`, built on [setup.md](setup.md).

## Rules

- Accept the cart as product ids and quantities. Validate each item, load prices and availability from the canonical table, and compute the total on the server. Never trust a price or total sent by the browser. The example prices from a `products` table with `id, name, price numeric(12,2), image_url, is_active`; adapt it to the app's catalog.
- With login, reject a missing, invalid or anonymous session with HTTP 401 before reading the database, and bind the order to that user. Without login, the order keeps `user_id` null, but a signed-in buyer still owns their order.
- Insert the `pending` order row BEFORE calling PayPal; the row id is the `PayPal-Request-Id` idempotency key.
- Call `POST {base}/v2/checkout/orders` with `intent: "CAPTURE"`, the amount as a two-decimal string, and header `PayPal-Request-Id: <orders row id>`.
- Save the returned PayPal order id on the same pending row (`paypal_order_id`) and return it only after that update succeeds.
- When PayPal rejects the order, log its `debug_id` and mark the row `failed`. Never log or return the Secret, the Basic authorization header or the access token.
- Required buyer inputs (name, date, seat) are validated before the order is created; the browser rebuilds the buttons when they change, as [checkout-button.md](checkout-button.md) shows.

## Function

```ts
// create_paypal_order/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

// Store currency: must match orders.currency and the value returned by paypal_config
const PAYPAL_CURRENCY = "USD";
// true when the app has a login system; false only for apps without login (guest checkout)
const REQUIRE_LOGIN = true;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
    product_id: string;
    quantity: number;
}

interface CreateOrderRequest {
    items: CartItem[];
}

function ok(data: any): Response {
    return new Response(
        JSON.stringify({ code: "SUCCESS", message: "ok", data }),
        {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
        }
    );
}

function fail(msg: string, code = 400): Response {
    return new Response(
        JSON.stringify({ code: "FAIL", message: msg }),
        {
            status: code,
            headers: { "Content-Type": "application/json", ...corsHeaders }
        }
    );
}

import { getPayPalAccessToken, paypalDebugId } from "../_shared/paypal.ts";

// Returns the signed-in, non-anonymous buyer, or null (no session, the anon key, an invalid token or an anonymous session)
async function currentBuyer(req: Request) {
    const jwt = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!jwt) return null;
    const { data: { user }, error } = await supabase.auth.getUser(jwt);
    return error || !user || user.is_anonymous ? null : user;
}

function validateCreateOrderRequest(request: CreateOrderRequest): void {
    if (!request.items?.length) {
        throw new Error("Items cannot be empty");
    }
    for (const item of request.items) {
        if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error("Invalid item data");
        }
    }
}

// Prices always come from the canonical products table, never from the client
async function priceCart(items: CartItem[]) {
    const productIds = [...new Set(items.map(item => item.product_id))];
    const { data: products, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, is_active")
        .in("id", productIds);

    if (error) throw new Error(`Failed to load products: ${error.message}`);

    let totalCents = 0;
    const orderItems = items.map(item => {
        const product = products?.find(p => p.id === item.product_id);
        if (!product || !product.is_active) {
            throw new Error(`Product is unavailable: ${item.product_id}`);
        }
        const unitCents = Math.round(Number(product.price) * 100);
        totalCents += unitCents * item.quantity;
        return {
            product_id: product.id,
            name: product.name,
            price: unitCents / 100,
            quantity: item.quantity,
            image_url: product.image_url || "",
        };
    });

    if (totalCents <= 0) throw new Error("Order total must be greater than zero");

    // PayPal expects a decimal string with two fraction digits
    return { orderItems, totalAmount: (totalCents / 100).toFixed(2) };
}

async function markOrderFailed(orderId: string, debugId: string): Promise<void> {
    await supabase
        .from("orders")
        .update({ status: "failed", paypal_debug_id: debugId })
        .eq("id", orderId)
        .eq("status", "pending");
}

Deno.serve(async (req) => {
    try {
        if (req.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }
        if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

        const request: CreateOrderRequest = await req.json();
        validateCreateOrderRequest(request);

        const user = await currentBuyer(req);
        if (REQUIRE_LOGIN && !user) return fail("Please sign in to purchase", 401);

        const { orderItems, totalAmount } = await priceCart(request.items);

        // 1. Insert the pending order first: its id is the PayPal-Request-Id (idempotency key)
        const { data: order, error } = await supabase
            .from("orders")
            .insert({
                // Guest orders (REQUIRE_LOGIN = false, no session) keep user_id null
                user_id: user?.id ?? null,
                items: orderItems,
                total_amount: totalAmount,
                currency: PAYPAL_CURRENCY,
                status: "pending",
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create order: ${error.message}`);

        // 2. Create the PayPal order (Orders v2, intent CAPTURE)
        const { token, baseUrl } = await getPayPalAccessToken();
        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "PayPal-Request-Id": order.id,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        reference_id: order.id,
                        custom_id: order.id,
                        description: orderItems
                            .map(item => `${item.name} x${item.quantity}`)
                            .join(", ")
                            .slice(0, 127),
                        amount: { currency_code: PAYPAL_CURRENCY, value: totalAmount },
                    },
                ],
            }),
        });
        const body = await response.json().catch(() => ({}));

        if (!response.ok || !body.id) {
            const debugId = paypalDebugId(response, body);
            console.error(`PayPal create order failed (debug_id=${debugId}, http=${response.status}):`, body.name, body.message);
            await markOrderFailed(order.id, debugId);
            throw new Error("Failed to create the PayPal order");
        }

        // 3. Link the PayPal order id to the pending row
        const { data: linkedOrder, error: linkError } = await supabase
            .from("orders")
            .update({ paypal_order_id: body.id })
            .eq("id", order.id).eq("status", "pending")
            .select("id").maybeSingle();
        if (linkError || !linkedOrder) {
            throw new Error("Unable to save the PayPal order. No payment has been approved; please retry checkout.");
        }

        return ok({
            paypalOrderId: body.id,
            orderId: order.id,
            amount: totalAmount,
            currency: PAYPAL_CURRENCY,
        });
    } catch (error) {
        console.error("Create PayPal order failed:", error);
        return fail(error instanceof Error ? error.message : "Payment processing failed", 500);
    }
});
```
