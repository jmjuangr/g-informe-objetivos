"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createConfigurationItem,
  deleteConfigurationItem,
  fetchConfigurationItemsRaw,
  updateConfigurationItem,
} from "@/lib/supabase/queries"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ConfigurationItemInput, ConfigurationItemRecord } from "@/lib/supabase/types"

const formSchema = z.object({
  instruction_id: z.string().optional(),
  work_line_id: z.string().optional(),
  item_id: z.string().optional(),
  commission: z.string().min(1, "Comision requerida"),
  instruction: z.string().min(1, "Instruccion requerida"),
  matter: z.string().min(1, "Materia requerida"),
  submatter: z.string().min(1, "Submateria requerida"),
  work_line: z.string().optional(),
  work_line_unified: z.string().optional(),
  item_objective: z.string().min(1, "Objetivo requerido"),
  item_objective_2: z.string().optional(),
  status: z.string().optional(),
  year: z.coerce.number().int().min(2000, "Ano requerido"),
})

const defaultValues: z.infer<typeof formSchema> = {
  instruction_id: "",
  work_line_id: "",
  item_id: "",
  commission: "",
  instruction: "",
  matter: "",
  submatter: "",
  work_line: "",
  work_line_unified: "",
  item_objective: "",
  item_objective_2: "",
  status: "",
  year: 2026,
}

const normalizeOptional = (value?: string) => {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

const toPayload = (values: z.infer<typeof formSchema>): ConfigurationItemInput => {
  return {
    instruction_id: normalizeOptional(values.instruction_id),
    work_line_id: normalizeOptional(values.work_line_id),
    item_id: normalizeOptional(values.item_id),
    commission: values.commission.trim(),
    instruction: values.instruction.trim(),
    matter: values.matter.trim(),
    submatter: values.submatter.trim(),
    work_line: normalizeOptional(values.work_line),
    work_line_unified:
      normalizeOptional(values.work_line_unified) ??
      normalizeOptional(values.work_line),
    item_objective: values.item_objective.trim(),
    item_objective_2: normalizeOptional(values.item_objective_2),
    status: normalizeOptional(values.status),
    year: values.year,
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [items, setItems] = useState<ConfigurationItemRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const isEditing = Boolean(editingId)

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await fetchConfigurationItemsRaw()
      setItems(data)
    } catch (error) {
      toast.error("No se pudieron cargar los items.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          if (!localStorage.getItem("mock-admin")) {
            router.replace("/login")
            return
          }
          await loadItems()
          return
        }

        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase.auth.getSession()
        if (!active) return
        if (!data.session) {
          router.replace("/login")
          return
        }
        await loadItems()
      } catch (error) {
        toast.error("No se pudo validar la sesion.")
      }
    }

    init()

    return () => {
      active = false
    }
  }, [router])

  const handleLogout = async () => {
    try {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        localStorage.removeItem("mock-admin")
        router.replace("/login")
        return
      }
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      router.replace("/login")
    } catch (error) {
      toast.error("No se pudo cerrar sesion.")
    }
  }

  const handleEdit = (item: ConfigurationItemRecord) => {
    setEditingId(item.id)
    form.reset({
      instruction_id: item.instruction_id ?? "",
      work_line_id: item.work_line_id ?? "",
      item_id: item.item_id ?? "",
      commission: item.commission ?? "",
      instruction: item.instruction ?? "",
      matter: item.matter ?? "",
      submatter: item.submatter ?? "",
      work_line: item.work_line ?? "",
      work_line_unified: item.work_line_unified ?? "",
      item_objective: item.item_objective ?? "",
      item_objective_2: item.item_objective_2 ?? "",
      status: item.status ?? "",
      year: item.year ?? 2026,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este item?")) return
    try {
      await deleteConfigurationItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast.success("Item eliminado.")
    } catch (error) {
      toast.error("No se pudo eliminar el item.")
    }
  }

  const handleNew = () => {
    setEditingId(null)
    form.reset(defaultValues)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true)
    try {
      const payload = toPayload(values)
      if (editingId) {
        const updated = await updateConfigurationItem(editingId, payload)
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        )
        toast.success("Item actualizado.")
      } else {
        const created = await createConfigurationItem(payload)
        setItems((prev) => [created, ...prev])
        toast.success("Item creado.")
      }
      handleNew()
    } catch (error) {
      toast.error("No se pudo guardar el item.")
    } finally {
      setSaving(false)
    }
  })

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) =>
      (a.instruction ?? "").localeCompare(b.instruction ?? ""),
    )
  }, [items])

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
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleNew}>
              Nuevo item
            </Button>
            <Button type="button" onClick={handleLogout}>
              Salir
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Editar item" : "Nuevo item"}</CardTitle>
            <CardDescription>
              Completa los campos y guarda el item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label>Instruction ID</Label>
                <Input {...form.register("instruction_id")} />
              </div>
              <div className="space-y-2">
                <Label>Work Line ID</Label>
                <Input {...form.register("work_line_id")} />
              </div>
              <div className="space-y-2">
                <Label>Item ID</Label>
                <Input {...form.register("item_id")} />
              </div>
              <div className="space-y-2">
                <Label>Comision</Label>
                <Input {...form.register("commission")} />
              </div>
              <div className="space-y-2">
                <Label>Instruccion</Label>
                <Input {...form.register("instruction")} />
              </div>
              <div className="space-y-2">
                <Label>Materia</Label>
                <Input {...form.register("matter")} />
              </div>
              <div className="space-y-2">
                <Label>Submateria</Label>
                <Input {...form.register("submatter")} />
              </div>
              <div className="space-y-2">
                <Label>Linea de trabajo</Label>
                <Input {...form.register("work_line")} />
              </div>
              <div className="space-y-2">
                <Label>Linea de trabajo unificada</Label>
                <Input {...form.register("work_line_unified")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Objetivo</Label>
                <Input {...form.register("item_objective")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Objetivo 2</Label>
                <Input {...form.register("item_objective_2")} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input {...form.register("status")} />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input type="number" {...form.register("year")} />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
                </Button>
                {isEditing && (
                  <Button type="button" variant="ghost" onClick={handleNew}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items configurados</CardTitle>
            <CardDescription>
              {loading ? "Cargando items..." : `${sortedItems.length} items`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
                Cargando items...
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-200/80">
                <div className="grid grid-cols-[1.4fr_1fr_1.6fr_0.7fr_auto] gap-3 border-b border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
                  <span>Instruccion</span>
                  <span>Linea</span>
                  <span>Objetivo</span>
                  <span>ID</span>
                  <span>Accion</span>
                </div>
                {sortedItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1.4fr_1fr_1.6fr_0.7fr_auto] items-center gap-3 border-b border-zinc-100 px-3 py-2 text-sm last:border-b-0"
                  >
                    <div className="text-xs text-zinc-700">
                      {item.instruction ?? "Sin instruccion"}
                    </div>
                    <div className="text-xs text-zinc-600">
                      {item.work_line_unified ?? item.work_line ?? "Sin linea"}
                    </div>
                    <div className="text-xs text-zinc-600">
                      {item.item_objective ?? "Sin objetivo"}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {item.item_id ?? "Sin ID"}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
                {!loading && sortedItems.length === 0 && (
                  <div className="px-4 py-6 text-sm text-zinc-500">
                    No hay items cargados.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
