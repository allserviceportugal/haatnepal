export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 text-5xl">✓</div>
        <h1 className="text-3xl font-bold text-green-600">Email Confirmed!</h1>
        <p className="mt-3 text-slate-600">Your email has been verified.</p>
        <p className="mt-2 text-sm text-slate-500">Token: {token}</p>
        <a
          href="/login"
          className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 text-white font-semibold hover:bg-orange-600"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
