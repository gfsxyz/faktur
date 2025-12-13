"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { FakturLogo } from "@/components/ui/faktur-logo";
import { NavAccent } from "@/components/ui/nav-accent";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSessionSafe } from "@/lib/hooks/use-session-safe";
import { useThemeToggle } from "@/lib/hooks/use-theme-toggle";
import { trpc } from "@/lib/trpc/client";
import { signOut } from "@/lib/auth/client";
import { navigationPages } from "@/lib/constants/navigation-pages";

export function Sidebar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { data: session } = useSessionSafe();
  const router = useRouter();
  const { isDark, toggleTheme } = useThemeToggle();
  const { data: businessProfile } = trpc.businessProfile.get.useQuery();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex h-full flex-col bg-accent/50">
      <div className="flex h-16 items-center px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <FakturLogo
            width={24}
            height={24}
            className="transition-all duration-500 ease-in-out"
          />
          <span className="text-xl font-bold transition-colors duration-300 text-primary">
            Faktur
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 relative">
        {navigationPages.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname?.startsWith(item.href + "/"));
          const isHovered = hoveredItem === item.name;
          const shouldShowHighlight = isHovered || (!hoveredItem && isActive);

          return (
            <Link
              key={item.name}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive && "bg-accent"
              )}
            >
              {shouldShowHighlight && (
                <motion.div
                  layoutId="nav-highlight"
                  className="absolute inset-0 bg-accent rounded-md"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 relative z-10 transition-colors",
                  isActive ? "text-accent-foreground" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "relative z-10 transition-colors",
                  isActive ? "text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {item.name}
              </span>

              {isActive && <NavAccent />}
            </Link>
          );
        })}
      </nav>

      <div className="px-2.5 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-left pl-2 w-full h-12">
              <Avatar>
                <AvatarImage
                  src={
                    businessProfile?.logo || session?.user?.image || undefined
                  }
                  alt={
                    businessProfile?.companyName ||
                    session?.user?.name ||
                    "user avatar"
                  }
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col space-y-1 w-full">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground max-w-full overflow-hidden truncate">
                  {businessProfile?.companyName ?? session?.user?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name}
                </p>
                <p
                  className="text-xs leading-none text-muted-foreground"
                  title={session?.user?.email}
                >
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              <div className="relative mr-2 h-4 w-4">
                <Sun
                  className={cn(
                    "absolute h-4 w-4 transition-all duration-300",
                    isDark
                      ? "rotate-90 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  )}
                />
                <Moon
                  className={cn(
                    "absolute h-4 w-4 transition-all duration-300",
                    isDark
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0"
                  )}
                />
              </div>
              <span className="transition-all duration-200">
                {isDark ? "Dark" : "Light"} Theme
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
