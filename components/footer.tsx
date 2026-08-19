import Link from "next/link";

// lucide-react dropped brand/logo icons entirely (no Facebook/Instagram/
// Twitter/LinkedIn export at all, in any name) — small inline SVGs instead
// of pulling in a whole extra icon-set dependency for four footer glyphs.
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.7 22H1.6l8.2-9.3L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.7L7.4 4H5.5l12.2 16Z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.5c0-1.3-.02-3-1.85-3-1.85 0-2.13 1.4-2.13 2.9V21h-4V9Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-sm text-muted-foreground md:px-6">
        <div className="flex gap-4">
          <a href="#" aria-label="Facebook" className="hover:text-primary">
            <FacebookIcon className="size-5" />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-primary">
            <InstagramIcon className="size-5" />
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-primary">
            <XIcon className="size-5" />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-primary">
            <LinkedinIcon className="size-5" />
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/privacy" className="hover:text-primary">
            Privacy Policy
          </Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-primary">
            Terms of Service
          </Link>
          <span>&middot;</span>
          <Link href="/listings" className="hover:text-primary">
            Company Details
          </Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Wanderlust, Inc. &middot; All rights reserved.</p>
      </div>
    </footer>
  );
}
