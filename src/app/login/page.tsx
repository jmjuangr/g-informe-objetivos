import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acceso administrador</CardTitle>
          <CardDescription>Inicia sesion para gestionar el catalogo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="admin@entidad.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contrasena</Label>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full" type="button">
            Entrar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
