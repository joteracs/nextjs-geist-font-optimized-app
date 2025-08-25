"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function Header() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Welcome back, {session?.user?.name}!
          </h2>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </Button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" aria-hidden="true" />

          <div className="flex items-center gap-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden lg:flex lg:flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {session?.user?.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {session?.user?.role?.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
