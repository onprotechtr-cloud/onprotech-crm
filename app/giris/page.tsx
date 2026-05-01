import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import InstallPWAButton from "@/components/pwa/InstallPWAButton";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-slate-900 to-orange-500 p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl lg:grid-cols-[1.2fr_0.8fr]">
        <div className="hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-300">ONPROTECH</div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">Satış, teklif ve randevu süreçlerinizi tek merkezden yönetin.</h1>
          </div>
          <div className="space-y-3 text-slate-300">
            <p>Profesyonel teklif hazırlama</p>
            <p>Takvim ve ziyaret planlama</p>
            <p>Müşteri portföyünü tek ekranda izleme</p>
          </div>
        </div>
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-500">Giriş</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">ONPROTECH CRM</h2>
            <p className="mt-2 text-sm text-slate-500">Devam etmek için hesabınızla giriş yapın.</p>
          </div>
          <LoginForm />
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Demo yönetici hesabı: <span className="font-medium text-slate-700">admin@onprotech.com / admin123</span>
          </div>
          <InstallPWAButton />
        </div>
      </div>
    </div>
  );
}