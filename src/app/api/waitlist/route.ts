import { NextResponse } from "next/server";
import { z } from "zod";

const waitlistSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  honeypot: z.string().max(0)
});

// Simple in-memory tracker for rate limiting and mock queue positions
const signupIPs = new Map<string, { count: number; resetTime: number }>();
const signedUpEmails = new Set<string>();
let currentQueuePosition = 142;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Zod Validation
    const validation = waitlistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid submission data. Please check fields." },
        { status: 400 }
      );
    }

    const { email, honeypot } = validation.data;

    // 2. Honeypot Check
    if (honeypot.length > 0) {
      return NextResponse.json(
        { success: false, error: "Spam detected." },
        { status: 400 }
      );
    }

    // 3. Simple In-Memory Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "local-ip";
    const now = Date.now();
    const limitWindow = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 3;

    const ipRecord = signupIPs.get(ip);
    if (ipRecord) {
      if (now < ipRecord.resetTime) {
        if (ipRecord.count >= maxRequests) {
          return NextResponse.json(
            { success: false, error: "Too many signups from this IP. Please try again in 15 minutes." },
            { status: 429 }
          );
        }
        ipRecord.count += 1;
      } else {
        // Reset window
        signupIPs.set(ip, { count: 1, resetTime: now + limitWindow });
      }
    } else {
      signupIPs.set(ip, { count: 1, resetTime: now + limitWindow });
    }

    // 4. Duplicate Check
    if (signedUpEmails.has(email.toLowerCase())) {
      return NextResponse.json({
        success: true,
        position: currentQueuePosition - 3,
        message: "You're already on the list!"
      });
    }

    // 5. Simulate Database Latency
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Register email and increment queue position
    signedUpEmails.add(email.toLowerCase());
    currentQueuePosition += 1;

    return NextResponse.json({
      success: true,
      position: currentQueuePosition
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
