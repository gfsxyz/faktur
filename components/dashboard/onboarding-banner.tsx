import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "../ui/card";

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
    <Card
      className="relative h-44 animate-in slide-in-from-top-25 fade-in duration-500"
      withPatterns
    >
      <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
        <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4 max-w-xs text-xs">
          {description}
        </p>
        <Button asChild size="sm">
          <Link href={href}>{buttonText}</Link>
        </Button>
      </div>
    </Card>
  );
}
