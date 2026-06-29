"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, PawPrint, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className={styles.container}>
      {/* Left hero panel with ambient effects */}
      <div className={styles.leftSide}>
        <motion.div
          className={styles.illustration}
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={styles.brandMark}>
            <PawPrint size={56} strokeWidth={1.5} color="var(--accent)" />
            <span>Est. 2024</span>
          </div>
        </motion.div>
      </div>

      {/* Right login panel */}
      <div className={styles.rightSide}>
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <PawPrint size={18} strokeWidth={2.5} />
            </div>
            <span>Prakash Dog Training</span>
          </div>

          <div className={styles.header}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>
              Sign in to your account to continue managing registrations.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  required
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorMessage}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </motion.div>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} Prakash Dog Training School
        </div>
      </div>
    </div>
  );
}
