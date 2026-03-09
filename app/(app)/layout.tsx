import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AppProviders from "@/components/providers/AppProviders";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <div className="min-h-screen">
        <Sidebar />
        <div className="ml-56">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AppProviders>
  );
}
