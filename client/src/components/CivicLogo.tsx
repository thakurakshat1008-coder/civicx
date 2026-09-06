import { cn } from "@/lib/utils";

type CivicLogoProps = {
  className?: string;
  label?: string;
};

export function CivicLogo({ className, label = "CivicX logo" }: CivicLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={label}
      className={cn("h-10 w-10 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="civic-logo-bg" x1="12" y1="8" x2="88" y2="94" gradientUnits="userSpaceOnUse">
          <stop stopColor="#195C51" />
          <stop offset="1" stopColor="#0C3D35" />
        </linearGradient>
        <linearGradient id="civic-logo-glow" x1="31" y1="24" x2="72" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9A86A" />
          <stop offset="1" stopColor="#F5D5AE" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="84" height="84" rx="24" fill="url(#civic-logo-bg)" />
      <path d="M69 30C63 25 56 23 48 25C33 27 22 40 22 56C22 74 36 89 54 89C61 89 67 87 72 84" stroke="#B7DED0" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
      <path d="M68 30C61 27 53 28 46 32C37 36 30 46 30 57C30 72 42 84 58 84C63 84 68 83 73 80" stroke="url(#civic-logo-glow)" strokeWidth="6" strokeLinecap="round" />
      <path d="M56 32C51 33 48 37 47 42C45 50 49 56 56 61C62 65 63 68 61 73C59 77 55 80 51 79" stroke="#F7F5EB" strokeWidth="7" strokeLinecap="round" />
      <circle cx="56" cy="32" r="4" fill="#F7F5EB" />
      <circle cx="51" cy="79" r="4" fill="#E9A86A" />
    </svg>
  );
}
