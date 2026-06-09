import api from "@/lib/api/httpClient";
import { CheckCircle2, Loader2, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  reason: string;
  homeType?: string;
  hasYard?: boolean;
  otherPets?: string;
  experience?: string;
}

interface Props {
  petId: string;
  petName: string;
  onClose: () => void;
  onSubmitSuccess: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

export default function AdoptionAIChat({ petId, petName, onClose, onSubmitSuccess, onSubmit }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start conversation automatically
  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        data: { message: string; isComplete: boolean; formData: FormData | null };
      }>("/ai/adoption-assist", {
        messages: [{ role: "user", content: `I want to adopt ${petName}` }],
        petName,
        petId,
      });

      setMessages([
        { role: "user", content: `I want to adopt ${petName}` },
        { role: "assistant", content: res.data.data.message },
      ]);
    } catch {
      toast.error("Failed to start AI assistant");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || isComplete) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post<{
        success: boolean;
        data: { message: string; isComplete: boolean; formData: FormData | null };
      }>("/ai/adoption-assist", {
        messages: updatedMessages,
        petName,
        petId,
      });

      const { message, isComplete: done, formData: data } = res.data.data;

      setMessages((prev) => [...prev, { role: "assistant", content: message }]);

      if (done && data) {
        setIsComplete(true);
        setFormData(data);
      }
    } catch {
      toast.error("Something went wrong. Try again.");
      setMessages((prev) => prev.slice(0, -1)); // remove user message on failure
      setInput(userMessage.content); // restore input
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

const handleSubmit = async () => {
  if (!formData) return;
  setIsSubmitting(true);
  try {
    // Clean up empty strings — API expects missing field, not ""
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    ) as FormData;

    await onSubmit(cleanedData);
    toast.success('Application submitted successfully!');
    onSubmitSuccess();
  } catch (err) {
    toast.error('Failed to submit application. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="mt-12 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-amber-500 px-8 py-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h2 className="text-xl font-black text-white">AI Adoption Assistant</h2>
          </div>
          <p className="text-amber-100 text-sm mt-1">
            Applying to adopt <span className="font-bold">{petName}</span> — just chat naturally
          </p>
        </div>
        <button onClick={onClose} className="text-white hover:text-amber-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat area */}
      <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-amber-500 text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Completion summary */}
      {isComplete && formData && (
        <div className="mx-6 mb-4 mt-2 bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            All information collected — review before submitting
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
            <span><span className="font-semibold">Name:</span> {formData.fullName}</span>
            <span><span className="font-semibold">Email:</span> {formData.email}</span>
            <span><span className="font-semibold">Phone:</span> {formData.phone}</span>
            <span><span className="font-semibold">Address:</span> {formData.address}</span>
            {formData.homeType && <span><span className="font-semibold">Home:</span> {formData.homeType}</span>}
            {formData.hasYard !== undefined && <span><span className="font-semibold">Yard:</span> {formData.hasYard ? "Yes" : "No"}</span>}
          </div>
          <p className="text-xs text-gray-600"><span className="font-semibold">Reason:</span> {formData.reason}</p>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        {isComplete ? (
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50 transition-colors shadow-lg shadow-amber-100"
            >
              {isSubmitting ? "Submitting…" : "Submit Application"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your answer…"
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-400 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-2xl transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}