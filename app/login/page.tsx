import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-amber-200/80">
        Syntergy
      </p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight text-stone-50">
        Payments
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-400">
        Private ledger. Enter the password to continue.
      </p>
      <LoginForm nextPath={next && next.startsWith("/") ? next : "/"} />
    </main>
  );
}
