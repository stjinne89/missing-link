"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import type { ChatMessage } from "@/types";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");
  const partnerName = searchParams.get("name") || "Chat";
  const partnerId = searchParams.get("partnerId");

  const [messages, setMessages] = useState<(ChatMessage & { ridePlanId?: string | null })[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showRidePlan, setShowRidePlan] = useState(false);
  const [ridePlan, setRidePlan] = useState({ date: "", time: "", location: "", notes: "" });
  const [sending, setSending] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!matchId) return;

    async function load() {
      try {
        const [chatRes, userRes] = await Promise.all([
          fetch(`/api/chat?matchId=${matchId}`),
          fetch("/api/users/me"),
        ]);

        if (userRes.status === 401) {
          router.push("/login");
          return;
        }

        const chatData = await chatRes.json();
        const userData = await userRes.json();

        setMessages(chatData.messages || []);
        setUserId(userData.id);
      } catch (err) {
        console.error("Load error:", err);
      }
    }

    load();

    // Supabase Realtime — luister naar nieuwe berichten in deze match
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `matchId=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            senderId: string;
            content: string;
            type: string;
            read: boolean;
            createdAt: string;
          };
          setMessages((prev) => {
            // Voorkom duplicaten (eigen berichten worden al lokaal toegevoegd)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                senderId: newMsg.senderId,
                content: newMsg.content,
                type: newMsg.type as ChatMessage["type"],
                read: newMsg.read,
                createdAt: newMsg.createdAt,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, router]);

  const sendMessage = async (content: string, type = "text") => {
    if (!content.trim() || !matchId || sending) return;
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, content, type }),
      });
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch (err) {
      console.error("Send error:", err);
    }
    setSending(false);
  };

  const sendRidePlan = async () => {
    if (!matchId || sending) return;
    setSending(true);

    const content = `🗓️ Ritvoorstel\n📅 ${ridePlan.date || "Nog te bepalen"}\n⏰ ${ridePlan.time || "Ochtend"}\n📍 ${ridePlan.location || "Nader te bepalen"}\n💬 ${ridePlan.notes || "Zin in!"}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          content,
          type: "ride_plan",
          ridePlan: { ...ridePlan },
        }),
      });
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error("Send ride plan error:", err);
    }

    setSending(false);
    setShowRidePlan(false);
    setRidePlan({ date: "", time: "", location: "", notes: "" });
  };

  const respondToRidePlan = async (ridePlanId: string, status: "accepted" | "declined") => {
    setRespondingTo(ridePlanId);
    try {
      await fetch("/api/ride-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ridePlanId, status }),
      });
    } catch (err) {
      console.error("Respond error:", err);
    }
    setRespondingTo(null);
  };

  if (!matchId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-text-muted">Selecteer een match om te chatten</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0 bg-white border-b border-border card-shadow">
        <button onClick={() => router.push("/matches")} className="text-lg text-text">
          ←
        </button>
        <button
          onClick={() => partnerId && router.push(`/profile/${partnerId}`)}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <Avatar name={partnerName} size={40} />
          <div className="text-left">
            <div className="font-bold text-sm text-text">{partnerName}</div>
            <div className="text-xs text-text-muted">Bekijk profiel</div>
          </div>
        </button>
        <button
          onClick={() => setShowRidePlan(!showRidePlan)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{
            background: "rgba(46,204,113,0.12)",
            color: "#2ECC71",
            border: "1px solid rgba(46,204,113,0.25)",
          }}
        >
          🗓️ Plan rit
        </button>
      </div>

      {/* Ride plan form */}
      {showRidePlan && (
        <div className="p-4 space-y-3 shrink-0 bg-bg-warm border-b border-border animate-slide-up">
          <div className="text-sm font-bold text-success">🗓️ Ritvoorstel</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={ridePlan.date}
              onChange={(e) => setRidePlan((r) => ({ ...r, date: e.target.value }))}
              className="px-3 py-2 rounded-lg text-sm bg-bg-elevated text-text border border-border"
            />
            <input
              type="time"
              value={ridePlan.time}
              onChange={(e) => setRidePlan((r) => ({ ...r, time: e.target.value }))}
              className="px-3 py-2 rounded-lg text-sm bg-bg-elevated text-text border border-border"
            />
          </div>
          <input
            placeholder="Startlocatie..."
            value={ridePlan.location}
            onChange={(e) => setRidePlan((r) => ({ ...r, location: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm bg-bg-elevated text-text border border-border"
          />
          <input
            placeholder="Notities..."
            value={ridePlan.notes}
            onChange={(e) => setRidePlan((r) => ({ ...r, notes: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm bg-bg-elevated text-text border border-border"
          />
          <button
            onClick={sendRidePlan}
            className="w-full py-2.5 rounded-full text-sm font-bold text-secondary bg-primary shadow-md shadow-primary/25"
          >
            Verstuur voorstel
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">👋</div>
            <p className="text-sm text-text-muted">
              Stuur het eerste bericht!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === userId;
          const isRidePlan = msg.type === "ride_plan";

          if (isRidePlan) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div
                  className="w-full max-w-[85%] rounded-3xl p-4 whitespace-pre-line"
                  style={{
                    background: "#E0F8EA",
                    border: "1.5px solid rgba(46,204,113,0.3)",
                    color: "#1B1B1B",
                  }}
                >
                  <p className="text-sm font-medium">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {/* Accept/decline knoppen alleen voor de ontvanger */}
                  {!isMe && msg.ridePlanId && (
                    <div className="flex gap-2 mt-3">
                      <button
                        disabled={respondingTo === msg.ridePlanId}
                        onClick={() => respondToRidePlan(msg.ridePlanId!, "accepted")}
                        className="flex-1 py-2 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
                        style={{ background: "#2ECC71" }}
                      >
                        ✓ Accepteren
                      </button>
                      <button
                        disabled={respondingTo === msg.ridePlanId}
                        onClick={() => respondToRidePlan(msg.ridePlanId!, "declined")}
                        className="flex-1 py-2 rounded-2xl text-sm font-bold transition-all active:scale-95"
                        style={{ background: "#FF6B6B15", color: "#FF6B6B", border: "1px solid #FF6B6B30" }}
                      >
                        ✗ Afwijzen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-3xl px-4 py-2.5"
                style={{
                  background: isMe ? "#FFC629" : "#F7F7F7",
                  color: "#1B1B1B",
                }}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 text-right opacity-50">
                  {new Date(msg.createdAt).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0 bg-white border-t border-border">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Type een bericht..."
          className="flex-1 px-4 py-3 rounded-2xl text-sm bg-bg-elevated text-text border border-border outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || sending}
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-secondary bg-primary disabled:opacity-40 transition-all active:scale-90 font-bold"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-text-muted">Laden...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
