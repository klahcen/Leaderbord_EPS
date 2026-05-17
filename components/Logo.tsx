import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  /** Background behind the logo mark — use onDark for navy sidebar, onLight for topbar/cards */
  variant?: "onDark" | "onLight";
  className?: string;
  href?: string;
  priority?: boolean;
};

const sizeMap = {
  sm: 48,
  md: 72,
  lg: 128,
  xl: 168,
} as const;

export function Logo({
  size = "md",
  showText = true,
  variant = "onDark",
  className,
  href,
  priority = false,
}: LogoProps) {
  const dimension = sizeMap[size];
  const framePadding =
    size === "xl" ? 8 : size === "lg" ? 6 : size === "md" ? 5 : 4;
  const frameSize = dimension + framePadding * 2;

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full bg-white",
          size === "xl" || size === "lg"
            ? "shadow-lg ring-2 ring-[var(--color-gold)]/55 shadow-[var(--color-primary)]/15"
            : "shadow-md ring-1 ring-[var(--color-gold)]/40"
        )}
        style={{ width: frameSize, height: frameSize, padding: framePadding }}
      >
        <Image
          src="/logo.png"
          alt="Physical Education Leaderboard"
          width={dimension}
          height={dimension}
          className="h-full w-full object-contain"
          priority={priority}
        />
      </div>
      {showText && (
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              "truncate font-bold",
              size === "xl" || size === "lg" ? "text-lg" : "text-base",
              variant === "onLight"
                ? "text-[var(--color-secondary)]"
                : "text-white"
            )}
          >
            PE Sport
          </p>
          <p
            className={cn(
              "truncate font-semibold text-primary",
              size === "xl" || size === "lg" ? "text-sm" : "text-xs"
            )}
          >
            Leaderboard
          </p>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
