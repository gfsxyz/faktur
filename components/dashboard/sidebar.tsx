"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  LogOut,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
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
import { useTheme } from "next-themes";
import { trpc } from "@/lib/trpc/client";
import { signOut } from "@/lib/auth/client";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Business Profile",
    href: "/dashboard/profile",
    icon: Building2,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const { data: session } = useSessionSafe();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: businessProfile } = trpc.businessProfile.get.useQuery();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex h-full flex-col border-r bg-card">
      <div className="flex h-16 items-center px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <Image
            src={"/faktur-logo.svg"}
            alt="Faktur logo"
            width={24}
            height={24}
            className="dark:grayscale-100 dark:invert-100 transition-all duration-500 ease-in-out"
          />
          <span className="text-xl font-bold transition-colors duration-300">
            Faktur
          </span>
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname?.startsWith(item.href + "/"));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-2.5 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-left pl-2 w-full">
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
