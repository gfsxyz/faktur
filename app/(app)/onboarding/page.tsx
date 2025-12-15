"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { processImageForUpload } from "@/lib/image-utils";
import { useSession } from "@/lib/auth/client";
import { step1Schema, step3Schema, OnboardingData } from "./schemas";
import { Step1CompanyInfo } from "./steps/step1-company-info";
import { Step2Logo } from "./steps/step2-logo";
import { Step3Contact } from "./steps/step3-contact";
import { Step5Review } from "./steps/step5-review";
import LoadingLogo from "@/components/loading-logo";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const utils = trpc.useUtils();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: "",
    email: session?.user?.email || "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { data: onboardingStatus, isLoading: isLoadingOnboarding } =
    trpc.user.getOnboardingStatus.useQuery(undefined, {
      enabled: !!session,
    });
  const upsertBusinessProfile = trpc.businessProfile.upsert.useMutation();
  const uploadLogo = trpc.businessProfile.uploadLogo.useMutation();
  const completeOnboarding = trpc.user.completeOnboarding.useMutation();

  // Redirect if already onboarded
  useEffect(() => {
    if (
      !isLoadingOnboarding &&
      onboardingStatus &&
      onboardingStatus.hasCompletedOnboarding
    ) {
      router.push("/dashboard");
    }
  }, [onboardingStatus, isLoadingOnboarding, router]);

  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: onboardingData.companyName,
      email: onboardingData.email || session?.user?.email || "",
    },
  });

  const step3Form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      phone: onboardingData.phone || "",
      website: onboardingData.website || "",
    },
  });

  // Set default email when session loads
  useEffect(() => {
    if (session?.user?.email && !step1Form.getValues("email")) {
      step1Form.setValue("email", session.user.email);
      setOnboardingData((prev) => ({ ...prev, email: session.user.email }));
    }
  }, [session, step1Form]);

  const handleStep1Next = async () => {
    const isValid = await step1Form.trigger();
    if (isValid) {
      const values = step1Form.getValues();
      setOnboardingData((prev) => ({ ...prev, ...values }));
      setCurrentStep(2);
    }
  };

  const handleStep3Next = async () => {
    const isValid = await step3Form.trigger();
    if (isValid) {
      const values = step3Form.getValues();
      setOnboardingData((prev) => ({ ...prev, ...values }));
      setCurrentStep(4);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const base64Image = await processImageForUpload(file);
      setLogoPreview(base64Image);
      setOnboardingData((prev) => ({ ...prev, logo: base64Image }));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload logo";
      toast.error(errorMessage);
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = () => {
    setLogoPreview(null);
    setOnboardingData((prev) => ({ ...prev, logo: undefined }));
  };

  const handleConfirm = async () => {
    try {
      await upsertBusinessProfile.mutateAsync({
        companyName: onboardingData.companyName,
        email: onboardingData.email,
        phone: onboardingData.phone || "",
        website: onboardingData.website || "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      });

      if (onboardingData.logo) {
        await uploadLogo.mutateAsync({ logo: onboardingData.logo });
      }

      await completeOnboarding.mutateAsync();
      await utils.user.getOnboardingStatus.invalidate();

      toast.success("Welcome to Faktur!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to complete onboarding");
      console.error(error);
    }
  };

  if (isSessionLoading || isLoadingOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  const isSubmitting =
    upsertBusinessProfile.isPending ||
    uploadLogo.isPending ||
    completeOnboarding.isPending;

  // Determine button state for current step
  const getButtonConfig = () => {
    switch (currentStep) {
      case 1: {
        const companyName = step1Form.watch("companyName");
        const email = step1Form.watch("email");
        const isDisabled =
          !companyName?.trim() || !email?.trim() || !email.includes("@");
        return {
          showBack: false,
          nextLabel: "Continue",
          nextDisabled: isDisabled,
          onNext: handleStep1Next,
        };
      }
      case 2:
        return {
          showBack: true,
          nextLabel: logoPreview ? "Next" : "Skip",
          nextDisabled: false,
          onBack: () => setCurrentStep(1),
          onNext: () => setCurrentStep(3),
        };
      case 3: {
        const phone = step3Form.watch("phone");
        const website = step3Form.watch("website");
        const hasAnyValue = !!phone || !!website;
        return {
          showBack: true,
          nextLabel: hasAnyValue ? "Next" : "Skip",
          nextDisabled: false,
          onBack: () => setCurrentStep(2),
          onNext: handleStep3Next,
        };
      }
      case 4:
        return {
          showBack: true,
          nextLabel: isSubmitting ? "Setting up..." : "Launch",
          nextDisabled: isSubmitting,
          onBack: () => setCurrentStep(3),
          onNext: handleConfirm,
          isLoading: isSubmitting,
        };
      default:
        return {
          showBack: false,
          nextLabel: "Continue",
          nextDisabled: false,
          onNext: () => {},
        };
    }
  };

  const buttonConfig = getButtonConfig();

  // Get heading config for current step
  const getHeadingConfig = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Company Information",
          description: "Tell us about your business",
        };
      case 2:
        return {
          title: "Company Logo",
          description: "Upload your business logo (Optional)",
        };
      case 3:
        return {
          title: "Contact Details",
          description: "How can clients reach you? (Optional)",
        };
      case 4:
        return {
          title: "Review & Confirm",
          description: "Everything looks good?",
        };
      default:
        return { title: "", description: "" };
    }
  };

  const headingConfig = getHeadingConfig();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Onboarding Form */}
      <div className="flex items-start lg:items-center justify-center p-6 sm:p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 lg:space-y-12 py-4">
          {/* Progress Stepper */}
          <div>
            <Stepper steps={4} currentStep={currentStep} />
          </div>

          {/* Step Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              {headingConfig.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {headingConfig.description}
            </p>
          </div>

          {/* Content Container */}
          <div
            className={cn(
              "min-h-[200px] lg:min-h-72 flex items-center",
              buttonConfig.isLoading && "animate-pulse"
            )}
          >
            <div className="w-full">
              {currentStep === 1 && <Step1CompanyInfo form={step1Form} />}

              {currentStep === 2 && (
                <Step2Logo
                  logoPreview={logoPreview}
                  onUpload={handleLogoUpload}
                  onDelete={handleDeleteLogo}
                  uploading={uploadingLogo}
                />
              )}

              {currentStep === 3 && <Step3Contact form={step3Form} />}

              {currentStep === 4 && (
                <Step5Review data={onboardingData} logoPreview={logoPreview} />
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {buttonConfig.showBack && (
              <Button
                variant="outline"
                onClick={buttonConfig.onBack}
                size="lg"
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={buttonConfig.onNext}
              disabled={buttonConfig.nextDisabled}
              size="lg"
              className={cn(
                "flex-1",
                buttonConfig.isLoading && "animate-pulse"
              )}
            >
              {buttonConfig.nextLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Image (hidden on mobile) */}
      <div className="hidden lg:block relative bg-muted overflow-hidden">
        <Image
          src="/ob.jpg"
          alt="Onboarding illustration"
          fill
          className="object-cover grayscale-70  opacity-90"
          priority
        />
        {/* Primary color overlay */}
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-background/20 via-transparent to-background/40" />
        {/* Dither/grain effect */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </div>
  );
}
