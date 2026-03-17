"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useUsage } from "@/components/providers/usage-provider";
import { MessageBubble } from "./_components/message-bubble";
import { ChatEmptyState } from "./_components/chat-empty-state";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const exampleQuestions = [
  "How is chat with the codebase feature handled?",
  "How is authentication handled?",
  "What are the main API endpoints?",
  "How is usage limits handled?",
];

export default function ChatPage() {
  const { canSendMessage, getRemainingMessages, refreshUsage } = useUsage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSendMessage()) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "You have reached your message limit lil bro. Upgrade to Pro plan for more messages.",
        },
      ]);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        header: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.Error || "Failed to get response");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
      refreshUsage();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const canChat = canSendMessage();

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4 h-full">
          {messages.length === 0 ? (
            <ChatEmptyState
              exampleQuestions={exampleQuestions}
              onSelectQuestion={(q) => setInput(q)}
            />
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-3xl mx-auto">
          {!canChat ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-800 mb-2">
                You reached your message Limit
              </p>
              <Link href="/settings">
                <Button variant="default">Upgrade to Pro</Button>
              </Link>
            </div>
          ) : (
            <PlaceholdersAndVanishInput
              placeholders={exampleQuestions}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
