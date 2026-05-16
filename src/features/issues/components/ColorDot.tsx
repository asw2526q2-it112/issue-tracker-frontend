interface ColorDotProps {
  color: string;
  title?: string;
  size?: "sm" | "md";
}

export function ColorDot({ color, title, size = "md" }: ColorDotProps) {
  const px = size === "sm" ? "size-2.5" : "size-3";
  return (
    <span
      className={`${px} inline-block shrink-0 rounded-full`}
      style={{ backgroundColor: color }}
      title={title}
      aria-label={title}
    />
  );
}