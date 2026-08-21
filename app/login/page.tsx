import { LoginForm } from "@/app/login/login-form";
import { LanguageToggle } from "@/components/language-toggle";
import { getDictionary } from "@/lib/get-dictionary";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const { locale, t } = await getDictionary();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-amber-200/80">
            {t.brand}
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-stone-50">
            {t.product}
          </h1>
        </div>
        <LanguageToggle locale={locale} />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-400">{t.login.subtitle}</p>
      <LoginForm
        nextPath={next && next.startsWith("/") ? next : "/"}
        passwordLabel={t.login.password}
        submitLabel={t.login.submit}
        submittingLabel={t.login.submitting}
      />
    </main>
  );
}
