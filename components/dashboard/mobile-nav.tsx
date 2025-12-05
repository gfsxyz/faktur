import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { navigationPages } from "@/lib/constants/navigation-pages";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useThemeToggle } from "@/lib/hooks/use-theme-toggle";
import { signOut } from "@/lib/auth/client";
import { useRouter, usePathname } from "next/navigation";

const MobileNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useThemeToggle();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="md:hidden border-b h-16 fixed bg-background w-full z-20 px-6 flex items-center justify-between">
        <div className="flex h-16 items-center">
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
        <Button
          variant={"ghost"}
          size="icon"
          className="rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.line
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              animate={
                isOpen
                  ? { x1: 4, y1: 4, x2: 20, y2: 20 }
                  : { x1: 0, y1: 6, x2: 24, y2: 6 }
              }
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
            <motion.line
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              animate={
                isOpen
                  ? { x1: 20, y1: 4, x2: 4, y2: 20 }
                  : { x1: 0, y1: 18, x2: 24, y2: 18 }
              }
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
          </svg>
        </Button>
      </header>
      {isOpen && (
        <nav className="pt-20 px-1 bg-background fixed w-full h-screen z-10">
          <div>
            {navigationPages.map((item) => (
              <Button
                variant={"ghost"}
                size={"xl"}
                className="w-full text-muted-foreground flex justify-between"
                key={item.name}
                asChild
              >
                <Link href={item.href}>
                  {item.name}
                  <item.icon className={cn("h-7 w-7 mr-3")} />
                </Link>
              </Button>
            ))}

            <Button
              variant={"ghost"}
              size={"xl"}
              className="w-full text-muted-foreground flex justify-between px-6"
              onClick={toggleTheme}
            >
              Theme
              <div className="relative flex items-center justify-center mr-1.5 h-7 w-7">
                <motion.div
                  initial={false}
                  animate={{
                    rotate: isDark ? 90 : 0,
                    scale: isDark ? 0 : 1,
                    opacity: isDark ? 0 : 1,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute"
                >
                  <Sun className="h-7 w-7" />
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{
                    rotate: isDark ? 0 : -90,
                    scale: isDark ? 1 : 0,
                    opacity: isDark ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute"
                >
                  <Moon className="h-7 w-7" />
                </motion.div>
              </div>
            </Button>

            <Button
              variant={"ghost"}
              size={"xl"}
              className="w-full text-muted-foreground flex justify-start px-6"
              onClick={handleSignOut}
            >
              Log out
            </Button>
          </div>
          <hr className="my-4" />
        </nav>
      )}
    </>
  );
};
export default MobileNav;
