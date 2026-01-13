import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge className="mb-2">Admin</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-600">
              Gestiona el catalogo de configuracion.
            </p>
          </div>
          <Button type="button">Nuevo item</Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Items configurados</CardTitle>
            <CardDescription>
              Placeholder del CRUD. Aqui se listaran los items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
              Sin datos aun. Conectaremos Supabase y el formulario en el siguiente paso.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
