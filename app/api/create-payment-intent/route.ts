import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js"; 

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any, 
  typescript: true,
});

// Initialize Supabase for Server-Side Checks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🌏 SERVER-SIDE SHIPPING RATES (Source of Truth)
// ✨ UPDATED: USA Rates (5kg=100, 20kg=210). 
const shippingRates: Record<string, { rate10kg: number; rate20kg: number; express10kg?: number; express20kg?: number }> = {
  "Belgium": { rate10kg: 25, rate20kg: 31 },
  "Bulgaria": { rate10kg: 25, rate20kg: 32 },
  "Denmark": { rate10kg: 24, rate20kg: 30 },
  "France": { rate10kg: 24.49, rate20kg: 29.99 },
  "Greece": { rate10kg: 25, rate20kg: 32 },
  "Italy": { rate10kg: 25, rate20kg: 32 },
  "Ireland": { rate10kg: 25, rate20kg: 32 },
  "Croatia": { rate10kg: 25, rate20kg: 32 },
  "Latvia": { rate10kg: 25, rate20kg: 32 },
  "Lithuania": { rate10kg: 25, rate20kg: 32 },
  "Luxembourg": { rate10kg: 25, rate20kg: 32 },
  "Malta": { rate10kg: 25, rate20kg: 32 },
  "Monaco": { rate10kg: 25, rate20kg: 32 },
  "Netherlands": { rate10kg: 25, rate20kg: 32 },
  "Austria": { rate10kg: 25, rate20kg: 31 }, // ✨ ADDED: Austria Rates
  "Poland": { rate10kg: 25, rate20kg: 32 },
  "Portugal": { rate10kg: 25, rate20kg: 32 },
  "Romania": { rate10kg: 25, rate20kg: 32 },
  "Sweden": { rate10kg: 25, rate20kg: 32 },
  "Slovakia": { rate10kg: 25, rate20kg: 32 },
  "Slovenia": { rate10kg: 25, rate20kg: 32 },
  "Spain": { rate10kg: 25, rate20kg: 32 },
  "Czech Republic": { rate10kg: 25, rate20kg: 32 },
  "Hungary": { rate10kg: 25, rate20kg: 32 },
  "Cyprus": { rate10kg: 25, rate20kg: 32 },
  "Albania": { rate10kg: 40, rate20kg: 55 },
  "Bosnia & Herzegovina": { rate10kg: 40, rate20kg: 55 },
  "Kosovo": { rate10kg: 39, rate20kg: 55 },
  "Moldova": { rate10kg: 39, rate20kg: 55 },
  "Norway": { rate10kg: 40, rate20kg: 55 },
  "Turkey": { rate10kg: 40, rate20kg: 55 },
  "Ukraine": { rate10kg: 40, rate20kg: 55 },
  "Switzerland": { rate10kg: 35, rate20kg: 51 },
  "Iceland": { rate10kg: 39, rate20kg: 54 },
  "Liechtenstein": { rate10kg: 39, rate20kg: 54 },
  // ✨ USA UPDATED: Standard (5kg tier) = 100, Heavy (20kg tier) = 210
  "United States": { rate10kg: 100, rate20kg: 210 },
  "Chile": { rate10kg: 79, rate20kg: 150 },
  "Egypt": { rate10kg: 65, rate20kg: 78 },
  "Algeria": { rate10kg: 65, rate20kg: 78 },
  "Morocco": { rate10kg: 55, rate20kg: 78 },
  "Tunisia": { rate10kg: 55, rate20kg: 78 },
  "South Africa": { rate10kg: 65, rate20kg: 105 },
  "Senegal": { rate10kg: 65, rate20kg: 105 },
  "Cameroon": { rate10kg: 65, rate20kg: 105 },
  "Kenya": { rate10kg: 65, rate20kg: 105 },
  "Nigeria": { rate10kg: 65, rate20kg: 105 },
  "UAE": { rate10kg: 65, rate20kg: 105 },
  "Saudi Arabia": { rate10kg: 65, rate20kg: 105 },
  "Qatar": { rate10kg: 65, rate20kg: 105 },
  "Oman": { rate10kg: 65, rate20kg: 105 },
  "Kuwait": { rate10kg: 65, rate20kg: 105 },
  "China": { rate10kg: 80, rate20kg: 150 },
  "Hong Kong": { rate10kg: 68, rate20kg: 104 },
  "Japan": { rate10kg: 65, rate20kg: 105 },
  "India": { rate10kg: 67, rate20kg: 105 },
  "Thailand": { rate10kg: 65, rate20kg: 105 },
  "Vietnam": { rate10kg: 65, rate20kg: 105 },
  "Indonesia": { rate10kg: 65, rate20kg: 105 },
  "Malaysia": { rate10kg: 65, rate20kg: 105 },
  "Singapore": { rate10kg: 65, rate20kg: 105 },
  "Sri Lanka": { rate10kg: 65, rate20kg: 105 },
  "Philippines": { rate10kg: 65, rate20kg: 105 },
  "Taiwan": { rate10kg: 65, rate20kg: 105 },
  "Maldives": { rate10kg: 65, rate20kg: 105 },
  "Fiji": { rate10kg: 98, rate20kg: 180 },
  "French Polynesia": { rate10kg: 99, rate20kg: 180 },
  "Germany": { rate10kg: 11.49, rate20kg: 19.49, express10kg: 40, express20kg: 45 }
};

export async function POST(request: Request) {

  // ✅ UNBLOCKED: Removed the Valentine's Day Pause Logic
  // The payment flow is now open again.

  try {
    // ✨ SECURE: Get all details needed to reconstruct the price
    const { 
        email, // ✅ Added email here to capture it from the request
        discountCode, 
        cart, 
        country, 
        isExpress, 
        packagingType, 
        tipAmount, 
        donationAmount 
    } = await request.json();

    // 🛡️ STEP 1: Re-calculate Subtotal from Database (Ignore Client Prices)
    // Fetch real prices for the items in the cart
    const productIds = cart.map((item: any) => item.productId);
    const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select('id, price, sale_price, is_on_sale, category')
        .in('id', productIds);

    if (prodError || !dbProducts) throw new Error("Security Alert: Could not verify product prices.");

    let calculatedSubtotal = 0;
    let hasHeavyItems = false;
    let shippableItemsCount = 0;

    for (const item of cart) {
        const dbProduct = dbProducts.find((p) => p.id === item.productId);
        
        if (!dbProduct) {
            console.error(`Product ID ${item.productId} invalid`);
            throw new Error(`Security Alert: Invalid product ID in cart.`);
        }

        // Use the Database Price (Sale or Regular)
        const realPrice = dbProduct.is_on_sale ? dbProduct.sale_price : dbProduct.price;
        
        // Add to subtotal
        calculatedSubtotal += (realPrice * item.quantity);

        // Check Weight Logic (For Shipping)
        const optionValues = Object.values(item.options || {}).join(" ");
        if (optionValues.includes("100") || optionValues.includes("200") || optionValues.includes("150")) {
            hasHeavyItems = true;
        }

        // Count Shippable Items (Exclude Supplies/Florist)
        if (dbProduct.category !== 'supplies' && dbProduct.category !== 'Floristenbedarf') {
            shippableItemsCount += item.quantity;
        }
    }

    // 🛡️ STEP 2: Re-calculate Shipping
    const rates = shippingRates[country] || { rate10kg: 0, rate20kg: 0 };
    const boxCount = Math.max(1, shippableItemsCount);
    
    // Base Rate
    const baseStd = hasHeavyItems ? rates.rate20kg : rates.rate10kg;
    let baseExp = baseStd;
    
    // Express Logic (Germany Only)
    if (country === "Germany") {
         baseExp = hasHeavyItems 
            ? (rates.express20kg || baseStd) 
            : (rates.express10kg || baseStd);
    }

    const totalStd = baseStd * boxCount;
    const totalExp = baseExp * boxCount;
    
    const finalShippingCost = (isExpress && country === "Germany") ? totalExp : totalStd;

    // 🛡️ STEP 3: Extras (Sanitized)
    const packagingCost = packagingType === 'gift' ? 10 : 0;
    const safeTip = Math.max(0, Number(tipAmount) || 0); // Force non-negative
    const safeDonation = Math.max(0, Number(donationAmount) || 0); // Force non-negative

    // 🛡️ STEP 4: Calculate Total Before Discount
    let finalTotal = calculatedSubtotal + finalShippingCost + packagingCost + safeTip + safeDonation;

    // 🛡️ STEP 5: Apply Discount (Server Side Check)
    if (discountCode) {
        const { data: code, error } = await supabase
            .from('discount_codes')
            .select('*')
            .eq('code', discountCode)
            .single();

        // Check validity again on server
        if (!error && code && code.is_active) {
             const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
             const isLimitReached = code.max_uses !== null && code.current_uses >= code.max_uses;
             const isMinMet = calculatedSubtotal >= code.min_order_value;

             if (!isExpired && !isLimitReached && isMinMet) {
                 let discountAmt = 0;
                 if (code.discount_type === 'percentage') {
                     discountAmt = (calculatedSubtotal * code.value) / 100;
                 } else {
                     discountAmt = code.value;
                 }
                 // Discount cannot exceed subtotal (no negative orders)
                 discountAmt = Math.min(discountAmt, calculatedSubtotal);
                 finalTotal -= discountAmt;
             }
        }
    }

    // Ensure total never drops below €0.50 (Stripe Minimum)
    if (finalTotal < 0.50) finalTotal = 0.50;

    // 🛡️ STEP 6: CREATE PENDING ORDER IN SUPABASE (THE NEW BULLETPROOF LOGIC)
    // We create the order BEFORE sending to Stripe to guarantee we never lose the cart data!
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        { 
          total_price: finalTotal,
          items: cart, // The raw cart JSON is now safely stored
          email: email,
          status: 'pending' // 🔥 Mark it as pending so it doesn't look like a paid order yet
        }
      ])
      .select('id')
      .single();

    if (orderError) {
      console.error("Failed to create pending order in Supabase:", orderError);
      throw new Error("Could not initialize the order. Please try again.");
    }

    // Capture the exact database ID for this specific order
    const supabaseOrderId = newOrder.id;

    // Create a PaymentIntent with the SERVER-CALCULATED amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100), // Convert to cents
      currency: "eur",
      receipt_email: email, // ✅ THE FIX: Attaches email to the official Stripe receipt
      automatic_payment_methods: { enabled: true }, 
      metadata: { 
          discountCode: discountCode || 'NONE',
          tip: safeTip.toString(),
          donation: safeDonation.toString(),
          email: email || 'NONE', // ✅ THE FIX: Adds email to metadata for extra search safety
          supabase_order_id: supabaseOrderId.toString(), // 🔥 THE FIX: Attaches the database ID to the Stripe receipt
          cart_backup: JSON.stringify(cart).substring(0, 400) // 🔥 THE FIX: Saves a quick text backup of the cart to Stripe just in case
      }, 
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}