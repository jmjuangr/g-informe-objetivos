"use client"

import { useMemo, useState } from "react"
import { Download, Filter } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
})

const deadlineOptions = [
  "Primer trimestre",
  "Segundo trimestre",
  "Tercer trimestre",
  "Cuarto trimestre",
  "Año completo",
] as const

const NO_INSTRUCTION = "sin-instruction"
const NO_WORK_LINE = "sin-work-line"

const mockItems: ConfigurationItem[] = [
  {
    id: "1",
    created_at: "2024-01-01T00:00:00Z",
    instruction_id: "INS-01",
    work_line_id: "WL-01",
    item_id: "OBJ-001",
    commission: "Comisión A",
    instruction: "Instrucción 1",
    matter: "Materia 1",
    submatter: "Submateria 1",
    work_line: "Línea 1",
    item_objective: "Objetivo principal 1",
    item_objective_2: "Objetivo secundario A",
    status: "Activo",
    year: 2026,
  },
  {
    id: "2",
    created_at: "2024-01-01T00:00:00Z",
    instruction_id: "INS-01",
    work_line_id: "WL-02",
    item_id: "OBJ-002",
    commission: "Comisión A",
    instruction: "Instrucción 2",
    matter: "Materia 2",
    submatter: "Submateria 2",
    work_line: null,
    item_objective: "Objetivo principal 2",
    item_objective_2: null,
    status: "En revisión",
    year: 2026,
  },
  {
    id: "3",
    created_at: "2024-01-01T00:00:00Z",
    instruction_id: "INS-02",
    work_line_id: "WL-03",
    item_id: "OBJ-003",
    commission: "Comisión B",
    instruction: "Instrucción 1",
    matter: "Materia 3",
    submatter: "Submateria 1",
    work_line: "Línea 3",
    item_objective: "Objetivo principal 3",
    item_objective_2: "Objetivo secundario C",
    status: null,
    year: 2026,
  },
  {
    id: "4",
    created_at: "2024-01-01T00:00:00Z",
    instruction_id: "INS-03",
    work_line_id: "WL-04",
    item_id: "OBJ-004",
    commission: "Comisión C",
    instruction: "Instrucción 3",
    matter: "Materia 4",
    submatter: "Submateria 2",
    work_line: "Línea 2",
    item_objective: "Objetivo principal 4",
    item_objective_2: null,
    status: "Activo",
    year: 2026,
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

  const [selectedInstructionId, setSelectedInstructionId] = useState("")
  const [selectedWorkLineId, setSelectedWorkLineId] = useState("")
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({})

  const instructionOptions = useMemo(() => {
    const map = new Map<string, string>()
    items.forEach((item) => {
      const id = item.instruction_id ?? NO_INSTRUCTION
      const label = item.instruction || "Sin instruccion"
      if (!map.has(id)) {
        map.set(id, label)
      }
    })
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [items])

  const workLineOptions = useMemo(() => {
    if (!selectedInstructionId) return []
    const map = new Map<string, string>()
    items.forEach((item) => {
      const instructionId = item.instruction_id ?? NO_INSTRUCTION
      if (instructionId !== selectedInstructionId) return
      const id = item.work_line_id ?? NO_WORK_LINE
      const label = item.work_line || "Sin linea"
      if (!map.has(id)) {
        map.set(id, label)
      }
    })
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [items, selectedInstructionId])

  const cascadeItems = useMemo(() => {
    if (!selectedInstructionId || !selectedWorkLineId) return []
    return items.filter((item) => {
      const instructionId = item.instruction_id ?? NO_INSTRUCTION
      const workLineId = item.work_line_id ?? NO_WORK_LINE
      return (
        instructionId === selectedInstructionId &&
        workLineId === selectedWorkLineId
      )
    })
  }, [items, selectedInstructionId, selectedWorkLineId])

  const selectedIds = useMemo(
    () => Object.keys(selectedItems),
    [selectedItems],
  )
  const availableItems = useMemo(() => {
    return cascadeItems.filter((item) => !selectedIds.includes(item.id))
  }, [cascadeItems, selectedIds])
  const selectedRows = useMemo(
    () =>
      items
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => ({
          item,
          deadline: selectedItems[item.id] ?? "",
        })),
    [items, selectedIds, selectedItems],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entity: "",
      manager: "",
    },
  })

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedItems((prev) => {
      if (checked) {
        if (prev[id]) return prev
        return { ...prev, [id]: "" }
      }
      const { [id]: _, ...rest } = prev
      return rest
    })
  }

  const handleSelectAll = () => {
    setSelectedItems((prev) => {
      const next = { ...prev }
      availableItems.forEach((item) => {
        if (!next[item.id]) {
          next[item.id] = ""
        }
      })
      return next
    })
  }

  const handleClearSelection = () => {
    setSelectedItems({})
  }

  const onSubmit = form.handleSubmit(
    (values) => {
      if (selectedRows.length === 0) {
        toast.error("Selecciona al menos un item antes de exportar.")
        return
      }
      const missingDeadline = selectedRows.some(({ deadline }) => !deadline)
      if (missingDeadline) {
        toast.error("Selecciona el plazo para cada item.")
        return
      }

      try {
        const headers = buildCsvHeaders()
        const rows = buildCsvRows(values, selectedRows)
        const csv = stringifyCsv([headers, ...rows])
        const stamp = new Date().toISOString().slice(0, 10)
        const filename = `informe-${stamp}.csv`

        triggerCsvDownload(csv, filename)
        toast.success("CSV generado correctamente.", {
          description: `${values.entity} • ${values.manager}`,
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
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Acceso admin</Link>
            </Button>
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
                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                    <Filter className="size-4" />
                    Seleccion de Instruccion y Linea de trabajo
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Instruccion</Label>
                      <Select
                        value={selectedInstructionId}
                        onValueChange={(value) => {
                          setSelectedInstructionId(value)
                          setSelectedWorkLineId("")
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {instructionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Linea de trabajo</Label>
                      <Select
                        value={selectedWorkLineId}
                        onValueChange={setSelectedWorkLineId}
                        disabled={!selectedInstructionId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {workLineOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle>Items disponibles</CardTitle>
                <CardDescription>
                  {loading
                    ? "Cargando catalogo..."
                    : `${availableItems.length} disponibles`}
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
                    Agregar visibles
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleClearSelection}>
                    Limpiar seleccion
                  </Button>
                  <Badge variant="outline">{selectedIds.length} seleccionados</Badge>
                </div>
                <div className="rounded-lg border border-zinc-200/80">
                  <div className="grid grid-cols-[1.3fr_1fr_1.4fr_0.7fr_auto] gap-3 border-b border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
                    <span>Instruccion</span>
                    <span>Linea de trabajo</span>
                    <span>Objetivo de evaluacion</span>
                    <span>ID Objetivo</span>
                    <span>Accion</span>
                  </div>
                  {availableItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1.3fr_1fr_1.4fr_0.7fr_auto] items-center gap-3 border-b border-zinc-100 px-3 py-2 text-sm last:border-b-0"
                    >
                      <div>
                        <div className="font-medium text-zinc-900">
                          {item.instruction}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {item.matter} · {item.submatter}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-600">
                        {item.work_line ?? "Sin linea"}
                      </div>
                      <div className="text-xs text-zinc-600">
                        {item.item_objective ?? "Sin objetivo"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item.item_id ?? "Sin ID"}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => toggleSelection(item.id, true)}
                      >
                        Añadir
                      </Button>
                    </div>
                  ))}
                  {!loading && availableItems.length === 0 && (
                    <div className="px-4 py-6 text-sm text-zinc-500">
                      {!selectedInstructionId || !selectedWorkLineId
                        ? "Selecciona instruccion y linea para ver items."
                        : "No hay items disponibles para esta vista."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle>Items seleccionados</CardTitle>
                <CardDescription>
                  {selectedRows.length} items en el informe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRows.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500">
                    Aun no hay items seleccionados.
                  </div>
                ) : (
                  <div className="rounded-lg border border-zinc-200/80">
                    <div className="grid grid-cols-[1.6fr_1.2fr_1fr_0.5fr_auto] gap-3 border-b border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
                      <span>Item</span>
                      <span>Plazo</span>
                      <span>Estado</span>
                      <span>Año</span>
                      <span>Accion</span>
                    </div>
                    {selectedRows.map(({ item, deadline }) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1.6fr_1.2fr_1fr_0.5fr_auto] items-center gap-3 border-b border-zinc-100 px-3 py-2 text-sm last:border-b-0"
                      >
                        <div>
                          <div className="font-medium text-zinc-900">
                            {item.item_objective ?? "Sin objetivo"}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {item.instruction} · {item.work_line ?? "Sin linea"}
                          </div>
                        </div>
                        <Select
                          value={deadline}
                          onValueChange={(value) =>
                            setSelectedItems((prev) => ({
                              ...prev,
                              [item.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Plazo" />
                          </SelectTrigger>
                          <SelectContent>
                            {deadlineOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-zinc-600">
                          {item.status ?? "Sin estado"}
                        </div>
                        <div className="text-xs text-zinc-600">{item.year}</div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSelection(item.id, false)}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
