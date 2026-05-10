import { useEffect, useState, useRef } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function SupportChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "support_chats", user.uid, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "support_chats", user.uid, "messages"), {
        text: newMessage,
        sender: "user",
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return <div className="p-4 bg-slate-50 rounded-2xl text-center text-sm">Please login to chat with support.</div>;

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] px-4 py-2 rounded-2xl text-sm", msg.sender === "user" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-800")}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 px-4 py-2 bg-slate-50 rounded-xl outline-none"
        />
        <button disabled={isSending} type="submit" className="p-2 bg-indigo-500 text-white rounded-xl">
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
