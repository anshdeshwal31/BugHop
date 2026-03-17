"use client";

interface MessageBubbleProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          message.role === "user"
            ? "bg-gradient-to-b from-[#127A4D] to-[#0d5636] text-white"
            : "bg-muted"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
