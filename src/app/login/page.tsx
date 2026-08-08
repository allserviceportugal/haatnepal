import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Log in to Haat Nepal</h1>
        <p className="mt-2 text-sm text-slate-600">
          Buy, sell, and chat with trusted sellers across Nepal.
        </p>
        <div className="mt-6">
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
