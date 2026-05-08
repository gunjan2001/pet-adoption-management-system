// client/src/components/GoogleButton.tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";

interface Props {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export default function GoogleButton({ onSuccess, onError }: Props) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    // "credential" flow — Google returns a one-time ID token directly
    // to the frontend; no redirect needed.
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      // implicit flow returns access_token, not credential
      // We need credential (ID token), so we use the callback below instead
    },
    onError: () => onError?.("Google sign-in was cancelled or failed"),
  });

  // Use CredentialResponse approach instead (simpler, one round trip)
  return null; // see GoogleSignInButton below
}

// ── Preferred: renderButton approach via GoogleLogin component ─────────────
import { GoogleLogin } from "@react-oauth/google";

export function GoogleSignInButton({ onSuccess, onError }: Props) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      onError?.("No credential received from Google");
      return;
    }
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential);
      onSuccess?.();
    } catch (err: any) {
      onError?.(err?.response?.data?.message ?? "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full py-2.5 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
          Signing in with Google…
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.("Google sign-in was cancelled or failed")}
          width="100%"
          theme="outline"
          shape="rectangular"
          text="continue_with"
          // locale="en"
        />
      )}
    </div>
  );
}