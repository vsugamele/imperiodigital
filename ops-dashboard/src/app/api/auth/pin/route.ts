import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { pin } = await request.json();
        const AUTH_PIN = process.env.AUTH_PIN || "464321"; // Reverting to user's "correct" pin as default for convenience

        if (pin === AUTH_PIN) {
            const response = NextResponse.json({ success: true });

            // Set session cookie for 7 days
            response.cookies.set("auth_pin", AUTH_PIN, {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
            });

            return response;
        }

        return NextResponse.json({ success: false, message: "PIN Incorreto" }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro de servidor" }, { status: 500 });
    }
}
