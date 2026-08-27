import Link from "next/link";
import { SignupForm } from "@/app/signup/signup-form";
import { LanguageToggle } from "@/components/language-toggle";
import { getDictionary } from "@/lib/get-dictionary";

export default async function SignupPage() {
  const { locale, t } = await getDictionary();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-amber-200/80">
            {t.brand}
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-stone-50">
            {t.signup.title}
          </h1>
        </div>
        <LanguageToggle locale={locale} />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-400">{t.signup.subtitle}</p>
      <SignupForm
        emailLabel={t.login.email}
        passwordLabel={t.login.password}
        passwordHint={t.signup.passwordHint}
        submitLabel={t.signup.submit}
        submittingLabel={t.signup.submitting}
      />
      <p className="mt-6 text-sm text-stone-500">
        {t.signup.haveAccount}{" "}
        <Link href="/login" className="text-amber-100 hover:text-amber-50">
          {t.signup.loginLink}
        </Link>
      </p>
    </main>
  );
}
