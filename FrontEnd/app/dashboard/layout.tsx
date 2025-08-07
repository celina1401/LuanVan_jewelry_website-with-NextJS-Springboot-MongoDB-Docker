import DashboardSidebar from "./DashboardSidebar";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar />
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-8 px-4">
        <div className="md:w-1/4 w-full mb-4 md:mb-0">
          <DashboardSidebar />
        </div>
        <main className="md:w-3/4 w-full">
          <div className="bg-white dark:bg-black rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 min-h-[300px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 