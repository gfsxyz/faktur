import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OnboardingBannerProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export function OnboardingBanner({
  title,
  description,
  buttonText,
  href,
}: OnboardingBannerProps) {
  return (
    <div className="relative overflow-hidden h-48 md:h-56 animate-in slide-in-from-top-25 fade-in duration-500">
      <Image
        src="/bn.jpg"
        alt="Get started"
        fill
        className="object-cover grayscale-70"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/70 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-start justify-end p-6 md:p-8">
        <h2 className="text-xl md:text-3xl font-bold text-secondary dark:text-primary mb-2">
          {title}
        </h2>
        <p className="text-muted dark:text-muted-foreground mb-4 max-w-sm text-sm">
          {description}
        </p>
        <Button
          asChild
          size="lg"
          className="bg-secondary hover:bg-secondary/90 text-primary"
        >
          <Link href={href}>{buttonText}</Link>
        </Button>
      </div>
    </div>
  );
}
