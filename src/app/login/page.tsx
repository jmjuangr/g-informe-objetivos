"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const formSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Contrasena requerida"),
})

const mockCredentials = {
  email: "admin@demo.com",
  password: "admin123",
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase.auth.getSession()
        if (!active) return
        if (data.session) {
          router.replace("/admin/dashboard")
        }
      } catch (error) {
        toast.error("No se pudo verificar la sesion.")
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [router])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true)
    try {
      if (!hasSupabaseEnv) {
        if (
          values.email === mockCredentials.email &&
          values.password === mockCredentials.password
        ) {
          localStorage.setItem("mock-admin", "true")
          toast.success("Sesion demo iniciada.")
          router.replace("/admin/dashboard")
          return
        }
        toast.error("Credenciales demo invalidas.")
        return
      }

      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        throw error
      }

      toast.success("Sesion iniciada.")
      router.replace("/admin/dashboard")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesion."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acceso administrador</CardTitle>
          <CardDescription>Inicia sesion para gestionar el catalogo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasSupabaseEnv && (
            <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
              Demo admin: {mockCredentials.email} / {mockCredentials.password}
            </div>
          )}
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@entidad.com"
                {...form.register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Ingresando..." : "Entrar"}
            </Button>
          </form>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Volver al inicio publico</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
