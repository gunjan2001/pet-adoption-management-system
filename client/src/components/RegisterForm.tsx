// src/components/RegisterForm.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getErrorMessage, getFieldErrors } from "@/lib/errorHandler";

export default function RegisterForm() {
  const { register, isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  const [form,    setForm]    = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [apiErr,  setApiErr]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (!isAuthenticated) return;

    const destination = user?.role === "admin" ? "/admin" : "/dashboard";
    navigate(destination);
  }, [isAuthenticated, user?.role, navigate]);

  const validateName = (value: string): string | null => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Full name must be at least 2 characters";
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Please enter a valid email address";
  };

  const validatePassword = (value: string): string | null => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain a number";
    return null;
  };

  const validatePhone = (value: string): string | null => {
    if (!value.trim()) return null;
    const digits = value.replace(/\D/g, "");
    return digits.length < 7 ? "Please enter a valid phone number" : null;
  };

  const validateAddress = (value: string): string | null => {
    if (!value.trim()) return null;
    return value.trim().length < 5 ? "Address must be at least 5 characters" : null;
  };

  const validateField = (name: keyof typeof form, value: string): string | null => {
    switch (name) {
      case "name":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "phone":
        return validatePhone(value);
      case "address":
        return validateAddress(value);
      default:
        return null;
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const phoneError = validatePhone(form.phone);
    const addressError = validateAddress(form.address);

    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    if (phoneError) nextErrors.phone = phoneError;
    if (addressError) nextErrors.address = addressError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof form;
    const value = e.target.value;
    const fieldError = validateField(name, value);

    setErrors((prev) => {
      const next = { ...prev };
      if (fieldError) {
        next[name] = fieldError;
      } else {
        delete next[name];
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErr(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      const fields = getFieldErrors(err);
      if (fields.length > 0) {
        const map: Record<string, string> = {};
        fields.forEach((f) => {
          map[f.field] = f.message;
        });
        setErrors(map);
      } else {
        setApiErr(getErrorMessage(err));
        toast.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (
    name: keyof typeof form,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete={"off"}
        className={`w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus-visible:ring-[1px] focus:ring-black/10 ${errors[name] ? "border-red-500 focus-visible:ring-red-400" : ""}`}
      />
      {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {field("name", "Full name *", "text", "Jane Doe")}
        {field("email", "Email *", "text", "you@example.com")}
        {field("password", "Password *", "password", "Min 8 chars, 1 uppercase, 1 number")}
        {field("phone", "Phone", "tel", "+1 555 000 0000")}
        {field("address", "Address", "text", "123 Main St")}

        {/* {apiErr && (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {apiErr}
          </p>
        )} */}

        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-black text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}

