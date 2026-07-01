import { NextResponse } from "next/server";

// Your private passcode. Set this as an environment variable in Vercel
// (Settings -> Environment Variables -> ACCESS_CODE) so it's never in the code.
export async function POST(req) {
  const { code } = await req.json();
  const correct = process.env.ACCESS_CODE || "changeme";

  if (code === correct) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("ielts_auth", correct, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
