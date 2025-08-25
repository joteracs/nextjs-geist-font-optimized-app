"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Brain, 
  Users, 
  Settings, 
  LogOut,
  Home,
  UserCog
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Solve Questions", href: "/dashboard/questions", icon: BookOpen },
  { name: "Review Flashcards", href: "/dashboard/flashcards", icon: Brain },
];

const adminNavigation = [
  { name: "Manage Questions", href: "/dashboard/admin/questions", icon: Settings },
  { name: "Manage Users", href: "/dashboard/admin/users", icon: Users },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4 shadow-lg">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            EduPlatform
          </h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                            : "text-gray-700 hover:text-blue-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-gray-700",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors"
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-300",
                            "h-6 w-6 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            {isAdmin && (
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-gray-500">
                  Administration
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            isActive
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                              : "text-gray-700 hover:text-blue-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-gray-700",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors"
                          )}
                        >
                          <item.icon
                            className={cn(
                              isActive
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-300",
                              "h-6 w-6 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            )}
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <UserCog className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="sr-only">Your profile</span>
                <span aria-hidden="true" className="truncate">
                  {session?.user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-red-700 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-300 dark:hover:bg-red-900/50"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
