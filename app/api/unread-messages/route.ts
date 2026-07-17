import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadMessageCount } from "@/lib/messages";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json(
      { unreadCount: 0 },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const unreadCount = await getUnreadMessageCount(session.user.id);

  return NextResponse.json(
    { unreadCount },
    { headers: { "Cache-Control": "no-store" } },
  );
}
