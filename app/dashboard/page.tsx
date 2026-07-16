import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function DashboardPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-6xl px-5 py-32 text-center">
        <h1 className="text-3xl font-bold text-navy-900">Dashboard — coming next</h1>
        <p className="mt-3 text-slate-600">The SaaS dashboard mockup is being built.</p>
      </main>
      <SiteFooter />
    </>
  );
}
