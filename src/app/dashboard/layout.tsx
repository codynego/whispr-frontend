

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-100 h-screen p-4">
        <p>Sidebar</p>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
