"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { clearToken } from "~/lib/auth";
import { McTopNav } from "~/components/mc";
import { useMe, useLogout } from "~/hooks/api/auth";
import { useInvalidateCache } from "~/hooks/api/useInvalidateCache";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { resetAuthMe } = useInvalidateCache();
  const navRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const { user, isLoading, error } = useMe({ retry: false, staleTime: 0 });

  const { logout, isPending: logoutPending } = useLogout({
    onSettled() {
      clearToken();
      resetAuthMe();
      router.push("/login");
    },
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (error) {
      clearToken();
      router.push("/login");
    }
  }, [error, router]);

  useEffect(() => {
    if (!user) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -64, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
      );
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: "power3.out" },
      );
    });
    return () => ctx.revert();
  }, [user]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          fontFamily: "var(--font-mc)",
          color: "#5aaa38",
          textShadow: "2px 2px 0 #2d7a2d",
          fontSize: "12px",
          letterSpacing: "0.1em",
          animation: "mc-blink 1s step-end infinite",
        }}
      >
        Loading world...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#111111",
      }}
    >
      <nav ref={navRef} style={{ opacity: 0 }}>
        <McTopNav
          pathname={pathname}
          userName={user.name}
          userRole={user.role}
          onLogout={() => logout(undefined)}
          logoutPending={logoutPending}
        />
      </nav>
      <main
        ref={mainRef}
        style={{ flex: 1, padding: "36px 32px", position: "relative", opacity: 0 }}
      >
        {children}
      </main>
    </div>
  );
}
