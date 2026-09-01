import { useState } from "react";
import { loginUser } from "../services/authService";
import { Mark, LockIcon } from "../components/Icons";

function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      onLogin(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#16150F] text-[#F3EFE4]">
      {/* Paper-grain texture + single warm accent glow (no dual neon blur) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(243,239,228,0.9) 0.8px, transparent 0.8px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#BD7B24]/[0.14] blur-[110px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-center lg:px-16 lg:py-0">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* Branding — hidden on small screens to keep the form the focus */}
          <div className="hidden lg:block">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-lg border border-[#F3EFE4]/15 bg-[#F3EFE4]/[0.06] text-3xl leading-none text-[#E3B368]">
              <Mark />
            </div>

            <h1 className="font-[Fraunces] text-[3.4rem] font-medium leading-[1.05] tracking-tight">
              Read less.
              <br />
              Know more.
            </h1>

            <p className="mt-5 max-w-sm text-[15px] leading-7 text-[#F3EFE4]/60">
              DocMind reads your documents so you can go straight to the
              answer, with the source cited every time.
            </p>

            <dl className="mt-12 grid max-w-sm grid-cols-1 gap-5 border-t border-[#F3EFE4]/10 pt-8">
              {[
                ["Ask", "Plain questions, in your own words."],
                ["Cite", "Every answer points back to its page."],
                ["Skim", "Long reports become a short conversation."],
              ].map(([term, desc]) => (
                <div key={term} className="flex gap-4">
                  <dt className="w-14 shrink-0 font-[Fraunces] text-[15px] text-[#E3B368]">
                    {term}
                  </dt>
                  <dd className="text-[13px] leading-6 text-[#F3EFE4]/55">
                    {desc}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Login card */}
          <div className="w-full max-w-[420px] justify-self-center">
            <div className="rounded-2xl border border-[#F3EFE4]/10 bg-[#1D1B14] p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] sm:p-9">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#F3EFE4]/15 bg-[#F3EFE4]/[0.06] text-xl text-[#E3B368]">
                  <Mark />
                </div>
                <span className="font-[Fraunces] text-lg">DocMind</span>
              </div>

              <h2 className="font-[Fraunces] text-2xl font-medium tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-[#F3EFE4]/50">
                Sign in to pick up where you left off.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-1.5 block text-[13px] font-medium text-[#F3EFE4]/75"
                  >
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#F3EFE4]/12 bg-[#16150F] px-3.5 py-3 text-sm text-[#F3EFE4] outline-none placeholder:text-[#F3EFE4]/25 transition focus:border-[#E3B368]/50 focus:ring-2 focus:ring-[#E3B368]/15"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="text-[13px] font-medium text-[#F3EFE4]/75"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs text-[#F3EFE4]/40 transition hover:text-[#E3B368]"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#F3EFE4]/12 bg-[#16150F] px-3.5 py-3 text-sm text-[#F3EFE4] outline-none placeholder:text-[#F3EFE4]/25 transition focus:border-[#E3B368]/50 focus:ring-2 focus:ring-[#E3B368]/15"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-[#C1502E]/30 bg-[#C1502E]/10 px-3.5 py-2.5 text-[13px] text-[#E8977E]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#E3B368] px-4 py-3 text-sm font-semibold text-[#1D1B14] transition hover:bg-[#EDC17E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E3B368]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D1B14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#F3EFE4]/10" />
                <span className="text-[11px] text-[#F3EFE4]/30">or</span>
                <div className="h-px flex-1 bg-[#F3EFE4]/10" />
              </div>

              <p className="text-center text-[13px] text-[#F3EFE4]/50">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="font-medium text-[#E3B368] hover:underline"
                >
                  Create one
                </button>
              </p>

              <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#F3EFE4]/30">
                <LockIcon width={12} height={12} />
                Your documents stay private
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;