"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { email, password, username } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10)

    const usernameAlreadyExists = await prisma.user.findFirst({
      where: {
        username: {
            equals: username,
            mode: "insensitive"
        },
      },
    });

    if (usernameAlreadyExists) {
      return {
        error: "Username already exists",
      };
    }

    const emailAlreadyExists = await prisma.user.findFirst({
      where: {
        email: {
            equals: email,
            mode: "insensitive"
        },
      },
    });

    if (emailAlreadyExists) {
      return {
        error: "Email already exists",
      };
    }

    await prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        displayName: username,
        passwordHash
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    )

    redirect("/")
  } catch (error) {
    if(isRedirectError(error)) throw error;
    console.log(error);
    return {
      error: "Something went wrong, please try again later",
    };
  }
}
