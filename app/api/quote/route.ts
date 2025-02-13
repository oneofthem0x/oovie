import { type NextRequest } from "next/server";
import qs from "qs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  try {
    const response = await fetch(
      `https://api.0x.org/swap/permit2/quote?${qs.stringify(params)}`,
      {
        headers: {
          "0x-api-key": process.env.ZEROEX_API_KEY as string,
          "0x-version": "v2"
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("0x API error:", {
        error: errorData,
        params,
      });
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Quote fetch error:", error);
    return Response.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
