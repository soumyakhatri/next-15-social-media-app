import { google, lucia } from "@/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { decodeIdToken, OAuth2RequestError, type OAuth2Tokens } from "arctic";
import prisma from "@/lib/prisma";
import { generateIdFromEntropySize } from "lucia";
import { slugify } from "@/lib/utils";
import streamServerClient from "@/lib/stream";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;

  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;

  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);

    const claims = decodeIdToken(tokens.idToken());

    if (typeof claims !== "object" || claims === null || !("sub" in claims)) {
      return new Response("Invalid ID token", { status: 400 });
    }
    const { sub, name } = claims as {
      sub: string;
      name: string;
    };
    const googleUserId = sub;
    const googleUsername = name;

    const existingUser = await prisma.user.findUnique({
      where: {
        googleId: googleUserId,
      },
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const userId = generateIdFromEntropySize(10);

    const username = slugify(googleUsername) + "-" + userId.slice(0, 4);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          googleId: googleUserId,
          displayName: googleUsername,
        },
      });
      await streamServerClient.upsertUser({
        // stream // if changing the auth then take care of this also.
        id: userId,
        username,
        name: username,
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    // Invalid code or client credentials
    console.log(e)
    if(e instanceof OAuth2RequestError){
        return new Response(null, {
      status: 400,
    });
    }
    return new Response(null, {
      status: 500,
    });
  }
}
