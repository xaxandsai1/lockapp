import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicNavigation } from "@/components/public-navigation"
import { Lock, KeyRound, Shield, ListChecks, Timer, MessageSquareMore } from "lucide-react"

export default function ApkaPage() {
  return (
    <>
      <PublicNavigation />
      <main className="min-h-svh bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pt-24 md:pt-28 pb-16">
        <section className="max-w-5xl mx-auto space-y-12">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100">Jak działa Umbrella</h1>
            <p className="text-slate-300/90 max-w-3xl mx-auto">
              Umbrella pomaga parom D/s prowadzić wirtualne „locki czasu”. Nie ma tu treści NSFW —
              są za to jasne zasady, wygodna komunikacja i pełna historia decyzji.
            </p>
          </header>

          {/* Role */}
          <section className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02]/50 p-6 space-y-2">
              <div className="inline-flex items-center gap-2 text-slate-200">
                <KeyRound className="h-5 w-5" />
                <h2 className="font-semibold">Domin / Keyholder</h2>
              </div>
              <ul className="list-disc pl-5 text-slate-400 text-sm space-y-1">
                <li>Ustalanie zasad i czasu locka.</li>
                <li>Pauzy, dodawanie/odejmowanie czasu, nagrody i kary.</li>
                <li>Podgląd dziennika decyzji oraz raportów zadań.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02]/50 p-6 space-y-2">
              <div className="inline-flex items-center gap-2 text-slate-200">
                <Lock className="h-5 w-5" />
                <h2 className="font-semibold">Uległy / Sub</h2>
              </div>
              <ul className="list-disc pl-5 text-slate-400 text-sm space-y-1">
                <li>Akceptacja ustaleń i startu locka.</li>
                <li>Realizacja zadań i szybkie raporty postępu.</li>
                <li>Rozmowa w dedykowanym czacie — wszystko w jednym wątku.</li>
              </ul>
            </div>
          </section>

          {/* Funkcje */}
          <section className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <Timer className="h-5 w-5" />,
                title: "Liczniki i harmonogram",
                text: "Precyzyjny czas, przerwy i reguły zakończenia — bez liczenia „na oko”.",
              },
              {
                icon: <ListChecks className="h-5 w-5" />,
                title: "Zadania i checklisty",
                text: "Zadania dzienne/tygodniowe, dowody wykonania i przejrzysty postęp.",
              },
              {
                icon: <MessageSquareMore className="h-5 w-5" />,
                title: "Czat + dziennik",
                text: "Rozmowy w kontekście locka, a obok automatyczny log decyzji.",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Bezpieczeństwo",
                text: "Prywatność, szyfrowanie i słowo bezpieczeństwa. Komfort obu stron jest priorytetem.",
              },
              {
                icon: <KeyRound className="h-5 w-5" />,
                title: "Uprawnienia",
                text: "Domyślne role i czytelne zakresy — bez domysłów, kto co może.",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                title: "SFW",
                text: "Aplikacja jest neutralna — organizuje zasady, nie pokazuje treści dla dorosłych.",
              },
            ].map((b, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02]/50 p-6 space-y-2 hover:border-white/5-700 transition-colors">
                <div className="inline-flex items-center gap-2 text-slate-200">
                  {b.icon}
                  <h3 className="font-semibold">{b.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </section>

          <section className="text-center space-y-4">
            <Link href="/auth/rejestracja">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">Utwórz konto</Button>
            </Link>
            <p className="text-slate-500 text-sm">
              Masz pytania? <Link href="/kontakt" className="text-slate-300 hover:text-slate-100 underline underline-offset-4">Napisz do nas</Link>
            </p>
          </section>
        </section>
      </main>
    </>
  )
}
