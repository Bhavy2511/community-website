import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { kotiOrdersEnabled, kurtaOrdersEnabled } from "../../../lib/merch-orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const products = {
  kurta: { price: 499, bulkPrice: 449, maxQuantity: 4 },
  koti: { price: 349 },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get("product");
  if (!productName || (productName === "kurta" ? !kurtaOrdersEnabled() : productName === "koti" ? !kotiOrdersEnabled() : true)) return new NextResponse(null, { status: 404 });
  const product = products[productName];
  const amount = Number(searchParams.get("amount"));
  const validKurtaAmount = productName === "kurta" && (amount === product.price || (amount >= product.bulkPrice * 2 && amount <= product.bulkPrice * product.maxQuantity && amount % product.bulkPrice === 0));
  const validKotiAmount = productName === "koti" && amount === product.price;
  if (!product || !Number.isInteger(amount) || !(validKurtaAmount || validKotiAmount)) {
    return NextResponse.json({ error: "Invalid payment amount." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  if (productName === "kurta") {
    try {
      const qr = await readFile(join(process.cwd(), "public", "kurta-payment-qr", `${amount}.jpeg`));
      return new NextResponse(qr, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": String(qr.length),
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      return NextResponse.json({ error: "Payment QR is unavailable for this amount." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  }

  try {
    const qr = await readFile(join(process.cwd(), "public", "koti-payment-qr", "payment.jpeg"));
    return new NextResponse(qr, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(qr.length),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Koti payment QR is unavailable. Please contact the GarbaRaas team." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
