// client/src/components/AIChatBox.tsx
import api from "@/lib/api/httpClient";
import { Loader2, Search, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";

interface AISearchResult {
  filters: {
    species?: string;
    gender?: string;
    maxAge?: number;
    minAge?: number;
    breed?: string;
    search?: string;
  };
  interpretation: string;
}

interface Props {
  onFiltersApplied: (filters: AISearchResult["filters"], interpretation: string) => void;
}

export default function AIChatBox({ onFiltersApplied }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInterpretation, setLastInterpretation] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post<{ success: boolean; data: AISearchResult }>("/ai/search", { query });
      const { filters, interpretation } = res.data.data;
      setLastInterpretation(interpretation);
      onFiltersApplied(filters, interpretation);
      setQuery("");
    } catch {
      setError("Couldn't understand that. Try: 'female dog under 2 years'");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-200 font-bold transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Search with AI
        </button>
      )}

      {/* Chat box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-amber-500">
            <div className="flex items-center gap-2 text-white font-bold">
              <Sparkles className="w-4 h-4" />
              AI Pet Search
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-amber-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500">
              Describe the pet you're looking for in plain English.
            </p>
            
            {lastInterpretation && (
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-xl">
                ✓ {lastInterpretation}
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. calm female dog under 2 years"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex flex-wrap gap-1.5">
              {["female dog under 2 years", "senior cat", "male rabbit"].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-amber-100 hover:text-amber-700 text-gray-600 rounded-lg transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}