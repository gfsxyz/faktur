import { LogoUpload } from "@/components/ui/logo-upload";

interface Step2Props {
  logoPreview: string | null;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  error?: string | null;
}

export function Step2Logo({
  logoPreview,
  onUpload,
  uploading,
  error,
}: Step2Props) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="py-2 flex justify-center sm:justify-center">
        <LogoUpload
          preview={logoPreview}
          onUpload={onUpload}
          uploading={uploading}
          error={error}
          size="lg"
        />
      </div>
    </div>
  );
}
