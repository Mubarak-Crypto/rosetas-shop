import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing PDF URL", { status: 400 });
  }

  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;
  const authHeader = `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`;

  try {
    // Fetch the PDF securely using your API keys
    const response = await fetch(url, { 
      headers: { "Authorization": authHeader } 
    });
    
    if (!response.ok) throw new Error("Failed to authenticate PDF");

    const blob = await response.blob();
    
    // Send the PDF back to the browser to display
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="sendcloud-label.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF Download Error:", error);
    return new NextResponse("Failed to securely fetch PDF", { status: 500 });
  }
}