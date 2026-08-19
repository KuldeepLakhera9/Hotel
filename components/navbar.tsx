import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <Link href="/listings" className="flex items-center gap-2 text-lg font-bold text-primary">
          <Compass className="size-6" />
          wanderlust
        </Link>

        <form action="/listings" method="GET" className="order-3 flex w-full items-center gap-2 md:order-0 md:mx-auto md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Search destinations, cities, villas..."
              aria-label="Search"
              className="h-11 w-full rounded-full border border-border pl-9 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/listings/new" className="hidden items-center gap-1 text-sm font-medium hover:text-primary md:flex">
            <Home className="size-4 text-primary" />
            Wanderlust your home
          </Link>

          {!session?.user ? (
            <>
              <Link href="/signup" className="text-sm font-medium hover:text-primary">
                Signup
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-foreground px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Login
              </Link>
            </>
          ) : (
            <UserMenu username={session.user.username} role={session.user.role} />
          )}
        </div>
      </div>
    </nav>
  );
}
