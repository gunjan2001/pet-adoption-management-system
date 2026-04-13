// src/components/RegisterForm.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getErrorMessage, getFieldErrors } from "@/lib/errorHandler";

export default function RegisterForm() {
  const { register } = useAuth();
  const [, navigate] = useLocation();

  const [form,    setForm]    = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [apiErr,  setApiErr]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiErr(null);
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      // Map backend field errors to inline field messages
      const fields = getFieldErrors(err);
      if (fields.length > 0) {
        const map: Record<string, string> = {};
        fields.forEach((f) => { map[f.field] = f.message; });
        setErrors(map);
      } else {
        setApiErr(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={name}
      />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field("name",     "Full name *",  "text",     "Jane Doe")}
          {field("email",    "Email *",      "email",    "you@example.com")}
          {field("password", "Password *",   "password", "Min 8 chars, 1 uppercase, 1 number")}
          {field("phone",    "Phone",        "tel",      "+1 555 000 0000")}
          {field("address",  "Address",      "text",     "123 Main St")}

          {apiErr && (
            <p className="text-red-500 text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
              {apiErr}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>

      /* <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </CardFooter> */
  );
}
