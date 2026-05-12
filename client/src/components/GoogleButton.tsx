// client/src/components/GoogleButton.tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";

interface Props {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export function GoogleSignInButton({ onSuccess, onError }: Props) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // Fetch user info using the access token
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((r) => r.json());

        // Send access_token to backend (update backend to accept this)
        await googleLogin(tokenResponse.access_token);
        onSuccess?.();
      } catch (err: any) {
        onError?.(err?.response?.data?.message ?? "Google sign-in failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => onError?.("Google sign-in was cancelled or failed"),
  });

  if (loading) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5
                   border border-gray-200 rounded-xl bg-white text-gray-500
                   text-sm font-medium cursor-not-allowed"
      >
        <span className="w-4 h-4 border-2 border-gray-300 border-t-amber-500
                         rounded-full animate-spin" />
        Signing in…
      </button>
    );
  }

  return (
    <button
      onClick={() => login()}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5
                 border border-gray-200 rounded-xl bg-white text-gray-700
                 text-sm font-medium hover:bg-gray-50 hover:border-gray-300
                 transition-all shadow-sm active:scale-95"
    >
      {/* Official Google G SVG */}
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}