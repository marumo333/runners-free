//register/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "customer">("customer");
  const router = useRouter();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    }).then((res) => res.json());
    if (!error) {
      router.replace("/Login");
    } else {
      alert(error);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (≥8)"
          minLength={8}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="freelancer">フリーランス</option>
          <option value="customer">お客様</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </>
  );
}
