import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PotwierdzenieEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-white/[0.02]">
      <div className="w-full max-w-sm">
        <Card className="border-white/5 bg-white/[0.02]/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-100">Dziękujemy za rejestrację!</CardTitle>
            <CardDescription className="text-slate-400">Sprawdź swoją skrzynkę email</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pomyślnie utworzyłeś konto. Sprawdź swoją skrzynkę email, aby potwierdzić adres przed zalogowaniem się do
              aplikacji.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
