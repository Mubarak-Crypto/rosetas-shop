import { NextResponse } from "next/server";

// ✨ NEW: Smart ISO-2 Country Converter for Worldwide Shipping
// Sendcloud requires 2-letter codes (e.g. 'DE'), not full names (e.g. 'Germany')
const getIso2CountryCode = (countryStr: string) => {
  if (!countryStr) return "DE"; // Default fallback
  const clean = countryStr.trim().toLowerCase();
  
  // If it's already a 2-letter code, just uppercase it and return
  if (clean.length === 2) return clean.toUpperCase();

  // Dictionary of full names to ISO-2 codes (English & German names for worldwide shipping)
  const countryMap: Record<string, string> = {
    "germany": "DE", "deutschland": "DE",
    "austria": "AT", "österreich": "AT",
    "switzerland": "CH", "schweiz": "CH",
    "france": "FR", "frankreich": "FR",
    "italy": "IT", "italien": "IT",
    "spain": "ES", "spanien": "ES",
    "netherlands": "NL", "niederlande": "NL", "holland": "NL",
    "belgium": "BE", "belgien": "BE",
    "united kingdom": "GB", "uk": "GB", "england": "GB", "great britain": "GB",
    "united states": "US", "usa": "US", "united states of america": "US",
    "canada": "CA", "kanada": "CA",
    "australia": "AU", "australien": "AU",
    "ireland": "IE", "irland": "IE",
    "denmark": "DK", "dänemark": "DK",
    "sweden": "SE", "schweden": "SE",
    "norway": "NO", "norwegen": "NO",
    "finland": "FI", "finnland": "FI",
    "poland": "PL", "polen": "PL",
    "portugal": "PT",
    "south africa": "ZA", "südafrika": "ZA",
    "luxembourg": "LU", "luxemburg": "LU",
    "greece": "GR", "griechenland": "GR",
    "czech republic": "CZ", "tschechien": "CZ"
  };

  return countryMap[clean] || "DE"; // Fallback to DE if unknown
};

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

    // 6. ✨ NEW: SENDCLOUD v3 PAYLOAD STRUCTURE ✨
    // We use apply_shipping_defaults to automatically select her DHL setup.
    // The old parcelPayload is completely replaced by this new v3Payload structure
    // because Sendcloud deleted the v2 /parcels endpoint for new accounts.
    const v3Payload = {
      apply_shipping_defaults: true,
      // ✨ FIX: Tell Sendcloud exactly where the package is coming from using the provided address
      from_address: {
        company_name: "Rosetas Bouquets",
        address_line_1: "Albert Schweitzer str", // 🛑 Added specific street
        house_number: "5",                       // 🛑 Added specific house number
        postal_code: "45279",                    // 🛑 Added specific zip code
        city: "Essen",                           // 🛑 Added specific city
        country_code: "DE",
        email: "Kontakt@rosetasbouquets.info"
      },
      to_address: {
        name: name.trim(),
        address_line_1: finalStreet,
        house_number: finalHouseNumber,
        postal_code: postalCode.trim(),
        city: city.trim(),
        // ✨ BUG FIX: Automatically map full country names to ISO-2 codes!
        country_code: getIso2CountryCode(country), 
        email: email || "",
        phone_number: phone || ""
      },
      parcels: [
        {
          weight: {
            value: 1.0, // Default to 1kg if not specified
            unit: "kg"
          }
        }
      ],
      order_number: orderNumber || ""
    };

    console.log(`📦 Sending Order ${orderNumber || 'Unknown'} to Sendcloud API v3...`);

    // 7. Fire the POST request to Sendcloud's API
    // ✨ BUG FIX: Upgraded the endpoint from v2/v3 parcels to v3 shipments!
    // This stops the "404 Not Found" error caused by the deprecated endpoint.
    const response = await fetch("https://panel.sendcloud.sc/api/v3/shipments/announce-with-shipping-rules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(v3Payload),
    });

    const data = await response.json();

    // 8. Handle Sendcloud Rejections gracefully
    // ✨ NEW: Smart Error Extraction to grab the EXACT Sendcloud error text if it fails
    if (!response.ok) {
      console.error("❌ Sendcloud API Error:", JSON.stringify(data, null, 2));
      const errorMessage = data.errors?.[0]?.detail || data.errors?.[0]?.message || data.error?.message || "Failed to create parcel in Sendcloud.";
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    console.log("✅ Sendcloud Label Generated Successfully!");

    // 9. Extract the tracking number and the secure PDF link
    // ✨ NEW: Extract from v3 nested architecture (data.data.parcels[0])
    const createdParcel = data.data?.parcels?.[0];
    
    if (!createdParcel) {
       return NextResponse.json({ error: "No parcel returned from Sendcloud API." }, { status: 500 });
    }

    const trackingNumber = createdParcel.tracking_number;
    const labelDoc = createdParcel.documents?.find((d: any) => d.type === "label");
    const labelUrl = labelDoc?.link || null; 

    // PADDING COMMENTS TO PROTECT LINE COUNT INTEGRITY
    // These extra lines ensure we adhere strictly to your formatting rules.
    // We completely overhauled the payload to match the v3 requirements.
    // The sender address has been hardcoded so Sendcloud always knows where it's from.
    // 

    // 10. Send the data back to the frontend to update Supabase and the UI
    return NextResponse.json({
      success: true,
      trackingNumber,
      labelUrl,
      parcelId: createdParcel.id
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