// API Version: 1.2.3
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { pin } = await request.json();

        if (pin === "464321") {
            const response = NextResponse.json({ success: true });

            // Set session cookie for 7 days
            response.cookies.set("auth_pin", "464321", {
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
