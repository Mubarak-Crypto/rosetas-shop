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

// 🌏 SERVER-SIDE SHIPPING RATES (Source of Truth) - KEPT EXACTLY AS IS
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
  "Austria": { rate10kg: 25, rate20kg: 31 }, 
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
  try {
    // ✨ UPDATED: Extract full customer data from frontend
    const { 
        email, 
        formData, // Includes firstName, lastName, phone, address, houseNumber, city, zip
        discountCode, 
        cart, 
        country, 
        isExpress, 
        packagingType, 
        tipAmount, 
        donationAmount 
    } = await request.json();

    // 🛡️ STEP 1: Re-calculate Subtotal from Database (Ignore Client Prices)
    const productIds = cart.map((item: any) => item.productId);
    const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select('id, price, sale_price, is_on_sale, category')
        .in('id', productIds);

    if (prodError || !dbProducts) throw new Error("Security Alert: Verification failed.");

    let calculatedSubtotal = 0;
    let hasHeavyItems = false;
    let shippableItemsCount = 0;

    for (const item of cart) {
        const dbProduct = dbProducts.find((p) => p.id === item.productId);
        if (!dbProduct) throw new Error(`Invalid product ID in cart.`);

        const realPrice = dbProduct.is_on_sale ? dbProduct.sale_price : dbProduct.price;
        calculatedSubtotal += (realPrice * item.quantity);

        const optionValues = Object.values(item.options || {}).join(" ");
        if (optionValues.includes("100") || optionValues.includes("200") || optionValues.includes("150")) {
            hasHeavyItems = true;
        }

        if (dbProduct.category !== 'supplies' && dbProduct.category !== 'Floristenbedarf') {
            shippableItemsCount += item.quantity;
        }
    }

    // 🛡️ STEP 2: Re-calculate Shipping
    const rates = shippingRates[country] || { rate10kg: 0, rate20kg: 0 };
    const boxCount = Math.max(1, shippableItemsCount);
    const baseStd = hasHeavyItems ? rates.rate20kg : rates.rate10kg;
    let baseExp = baseStd;
    
    if (country === "Germany") {
         baseExp = hasHeavyItems ? (rates.express20kg || baseStd) : (rates.express10kg || baseStd);
    }
    const finalShippingCost = (isExpress && country === "Germany") ? baseExp * boxCount : baseStd * boxCount;

    // 🛡️ STEP 3: Extras (Sanitized)
    const packagingCost = packagingType === 'gift' ? 10 : 0;
    const safeTip = Math.max(0, Number(tipAmount) || 0);
    const safeDonation = Math.max(0, Number(donationAmount) || 0);

    // 🛡️ STEP 4: Calculate Total Before Discount
    let finalTotal = calculatedSubtotal + finalShippingCost + packagingCost + safeTip + safeDonation;

    // 🛡️ STEP 5: Apply Discount (Server Side Check)
    let discountAmt = 0;
    if (discountCode) {
        const { data: code } = await supabase.from('discount_codes').select('*').eq('code', discountCode).single();
        if (code && code.is_active) {
             const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
             const isLimitReached = code.max_uses !== null && code.current_uses >= code.max_uses;
             if (!isExpired && !isLimitReached && calculatedSubtotal >= code.min_order_value) {
                  discountAmt = code.discount_type === 'percentage' ? (calculatedSubtotal * code.value) / 100 : code.value;
                  discountAmt = Math.min(discountAmt, calculatedSubtotal);
                  finalTotal -= discountAmt;
             }
        }
    }

    if (finalTotal < 0.50) finalTotal = 0.50;

    // 🛡️ STEP 6: CREATE FULL PENDING ORDER (THE BIG FIX)
    // We store EVERY detail now, so Klarna/Pending orders aren't empty in Admin.
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        { 
          customer_name: `${formData.firstName} ${formData.lastName}`,
          email: email,
          phone: formData.phone,
          address: `${formData.address} ${formData.houseNumber}`,
          city: formData.city,
          zip: formData.zip,
          country: country,
          total: finalTotal,
          items: cart, // ✅ FULL Choice list (Crown, Extras, etc.)
          status: 'pending',
          shipping_method: isExpress ? "Express" : "Standard",
          tip_amount: safeTip,
          donation_amount: safeDonation,
          discount_amount: discountAmt,
          discount_code: discountCode || null
        }
      ])
      .select('id')
      .single();

    if (orderError) throw new Error("Order creation failed.");

    // Generate Branded ID: ROSETAS-00001
    const brandedId = `ROSETAS-${String(newOrder.id).padStart(5, '0')}`;

    // 🛡️ STEP 7: Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100),
      currency: "eur",
      receipt_email: email,
      automatic_payment_methods: { enabled: true }, 
      metadata: { 
          supabase_order_id: newOrder.id.toString(),
          branded_id: brandedId, // Pass the pretty ID to Stripe
          customer_email: email
      }, 
    });

    return NextResponse.json({ 
        clientSecret: paymentIntent.client_secret,
        brandedId: brandedId // Return to frontend
    });

  } catch (error: any) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}