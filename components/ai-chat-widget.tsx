"use client";

import { Fragment, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, Wand2, X } from "lucide-react";
import { aiChatSearch, type AiChatListing } from "@/lib/actions/ai-search";

type Message = { role: "user"; text: string } | { role: "bot"; text: string; listings?: AiChatListing[] };

const QUICK_PROMPTS = [
  { label: "🏖️ Goa under ₹5k", prompt: "Show me beach stays in Goa under ₹5,000" },
  { label: "⛰️ Mountain Cabins", prompt: "Find me peaceful mountain cabins" },
  { label: "💡 3-Day Itinerary", prompt: "Suggest a 3-day travel itinerary" },
  { label: "🏊 Places with Pools", prompt: "What stays have private pools?" },
];

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    startTransition(async () => {
      const result = await aiChatSearch(trimmed);
      if ("error" in result) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "I couldn't process that request right now. Please try again!" },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: result.reply, listings: result.listings }]);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-dark"
      >
        <Wand2 className="size-5" />
        AI Concierge
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[32rem] w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-primary to-primary-dark p-4 text-white">
            <div className="flex items-center gap-2">
              <Wand2 className="size-5" />
              <div>
                <p className="text-sm font-bold">Wanderlust AI Assistant</p>
                <p className="text-xs text-white/80">Online · Ready to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="rounded-2xl border border-border bg-white p-3 text-sm shadow-sm">
              Hello 👋! I&apos;m your <strong>Wanderlust AI Travel Assistant</strong>. Where are you planning to go
              next?
              <div className="mt-2 text-xs text-muted-foreground">
                Try asking me to find stays, plan itineraries, or filter by budget!
              </div>
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => send(qp.prompt)}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}

            {isPending && (
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-white p-3 text-sm text-muted-foreground shadow-sm">
                <Wand2 className="size-4 text-primary" /> Thinking...
              </div>
            )}
          </div>

          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Stays in Goa under 3k')..."
              className="flex-1 rounded-full border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ChatBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-white shadow-sm">
        {message.text}
      </div>
    );
  }

  return (
    <div className="max-w-[90%] rounded-2xl border border-border bg-white p-3 text-sm shadow-sm">
      <FormattedText text={message.text} />
      {message.listings && message.listings.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.listings.map((l) => (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted p-2 hover:bg-secondary"
            >
              <Image src={l.image} alt={l.title} width={44} height={44} className="size-11 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{l.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {l.location}, {l.country}
                </p>
                <p className="text-[11px] font-bold text-primary">₹{l.price.toLocaleString("en-IN")} / night</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={i}>
            {part.split("\n").map((line, j, arr) => (
              <Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        )
      )}
    </>
  );
}
