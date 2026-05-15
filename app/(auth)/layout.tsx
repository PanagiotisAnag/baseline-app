export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.06)_0%,_transparent_60%)] pointer-events-none" />
      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
