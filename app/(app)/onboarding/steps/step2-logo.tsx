import { LogoUpload } from "@/components/ui/logo-upload";

interface Step2Props {
  logoPreview: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => void;
  uploading: boolean;
}

export function Step2Logo({
  logoPreview,
  onUpload,
  onDelete,
  uploading,
}: Step2Props) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="py-2 flex justify-center sm:justify-center">
        <LogoUpload
          preview={logoPreview}
          onUpload={onUpload}
          onDelete={onDelete}
          uploading={uploading}
          className="w-64 h-64"
          previewClassName="w-64 h-64"
        />
      </div>
    </div>
  );
}
