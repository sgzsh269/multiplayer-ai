"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, useClerk } from "@clerk/nextjs";

export default function Home() {
  const { signOut } = useClerk();
  return (
    <>
      <nav className="w-full flex justify-end gap-4 p-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-zinc-900">
        <SignedOut>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign In
          </Link>
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/user/profile" className="text-blue-600 hover:underline">
            Profile
          </Link>
          <UserButton afterSignOutUrl="/" />
          <button
            onClick={() => signOut()}
            className="ml-2 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </SignedIn>
      </nav>
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <section className="text-center max-w-2xl mx-auto py-20">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Collaborative AI Playground
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Real-time, multi-user chatrooms with an AI assistant. Upload files,
            brainstorm, and collaborate securely—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="px-6 py-3 rounded-md border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            >
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
