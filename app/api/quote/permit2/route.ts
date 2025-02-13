import { type NextRequest } from "next/server";
import qs from "qs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  try {
    const response = await fetch(
      `https://api.0x.org/swap/v1/quote?${qs.stringify({
        // Required parameters
        sellToken: params.sellToken,
        buyToken: params.buyToken,
        sellAmount: BigInt(params.sellAmount).toString(),
        takerAddress: params.takerAddress,
      })}`,
      {
        headers: {
          "0x-api-key": "1f0f5708-6a53-476a-a1a7-5b92e2686c41",
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("0x API error:", {
        error: errorData,
        params: {
          ...params,
          sellAmount: BigInt(params.sellAmount).toString(),
        },
        url: response.url,
        status: response.status,
        statusText: response.statusText,
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