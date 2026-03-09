import AppShell from "@/components/layout/AppShell";
import AppProviders from "@/components/providers/AppProviders";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <AppShell>{children}</AppShell>
    </AppProviders>
  );
}
