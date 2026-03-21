import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-24">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/90 p-10 text-center shadow-sm backdrop-blur-sm">
        {children}
      </section>
    </main>
  );
}
