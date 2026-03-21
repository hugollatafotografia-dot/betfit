import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-sm">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600">{description}</p>
        </header>

        <div className="mt-6">{children}</div>

        <footer className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
          {footer}
        </footer>
      </section>
    </main>
  );
}
