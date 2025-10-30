import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PublicNavigation } from "@/components/public-navigation"
import { Lock, Shield, Clock, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  return (
    <>
      <PublicNavigation />
      <div className="min-h-svh bg-white/[0.02]">
        {/* Hero Section */}
        <div className="flex items-center justify-center p-4 pb-12 pt-24 md:pt-32 md:pb-20">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image src="/logo.svg" alt="ChasteGlass Logo" width={400} height={84} className="w-64 md:w-96" priority />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-100 tracking-tight text-balance">
                Zarządzaj czasem z pełną kontrolą
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed text-pretty">
                Bezpieczna platforma do zarządzania wirtualnymi lockami czasu między SUB a KEYHOLDER. 100% SFW, pełna
                prywatność i kontrola.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link href="/auth/rejestracja">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 w-full sm:w-auto">
                  Rozpocznij teraz
                </Button>
              </Link>
              <Link href="/auth/logowanie">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/5-700 text-slate-200 hover:bg-slate-800 text-lg px-8 py-6 bg-transparent w-full sm:w-auto"
                >
                  Zaloguj się
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 text-center mb-12">Dlaczego ChasteGlass?</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 rounded-xl bg-white/[0.02]/50 backdrop-blur-xl border border-white/5 hover:border-white/5-700 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Lock className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">Zarządzanie lockami</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Twórz i zarządzaj lockami czasu z pełną kontrolą nad parametrami i regułami
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/[0.02]/50 backdrop-blur-xl border border-white/5 hover:border-white/5-700 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <CheckCircle2 className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">System zadań</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Twórz zadania typu check-in, quiz i proof z automatycznym systemem nagród
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/[0.02]/50 backdrop-blur-xl border border-white/5 hover:border-white/5-700 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Clock className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">Czas rzeczywisty</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Odliczanie czasu w czasie rzeczywistym z powiadomieniami o wszystkich zmianach
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/[0.02]/50 backdrop-blur-xl border border-white/5 hover:border-white/5-700 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Shield className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100">100% SFW</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bezpieczna platforma bez treści dla dorosłych, zgodna z RODO
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Gotowy na start?</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Dołącz do ChasteGlass i zacznij zarządzać czasem z pełną kontrolą i bezpieczeństwem
            </p>
            <Link href="/auth/rejestracja">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-10 py-6">
                Utwórz konto za darmo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
