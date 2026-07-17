import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json(
      { unreadCount: 0 },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const unreadCount = await getUnreadNotificationCount(session.user.id);

  return NextResponse.json(
    { unreadCount },
    { headers: { "Cache-Control": "no-store" } },
  );
}
