import { cn } from "@/lib/utils";

type CivicLogoProps = {
  className?: string;
  label?: string;
};

const CIVIC_LOGO_SRC = "/manus-storage/pasted_file_gRbcyY_image_4d8ccc8f.png";

export function CivicLogo({ className, label = "CivicX logo" }: CivicLogoProps) {
  return <img src={CIVIC_LOGO_SRC} alt={label} className={cn("h-10 w-10 shrink-0 rounded-2xl object-cover", className)} />;
}
