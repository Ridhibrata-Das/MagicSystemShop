export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center w-full">
      {children}
    </div>
  );
}
