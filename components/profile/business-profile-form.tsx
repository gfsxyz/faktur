"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, X, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const businessProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  iban: z.string().optional(),
});

type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

export function BusinessProfileForm() {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = trpc.businessProfile.get.useQuery();
  const upsertMutation = trpc.businessProfile.upsert.useMutation();
  const uploadLogoMutation = trpc.businessProfile.uploadLogo.useMutation();
  const deleteLogoMutation = trpc.businessProfile.deleteLogo.useMutation();
  const utils = trpc.useUtils();

  const form = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      taxId: "",
      vatNumber: "",
      website: "",
      bankName: "",
      bankAccountNumber: "",
      bankRoutingNumber: "",
      swiftCode: "",
      iban: "",
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        companyName: profile.companyName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        postalCode: profile.postalCode || "",
        taxId: profile.taxId || "",
        vatNumber: profile.vatNumber || "",
        website: profile.website || "",
        bankName: profile.bankName || "",
        bankAccountNumber: profile.bankAccountNumber || "",
        bankRoutingNumber: profile.bankRoutingNumber || "",
        swiftCode: profile.swiftCode || "",
        iban: profile.iban || "",
      });
      if (profile.logo) {
        setLogoPreview(profile.logo);
      }
    }
  }, [profile, form]);

  const onSubmit = async (data: BusinessProfileFormData) => {
    try {
      await upsertMutation.mutateAsync(data);
      await utils.businessProfile.get.invalidate();
      toast({
        title: "Success",
        description: "Business profile saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business profile",
        variant: "destructive",
      });
    }
  };

  const processFile = async (file: File) => {
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Logo must be smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);

      try {
        await uploadLogoMutation.mutateAsync({ logo: base64 });
        await utils.businessProfile.get.invalidate();
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload logo",
          variant: "destructive",
        });
        setLogoPreview(null);
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await deleteLogoMutation.mutateAsync();
      await utils.businessProfile.get.invalidate();
      setLogoPreview(null);
      toast({
        title: "Success",
        description: "Logo deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete logo",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-4xl space-y-8"
      >
        {/* Logo Upload */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-medium">
              Company Logo
            </CardTitle>
            <CardDescription className="text-xs">
              Upload your company logo (max 2MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logoPreview ? (
              <div className="relative inline-block">
                <div className="group relative overflow-hidden rounded-lg border border-border/50 bg-muted/30 p-4">
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    className="h-32 w-32 object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteLogo}
                      disabled={deleteLogoMutation.isPending}
                    >
                      {deleteLogoMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  group relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed
                  transition-all duration-200
                  ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                  }
                  ${uploadingLogo ? "pointer-events-none opacity-60" : ""}
                `}
              >
                <div className="flex flex-col items-center justify-center px-6 py-10">
                  <div
                    className={`
                    mb-4 flex h-16 w-16 items-center justify-center rounded-full
                    transition-all duration-200
                    ${
                      isDragging
                        ? "bg-primary/20 text-primary scale-110"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:animate-pulse"
                    }
                  `}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <ImageIcon className="h-8 w-8" />
                    )}
                  </div>

                  <div className="text-center">
                    <p className="mb-1 text-sm font-medium">
                      {uploadingLogo
                        ? "Uploading..."
                        : isDragging
                        ? "Drop your logo here"
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Square ratio recommended. PNG, JPG or WEBP (max 2MB)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-medium">
              Company Information
            </CardTitle>
            <CardDescription className="text-xs">
              Basic information about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      Company Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Acme Inc."
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      Email *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="info@company.com"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+1 (555) 123-4567"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium">
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://company.com"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-medium">
              Business Address
            </CardTitle>
            <CardDescription className="text-xs">
              Your company's physical address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main St" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="San Francisco" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="United States" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="94102" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-medium">
              Tax Information
            </CardTitle>
            <CardDescription className="text-xs">
              Tax identification numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID / EIN</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12-3456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="GB123456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-medium">
              Bank Information
            </CardTitle>
            <CardDescription className="text-xs">
              Bank account details for payment instructions on invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Bank of America" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="bankAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1234567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankRoutingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="swiftCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SWIFT Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="BOFAUS3N" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="GB29 NWBK 6016 1331 9268 19"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-10 font-medium"
            disabled={upsertMutation.isPending}
          >
            {upsertMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Business Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
