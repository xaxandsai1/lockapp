import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function BladPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-white/[0.02]">
      <div className="w-full max-w-sm">
        <Card className="border-white/5 bg-white/[0.02]/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-100">Przepraszamy, coś poszło nie tak</CardTitle>
          </CardHeader>
          <CardContent>
            {params?.error ? (
              <p className="text-sm text-slate-300">Kod błędu: {params.error}</p>
            ) : (
              <p className="text-sm text-slate-300">Wystąpił nieokreślony błąd.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
