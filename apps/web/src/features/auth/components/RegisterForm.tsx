import { useState, type FormEvent } from "react";

interface RegisterFormProps {
  onSubmit: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function RegisterForm({
  onSubmit,
  loading,
  error,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <h2 className="text-2xl font-bold">Create Account</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        className="w-full rounded-lg border p-3"
      />

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className="w-full rounded-lg border p-3"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
        className="w-full rounded-lg border p-3"
      />

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 p-3 text-white disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Register"}
      </button>
    </form>
  );
}