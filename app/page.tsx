import { Poppins } from "next/font/google";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { LoginButton } from "@/components/auth/login-button";
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  return (
    <>
      <main
        className="flex h-full flex-col items-center justify-center"
        style={{
          backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(253, 224, 71, 0.4) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(244, 114, 182, 0.5) 0%, transparent 80%)
        `,
        }}
      >
        <div className="space-y-6 text-center">
          <h1
            className={cn(
              "text-6xl font-semibold text-white drop-shadow-md",
              font.className
            )}
          >
            🔐 Auth
          </h1>
          <p className="text-white text-lg">A simple authentication service</p>
          <div>
            <LoginButton asChild>
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </LoginButton>
          </div>
        </div>
      </main>
    </>
  );
}
