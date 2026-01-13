"use client"

import { useMemo, useState } from "react"
import { Download, Filter } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useConfigurationItems } from "@/hooks/use-configuration-items"
import {
  buildCsvHeaders,
  buildCsvRows,
  stringifyCsv,
  triggerCsvDownload,
} from "@/lib/csv-utils"
import type { ConfigurationItem } from "@/lib/supabase/types"

const formSchema = z.object({
  entity: z.string().min(2, "Entidad requerida"),
  manager: z.string().min(2, "Gestor requerido"),
  deadline: z.string().min(1, "Plazo requerido"),
})

const mockItems: ConfigurationItem[] = [
  {
    id: "1",
    created_at: "2024-01-01T00:00:00Z",
    commission: "Comisión A",
    instruction: "Instrucción 1",
    matter: "Materia 1",
    submatter: "Submateria 1",
    work_line: "Línea 1",
    year: 2024,
  },
  {
    id: "2",
    created_at: "2024-01-01T00:00:00Z",
    commission: "Comisión A",
    instruction: "Instrucción 2",
    matter: "Materia 2",
    submatter: "Submateria 2",
    work_line: null,
    year: 2023,
  },
  {
    id: "3",
    created_at: "2024-01-01T00:00:00Z",
    commission: "Comisión B",
    instruction: "Instrucción 1",
    matter: "Materia 3",
    submatter: "Submateria 1",
    work_line: "Línea 3",
    year: 2024,
  },
  {
    id: "4",
    created_at: "2024-01-01T00:00:00Z",
    commission: "Comisión C",
    instruction: "Instrucción 3",
    matter: "Materia 4",
    submatter: "Submateria 2",
    work_line: "Línea 2",
    year: 2022,
  },
]

export default function Home() {
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { data, error, loading } = useConfigurationItems({
    enabled: hasSupabaseEnv,
  })
  const items = hasSupabaseEnv ? data : mockItems

  const [commissionFilter, setCommissionFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const commissions = useMemo(
    () => Array.from(new Set(items.map((item) => item.commission))).sort(),
    [items],
  )
  const years = useMemo(
    () => Array.from(new Set(items.map((item) => item.year))).sort((a, b) => b - a),
    [items],
  )

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCommission =
        commissionFilter === "all" || item.commission === commissionFilter
      const matchesYear = yearFilter === "all" || String(item.year) === yearFilter
      return matchesCommission && matchesYear
    })
  }, [items, commissionFilter, yearFilter])

  const filteredIds = useMemo(
    () => filteredItems.map((item) => item.id),
    [filteredItems],
  )
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entity: "",
      manager: "",
      deadline: "",
    },
  })

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, id]))
      }
      return prev.filter((itemId) => itemId !== id)
    })
  }

  const handleSelectAll = () => {
    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])))
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const onSubmit = form.handleSubmit(
    (values) => {
      if (selectedItems.length === 0) {
        toast.error("Selecciona al menos un item antes de exportar.")
        return
      }

      try {
        const headers = buildCsvHeaders()
        const rows = buildCsvRows(values, selectedItems)
        const csv = stringifyCsv([headers, ...rows])
        const stamp = new Date().toISOString().slice(0, 10)
        const filename = `informe-${stamp}.csv`

        triggerCsvDownload(csv, filename)
        toast.success("CSV generado correctamente.", {
          description: `${values.entity} • ${values.manager} • ${values.deadline}`,
        })
      } catch (error) {
        toast.error("No se pudo generar el CSV.")
      }
    },
    () => {
      toast.error("Completa los datos de cabecera para exportar.")
    },
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f4ef_0%,_#f1f0ed_40%,_#e7e4df_100%)] text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-zinc-900 text-zinc-50">Publico</Badge>
            <Badge variant="outline">CSV client-side</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Generador de informes estandarizados
          </h1>
          <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
            Completa los metadatos, filtra el catalogo y selecciona los items que
            formaran parte del informe.
          </p>
          {!hasSupabaseEnv && (
            <p className="max-w-2xl text-sm text-zinc-500">
              Vista demo con datos locales. Configura las variables de entorno para
              leer desde Supabase.
            </p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.45fr]">
          <Card className="border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle>Datos de cabecera</CardTitle>
              <CardDescription>Informacion general para el CSV.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="entity">Entidad</Label>
                  <Input
                    id="entity"
                    placeholder="Entidad ejecutora"
                    {...form.register("entity")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Gestor</Label>
                  <Input
                    id="manager"
                    placeholder="Responsable"
                    {...form.register("manager")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plazo estimado</Label>
                  <Controller
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un plazo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30 dias">30 dias</SelectItem>
                          <SelectItem value="60 dias">60 dias</SelectItem>
                          <SelectItem value="90 dias">90 dias</SelectItem>
                          <SelectItem value="120 dias">120 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                  <Filter className="size-4" />
                  Filtros rapidos
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Comisión</Label>
                    <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {commissions.map((commission) => (
                          <SelectItem key={commission} value={commission}>
                            {commission}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Año</Label>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle>Items configurados</CardTitle>
              <CardDescription>
                {loading
                  ? "Cargando catalogo..."
                  : `${filteredItems.length} items filtrados`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Error al cargar items: {error.message}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={handleSelectAll}>
                  Seleccionar visibles
                </Button>
                <Button type="button" variant="ghost" onClick={handleClearSelection}>
                  Limpiar seleccion
                </Button>
                <Badge variant="outline">
                  {selectedIds.length} seleccionados
                </Badge>
              </div>
              <div className="grid gap-3">
                {filteredItems.map((item) => {
                  const checked = selectedIds.includes(item.id)
                  return (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200/80 bg-white px-4 py-3 text-sm transition hover:border-zinc-300"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleSelection(item.id, Boolean(value))
                        }
                      />
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-medium text-zinc-900">
                          {item.commission} · {item.instruction}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {item.matter} / {item.submatter}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>Año {item.year}</span>
                          {item.work_line && <span>Línea: {item.work_line}</span>}
                        </div>
                      </div>
                    </label>
                  )
                })}
                {!loading && filteredItems.length === 0 && (
                  <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500">
                    No hay items con esos filtros.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-zinc-200/80 bg-zinc-900 text-zinc-50 shadow-lg">
          <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                Exportacion
              </p>
              <p className="text-lg font-semibold">
                Lista para generar el archivo CSV.
              </p>
            </div>
            <Button
              type="button"
              className="gap-2 bg-white text-zinc-900 hover:bg-zinc-100"
              onClick={onSubmit}
            >
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
