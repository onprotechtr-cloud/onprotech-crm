import { NextResponse } from "next/server";
import { getQuoteById } from "@/lib/data";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { QuoteDocument } from "@/components/pdf/quote-document";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const quote = await getQuoteById(params.id);

  if (!quote) {
    return new NextResponse("Teklif bulunamadi.", { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(QuoteDocument as any, { quote }) as any;
  const buffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quote.quoteNumber}.pdf"`,
    },
  });
}
