import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extract all possible shipping fields sent from the frontend
    const { 
      name, 
      address, 
      houseNumber, // We ask for this, but have a fallback if it's missing
      city, 
      postalCode, 
      country, 
      email, 
      phone, 
      orderNumber, 
      weight 
    } = body;

    // 2. Strict Validation: Stop immediately if core data is missing
    if (!name || !address || !city || !postalCode) {
      return NextResponse.json(
        { error: "Missing required shipping details (name, address, city, or postal code)." }, 
        { status: 400 }
      );
    }

    // 3. Environment Variable Security Check
    const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
    const secretKey = process.env.SENDCLOUD_SECRET_KEY;

    if (!publicKey || !secretKey) {
      console.error("🚨 Sendcloud API keys are missing from .env.local!");
      return NextResponse.json(
        { error: "Server configuration error. Missing API keys." }, 
        { status: 500 }
      );
    }

    // 4. Basic Auth Encoding
    // Sendcloud requires the Public and Secret keys to be combined and Base64 encoded
    const authHeader = `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`;

    // 5. 🛡️ BULLETPROOF ADDRESS PARSING 
    // DHL strictly requires a separated house number. If the frontend didn't 
    // provide one, we use Regex to split "Musterstraße 12b" safely.
    let finalStreet = address.trim();
    let finalHouseNumber = houseNumber ? houseNumber.trim() : "";

    if (!finalHouseNumber) {
      // Looks for the last group of numbers (and optional letters) in the string
      const addressMatch = address.match(/(.+?)\s+(\d+[a-zA-Z]*)$/);
      if (addressMatch) {
        finalStreet = addressMatch[1].trim();
        finalHouseNumber = addressMatch[2].trim();
      } else {
        // Absolute fallback so the API doesn't crash if the customer typed weirdly
        finalHouseNumber = "0"; 
      }
    }

    // 6. Construct the exact payload Sendcloud expects
    const parcelPayload = {
      parcel: {
        name: name.trim(),
        address: finalStreet,
        house_number: finalHouseNumber,
        city: city.trim(),
        postal_code: postalCode.trim(),
        country: country || "DE", // Default to Germany (ISO-2 Code required)
        email: email || "",
        telephone: phone || "",
        order_number: orderNumber || "",
        weight: weight || "1.000", // Default to 1kg if not specified
        request_label: true, // 🔥 CRITICAL: Tells Sendcloud to generate the PDF instantly
      }
    };

    console.log(`📦 Sending Order ${orderNumber || 'Unknown'} to Sendcloud...`);

    // 7. Fire the POST request to Sendcloud's API
    // ✨ BUG FIX: Upgraded the endpoint from v2 to v3 because new Sendcloud accounts require API v3!
    // This stops the "Creating parcels via API v2 is not available" error.
    const response = await fetch("https://panel.sendcloud.sc/api/v3/parcels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(parcelPayload),
    });

    const data = await response.json();

    // 8. Handle Sendcloud Rejections gracefully
    if (!response.ok) {
      console.error("❌ Sendcloud API Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Failed to create parcel in Sendcloud." },
        { status: response.status }
      );
    }

    console.log("✅ Sendcloud Label Generated Successfully!");

    // 9. Extract the tracking number and the secure PDF link
    const trackingNumber = data.parcel.tracking_number;
    const labelUrl = data.parcel.documents?.[0]?.link || null; 

    // 10. Send the data back to the frontend to update Supabase and the UI
    return NextResponse.json({
      success: true,
      trackingNumber,
      labelUrl,
      parcelId: data.parcel.id
    });

  } catch (error: any) {
    // Catch massive failures (like network disconnects)
    console.error("❌ Internal Server Error (Sendcloud):", error);
    return NextResponse.json(
      { error: "Internal Server Error while communicating with Sendcloud" }, 
      { status: 500 }
    );
  }
}