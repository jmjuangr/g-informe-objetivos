"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Download } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import Link from "next/link"
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAllObjectiveItems } from "@/hooks/use-all-objective-items"
import type { ObjectiveItem } from "@/lib/supabase/types"

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

type DraftItem = {
  item: ObjectiveItem
  deadline: string
  observations: string
}

type DraftPayload = {
  version: 1
  metadata: {
    entity: string
    manager: string
  }
  items: DraftItem[]
}

const DRAFT_VERSION = 1

const pdfStyles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 140,
    height: 37,
  },
  title: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: 700,
  },
  meta: {
    fontSize: 11,
    marginBottom: 2,
  },
  section: {
    marginTop: 12,
  },
  instruction: {
    fontSize: 12,
    fontWeight: 600,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  rowItem: {
    width: "45%",
    paddingRight: 8,
  },
  rowDeadline: {
    width: "25%",
    paddingRight: 8,
  },
  rowObservations: {
    width: "30%",
  },
  rowTitle: {
    fontSize: 11,
    fontWeight: 600,
  },
  rowDetails: {
    marginTop: 2,
  },
  rowLine: {
    fontSize: 10,
    color: "#374151",
  },
  rowMeta: {
    fontSize: 10,
    color: "#111827",
  },
})

type MockObjectiveItem = ObjectiveItem & {
  instruction_id: string
  work_line_id: string
}

const mockItems: MockObjectiveItem[] = [
  {
    id: "1",
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
    instruction_id: "INS-01",
    work_line_id: "WL-02",
    item_id: "OBJ-002",
    commission: "Comisión A",
    instruction: "Instrucción 2",
    matter: "Materia 2",
    submatter: "Submateria 2",
    work_line: "Línea 2",
    item_objective: "Objetivo principal 2",
    item_objective_2: null,
    status: "En revisión",
    year: 2026,
  },
  {
    id: "3",
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
    instruction_id: "INS-03",
    work_line_id: "WL-04",
    item_id: "OBJ-004",
    commission: "Comisión C",
    instruction: "Instrucción 3",
    matter: "Materia 4",
    submatter: "Submateria 2",
    work_line: "Línea 4",
    item_objective: "Objetivo principal 4",
    item_objective_2: null,
    status: "Activo",
    year: 2026,
  },
]

type MultiSelectFilterProps = {
  title: string
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder: string
  disabled?: boolean
}

const MultiSelectFilter = ({
  title,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: MultiSelectFilterProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectedCount = value.length
  const label =
    selectedCount === 0
      ? placeholder
      : `${selectedCount} seleccionadas`

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [open])

  useEffect(() => {
    if (disabled) {
      setOpen(false)
    }
  }, [disabled])

  return (
    <div ref={containerRef} className="relative z-20 space-y-2">
      <p className="text-sm font-medium text-zinc-600">{title}</p>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex w-full min-w-[12rem] items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span>{label}</span>
            <ChevronDown className="size-4 text-zinc-400" />
          </button>
          {open && (
            <div className="absolute left-0 z-50 mt-2 w-72 rounded-md border border-zinc-200 bg-white p-2 shadow-lg">
            {options.length === 0 ? (
              <div className="px-2 py-3 text-xs text-zinc-500">
                No hay opciones disponibles.
              </div>
            ) : (
              <div className="max-h-64 overflow-auto">
                {options.map((option) => {
                  const checked = value.includes(option)
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(nextChecked) => {
                          onChange(
                            nextChecked
                              ? value.includes(option)
                                ? value
                                : [...value, option]
                              : value.filter((item) => item !== option),
                          )
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  )
                })}
              </div>
            )}
            </div>
          )}
        </div>
        <Badge variant="outline">
          {selectedCount === 0 ? "Sin filtros" : `${selectedCount} activas`}
        </Badge>
      </div>
    </div>
  )
}

export default function Home() {
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
  const [selectedItems, setSelectedItems] = useState<
    Record<string, { item: ObjectiveItem; deadline: string; observations: string }>
  >({})
  const [selectedInstructionFilters, setSelectedInstructionFilters] = useState<string[]>(
    [],
  )
  const [availableInstructionFilters, setAvailableInstructionFilters] = useState<
    string[]
  >([])
  const [selectedWorkLineFilters, setSelectedWorkLineFilters] = useState<string[]>(
    [],
  )
  const [availableWorkLineFilters, setAvailableWorkLineFilters] = useState<string[]>(
    [],
  )
  const [availableChecked, setAvailableChecked] = useState<Set<string>>(
    () => new Set(),
  )
  const [selectedChecked, setSelectedChecked] = useState<Set<string>>(
    () => new Set(),
  )
  const draftInputRef = useRef<HTMLInputElement | null>(null)

  const mockObjectiveItems = useMemo(
    () => mockItems.map(({ instruction_id, ...rest }) => rest),
    [],
  )
  const fallbackItems = useMemo(
    () => (hasSupabaseEnv ? [] : mockObjectiveItems),
    [hasSupabaseEnv, mockObjectiveItems],
  )

  const {
    data: allObjectiveItems,
    error: itemsError,
    loading: itemsLoading,
  } = useAllObjectiveItems({
    enabled: hasSupabaseEnv,
    fallback: fallbackItems,
  })

  const selectedRows = useMemo(() => {
    return Object.values(selectedItems).sort((a, b) => {
      const instructionCompare = (a.item.instruction ?? "").localeCompare(
        b.item.instruction ?? "",
      )
      if (instructionCompare !== 0) return instructionCompare
      const workLineCompare = (a.item.work_line ?? "").localeCompare(
        b.item.work_line ?? "",
      )
      if (workLineCompare !== 0) return workLineCompare
      return (a.item.item_objective ?? "").localeCompare(
        b.item.item_objective ?? "",
      )
    })
  }, [selectedItems])
  const selectedIds = useMemo(() => Object.keys(selectedItems), [selectedItems])
  const availableItems = useMemo(() => {
    return allObjectiveItems.filter((item) => !selectedIds.includes(item.id))
  }, [allObjectiveItems, selectedIds])
  const compareObjectiveItems = (a: ObjectiveItem, b: ObjectiveItem) => {
    const instructionCompare = (a.instruction ?? "").localeCompare(
      b.instruction ?? "",
    )
    if (instructionCompare !== 0) return instructionCompare
    const workLineCompare = (a.work_line ?? "").localeCompare(b.work_line ?? "")
    if (workLineCompare !== 0) return workLineCompare
    return (a.item_objective ?? "").localeCompare(b.item_objective ?? "")
  }
  const instructionOptions = useMemo(() => {
    const set = new Set<string>()
    allObjectiveItems.forEach((item) => {
      if (item.instruction) {
        set.add(item.instruction)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [allObjectiveItems])
  const availableInstructionFilteredItems = useMemo(() => {
    if (availableInstructionFilters.length === 0) return availableItems
    const active = new Set(availableInstructionFilters)
    return availableItems.filter((item) =>
      item.instruction ? active.has(item.instruction) : false,
    )
  }, [availableInstructionFilters, availableItems])
  const availableWorkLineOptions = useMemo(() => {
    if (availableInstructionFilters.length === 0) return []
    const set = new Set<string>()
    availableInstructionFilteredItems.forEach((item) => {
      if (item.work_line) {
        set.add(item.work_line)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [availableInstructionFilters.length, availableInstructionFilteredItems])
  const filteredAvailableItems = useMemo(() => {
    if (availableWorkLineFilters.length === 0) return availableInstructionFilteredItems
    const active = new Set(availableWorkLineFilters)
    return availableInstructionFilteredItems.filter((item) =>
      item.work_line ? active.has(item.work_line) : false,
    )
  }, [availableInstructionFilteredItems, availableWorkLineFilters])
  const groupedAvailableItems = useMemo(() => {
    const map = new Map<string, ObjectiveItem[]>()
    filteredAvailableItems.forEach((item) => {
      const key = item.instruction || "Sin instruccion"
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)?.push(item)
    })
    const entries = Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    )
    entries.forEach(([, items]) => items.sort(compareObjectiveItems))
    return entries
  }, [filteredAvailableItems])
  const selectedInstructionFilteredRows = useMemo(() => {
    if (selectedInstructionFilters.length === 0) return selectedRows
    const active = new Set(selectedInstructionFilters)
    return selectedRows.filter((row) => active.has(row.item.instruction))
  }, [selectedInstructionFilters, selectedRows])
  const selectedWorkLineOptions = useMemo(() => {
    if (selectedInstructionFilters.length === 0) return []
    const set = new Set<string>()
    selectedInstructionFilteredRows.forEach((row) => {
      if (row.item.work_line) {
        set.add(row.item.work_line)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [selectedInstructionFilters.length, selectedInstructionFilteredRows])
  const filteredSelectedRows = useMemo(() => {
    if (selectedWorkLineFilters.length === 0) return selectedInstructionFilteredRows
    const active = new Set(selectedWorkLineFilters)
    return selectedInstructionFilteredRows.filter((row) =>
      row.item.work_line ? active.has(row.item.work_line) : false,
    )
  }, [selectedInstructionFilteredRows, selectedWorkLineFilters])
  const groupedSelectedRows = useMemo(() => {
    const map = new Map<string, typeof selectedRows>()
    filteredSelectedRows.forEach((row) => {
      const key = row.item.instruction || "Sin instruccion"
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)?.push(row)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredSelectedRows])

  useEffect(() => {
    if (availableInstructionFilters.length === 0) {
      if (availableWorkLineFilters.length > 0) {
        setAvailableWorkLineFilters([])
      }
      return
    }
    if (availableWorkLineFilters.length === 0) return
    const active = new Set(availableWorkLineOptions)
    const next = availableWorkLineFilters.filter((line) => active.has(line))
    if (next.length !== availableWorkLineFilters.length) {
      setAvailableWorkLineFilters(next)
    }
  }, [
    availableInstructionFilters.length,
    availableWorkLineFilters,
    availableWorkLineOptions,
  ])

  useEffect(() => {
    if (selectedInstructionFilters.length === 0) {
      if (selectedWorkLineFilters.length > 0) {
        setSelectedWorkLineFilters([])
      }
      return
    }
    if (selectedWorkLineFilters.length === 0) return
    const active = new Set(selectedWorkLineOptions)
    const next = selectedWorkLineFilters.filter((line) => active.has(line))
    if (next.length !== selectedWorkLineFilters.length) {
      setSelectedWorkLineFilters(next)
    }
  }, [
    selectedInstructionFilters.length,
    selectedWorkLineFilters,
    selectedWorkLineOptions,
  ])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entity: "",
      manager: "",
    },
  })

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => {
      const { [id]: _, ...rest } = prev
      return rest
    })
    setSelectedChecked((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }
  const handleAddItem = (item: ObjectiveItem) => {
    setSelectedItems((prev) => {
      if (prev[item.id]) return prev
      return { ...prev, [item.id]: { item, deadline: "", observations: "" } }
    })
    setAvailableChecked((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
  }

  const handleRestoreAll = () => {
    setSelectedItems({})
    setAvailableChecked(new Set())
    setSelectedChecked(new Set())
  }

  const handleClearSelection = () => {
    setSelectedItems({})
    setAvailableChecked(new Set())
    setSelectedChecked(new Set())
  }

  const handleAddSelected = () => {
    if (availableChecked.size === 0) return
    const availableMap = new Map(
      availableItems.map((item) => [item.id, item]),
    )
    setSelectedItems((prev) => {
      const next = { ...prev }
      availableChecked.forEach((id) => {
        const item = availableMap.get(id)
        if (!item || next[id]) return
        next[id] = { item, deadline: "", observations: "" }
      })
      return next
    })
    setAvailableChecked(new Set())
  }

  const handleAddAllAvailable = () => {
    if (availableItems.length === 0) return
    setSelectedItems((prev) => {
      const next = { ...prev }
      availableItems.forEach((item) => {
        if (!next[item.id]) {
          next[item.id] = { item, deadline: "", observations: "" }
        }
      })
      return next
    })
    setAvailableChecked(new Set())
  }

  const handleRemoveSelected = () => {
    if (selectedChecked.size === 0) return
    setSelectedItems((prev) => {
      const next = { ...prev }
      selectedChecked.forEach((id) => {
        delete next[id]
      })
      return next
    })
    setSelectedChecked(new Set())
  }

  const handleExportDraft = () => {
    const values = form.getValues()
    const entity = values.entity.trim()
    if (!entity) {
      toast.error("Completa la entidad antes de exportar el borrador.")
      return
    }
    const payload: DraftPayload = {
      version: DRAFT_VERSION,
      metadata: {
        entity,
        manager: values.manager,
      },
      items: selectedRows,
    }

    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const stamp = new Date().toISOString().slice(0, 10)
    const safeEntity = entity
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
    const entityPart = safeEntity || "entidad"
    link.href = url
    link.download = `borrador-informe-${stamp}-${entityPart}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success("Borrador exportado.")
  }

  const handleImportDraft = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as DraftPayload
        if (parsed.version !== DRAFT_VERSION || !Array.isArray(parsed.items)) {
          toast.error("El borrador no tiene un formato valido.")
          return
        }

        form.setValue("entity", parsed.metadata?.entity ?? "")
        form.setValue("manager", parsed.metadata?.manager ?? "")
        setSelectedItems(() => {
          const next: Record<
            string,
            { item: ObjectiveItem; deadline: string; observations: string }
          > = {}
          parsed.items.forEach((row) => {
            if (!row?.item?.id) return
            next[row.item.id] = {
              item: row.item,
              deadline: row.deadline ?? "",
              observations: row.observations ?? "",
            }
          })
          return next
        })
        setAvailableChecked(new Set())
        setSelectedChecked(new Set())
        toast.success("Borrador importado.")
      } catch (error) {
        toast.error("No se pudo importar el borrador.")
      }
    }
    reader.readAsText(file)
  }

  const buildPdfDocument = (
    metadata: { entity: string; manager: string },
    groupedRows: [string, typeof selectedRows][],
  ) => {
    return (
      <Document>
        <Page size="A4" orientation="landscape" style={pdfStyles.page}>
          <View style={pdfStyles.header}>
            <Image style={pdfStyles.logo} src="/Gestiona-RGB.png" />
            <View>
              <Text style={pdfStyles.title}>Informe de objetivos 2026</Text>
              <Text style={pdfStyles.meta}>Entidad: {metadata.entity}</Text>
              <Text style={pdfStyles.meta}>Gestor/a: {metadata.manager}</Text>
            </View>
          </View>
          {groupedRows.map(([instruction, rows]) => (
            <View key={instruction} style={pdfStyles.section}>
              <Text style={pdfStyles.instruction}>{instruction}</Text>
              {rows.map(({ item, deadline, observations }) => (
                <View key={item.id} style={pdfStyles.row}>
                  <View style={pdfStyles.rowItem}>
                    <Text style={pdfStyles.rowTitle}>
                      {item.item_objective ?? "Sin objetivo"}
                    </Text>
                  </View>
                  <View style={pdfStyles.rowDeadline}>
                    {deadline ? (
                      <Text style={pdfStyles.rowMeta}>Plazo: {deadline}</Text>
                    ) : null}
                  </View>
                  <View style={pdfStyles.rowObservations}>
                    {observations ? (
                      <Text style={pdfStyles.rowMeta}>
                        Observaciones: {observations}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </Page>
      </Document>
    )
  }

  const handleExportPdf = async (values: z.infer<typeof formSchema>) => {
    if (selectedRows.length === 0) {
      toast.error("Selecciona al menos un item antes de exportar.")
      return
    }

    try {
      const doc = buildPdfDocument(values, groupedSelectedRows)
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const stamp = new Date().toISOString().slice(0, 10)
      const safeEntity = values.entity
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-")
      const entityPart = safeEntity || "entidad"
      link.href = url
      link.download = `informe-${stamp}-${entityPart}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("PDF generado correctamente.", {
        description: `${values.entity} • ${values.manager}`,
      })
    } catch (error) {
      toast.error("No se pudo generar el PDF.")
    }
  }

  const onSubmit = form.handleSubmit(
    async (values) => {
      await handleExportPdf(values)
    },
    () => {
      toast.error("Completa los datos de cabecera para exportar.")
    },
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f4ef_0%,_#f1f0ed_40%,_#e7e4df_100%)] text-zinc-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Acceso admin</Link>
            </Button>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Generador de informes de objetivos
          </h1>
          <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
            Selecciona los items que quieres incluir y completa los datos de
            cabecera para generar el PDF.
          </p>
          {!hasSupabaseEnv && (
            <p className="max-w-2xl text-sm text-zinc-500">
              Vista demo con datos locales. Configura las variables de entorno para
              leer desde Supabase.
            </p>
          )}
        </header>

        <div className="grid gap-8">
          <Card className="border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle>Datos de cabecera</CardTitle>
              <CardDescription>Informacion general para el PDF.</CardDescription>
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
                  <Label htmlFor="manager">Gestor/a</Label>
                  <Input
                    id="manager"
                    placeholder="Responsable"
                    {...form.register("manager")}
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="relative z-10 border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle>Items disponibles</CardTitle>
                <CardDescription>
                  {itemsLoading
                    ? "Cargando catalogo..."
                    : `${filteredAvailableItems.length} disponibles`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {itemsError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    Error al cargar items: {itemsError.message}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-wrap items-end gap-2">
                    <MultiSelectFilter
                      title="Filtrar items disponibles por instruccion"
                      options={instructionOptions}
                      value={availableInstructionFilters}
                      onChange={setAvailableInstructionFilters}
                      placeholder="Todas las instrucciones"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAvailableInstructionFilters([])}
                      disabled={availableInstructionFilters.length === 0}
                    >
                      Eliminar filtros
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <MultiSelectFilter
                      title="Filtrar items disponibles por linea de trabajo"
                      options={availableWorkLineOptions}
                      value={availableWorkLineFilters}
                      onChange={setAvailableWorkLineFilters}
                      placeholder="Todas las lineas"
                      disabled={availableInstructionFilters.length === 0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAvailableWorkLineFilters([])}
                      disabled={
                        availableWorkLineFilters.length === 0 ||
                        availableInstructionFilters.length === 0
                      }
                    >
                      Eliminar filtros
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleAddSelected}
                    disabled={availableChecked.size === 0}
                  >
                    Añadir seleccionados
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAllAvailable}
                    disabled={availableItems.length === 0}
                  >
                    Añadir todos
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRestoreAll}
                    disabled={selectedRows.length === 0}
                  >
                    Restaurar todo
                  </Button>
                  <Badge variant="outline">
                    {availableChecked.size} seleccionados
                  </Badge>
                </div>
                {filteredAvailableItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500">
                    {availableItems.length === 0
                      ? "No hay items disponibles. Todo el catalogo esta incluido."
                      : "No hay items disponibles que coincidan con los filtros."}
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-3">
                    {groupedAvailableItems.map(([instruction, items], index) => (
                      <AccordionItem
                        key={`${instruction}-${index}`}
                        value={`available-${index}`}
                        className="rounded-lg border border-zinc-200/80 bg-white/60"
                      >
                        <AccordionTrigger className="px-3 py-2 text-sm font-semibold text-zinc-700 hover:no-underline">
                          <span className="flex w-full items-center justify-between pr-3">
                            <span>{instruction}</span>
                            <Badge variant="outline">{items.length}</Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="rounded-lg border border-zinc-200/80">
                            <div className="grid grid-cols-[auto_1.3fr_1fr_1.4fr_0.7fr_auto] gap-3 border-b border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
                              <Checkbox
                                checked={
                                  items.length === 0
                                    ? false
                                    : items.every((item) => availableChecked.has(item.id))
                                      ? true
                                      : items.some((item) => availableChecked.has(item.id))
                                        ? "indeterminate"
                                        : false
                                }
                                onCheckedChange={(checked) => {
                                  const shouldCheck = checked === true
                                  setAvailableChecked((prev) => {
                                    const next = new Set(prev)
                                    items.forEach((item) => {
                                      if (shouldCheck) {
                                        next.add(item.id)
                                      } else {
                                        next.delete(item.id)
                                      }
                                    })
                                    return next
                                  })
                                }}
                                aria-label="Seleccionar todos los items visibles"
                                disabled={items.length === 0}
                              />
                              <span>Instruccion</span>
                              <span>Linea de trabajo</span>
                              <span>Objetivo de evaluacion</span>
                              <span>ID Objetivo</span>
                              <span>Accion</span>
                            </div>
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="grid grid-cols-[auto_1.3fr_1fr_1.4fr_0.7fr_auto] items-center gap-3 border-b border-zinc-100 px-3 py-2 text-sm last:border-b-0"
                              >
                                <Checkbox
                                  checked={availableChecked.has(item.id)}
                                  onCheckedChange={(checked) => {
                                    const isChecked = checked === true
                                    setAvailableChecked((prev) => {
                                      const next = new Set(prev)
                                      if (isChecked) {
                                        next.add(item.id)
                                      } else {
                                        next.delete(item.id)
                                      }
                                      return next
                                    })
                                  }}
                                  aria-label={`Seleccionar ${item.item_objective ?? "item"}`}
                                />
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
                                  onClick={() => handleAddItem(item)}
                                >
                                  Añadir
                                </Button>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 bg-white/80 shadow-sm backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle>Items del informe</CardTitle>
                <CardDescription>
                  {itemsLoading
                    ? "Cargando catalogo..."
                    : `${filteredSelectedRows.length} de ${selectedRows.length} items seleccionados`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-wrap items-end gap-2">
                    <MultiSelectFilter
                      title="Filtrar items del informe por instruccion"
                      options={instructionOptions}
                      value={selectedInstructionFilters}
                      onChange={setSelectedInstructionFilters}
                      placeholder="Todas las instrucciones"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInstructionFilters([])}
                      disabled={selectedInstructionFilters.length === 0}
                    >
                      Eliminar filtros
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <MultiSelectFilter
                      title="Filtrar items del informe por linea de trabajo"
                      options={selectedWorkLineOptions}
                      value={selectedWorkLineFilters}
                      onChange={setSelectedWorkLineFilters}
                      placeholder="Todas las lineas"
                      disabled={selectedInstructionFilters.length === 0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWorkLineFilters([])}
                      disabled={
                        selectedWorkLineFilters.length === 0 ||
                        selectedInstructionFilters.length === 0
                      }
                    >
                      Eliminar filtros
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveSelected}
                    disabled={selectedChecked.size === 0}
                  >
                    Quitar seleccionados
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleClearSelection}>
                    Quitar todos
                  </Button>
                  <Badge variant="outline">{selectedRows.length} seleccionados</Badge>
                </div>
                {filteredSelectedRows.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-sm text-zinc-500">
                    {selectedRows.length === 0
                      ? "No hay items en el informe."
                      : "No hay items que coincidan con los filtros."}
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-3">
                    {groupedSelectedRows.map(([instruction, rows], index) => (
                      <AccordionItem
                        key={`${instruction}-${index}`}
                        value={`selected-${index}`}
                        className="rounded-lg border border-zinc-200/80 bg-white/60"
                      >
                        <AccordionTrigger className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-zinc-600 hover:no-underline">
                          <span className="flex w-full items-center justify-between pr-3">
                            <span>{instruction}</span>
                            <Badge variant="outline">{rows.length}</Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3">
                          <div className="rounded-lg border border-zinc-200/80">
                            <div className="grid grid-cols-[auto_1.6fr_1.1fr_1.4fr_auto] gap-3 border-b border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
                              <Checkbox
                                checked={
                                  rows.length === 0
                                    ? false
                                    : rows.every((row) => selectedChecked.has(row.item.id))
                                      ? true
                                      : rows.some((row) => selectedChecked.has(row.item.id))
                                        ? "indeterminate"
                                        : false
                                }
                                onCheckedChange={(checked) => {
                                  const shouldCheck = checked === true
                                  setSelectedChecked((prev) => {
                                    const next = new Set(prev)
                                    rows.forEach((row) => {
                                      if (shouldCheck) {
                                        next.add(row.item.id)
                                      } else {
                                        next.delete(row.item.id)
                                      }
                                    })
                                    return next
                                  })
                                }}
                                aria-label="Seleccionar todos los items visibles"
                                disabled={rows.length === 0}
                              />
                              <span>Item</span>
                              <span>Plazo</span>
                              <span>Observaciones</span>
                              <span>Accion</span>
                            </div>
                            {rows.map(({ item, deadline, observations }) => (
                              <div
                                key={item.id}
                                className="grid grid-cols-[auto_1.6fr_1.1fr_1.4fr_auto] items-center gap-3 border-b border-zinc-100 px-3 py-2 text-sm last:border-b-0"
                              >
                                <Checkbox
                                  checked={selectedChecked.has(item.id)}
                                  onCheckedChange={(checked) => {
                                    const isChecked = checked === true
                                    setSelectedChecked((prev) => {
                                      const next = new Set(prev)
                                      if (isChecked) {
                                        next.add(item.id)
                                      } else {
                                        next.delete(item.id)
                                      }
                                      return next
                                    })
                                  }}
                                  aria-label={`Seleccionar ${item.item_objective ?? "item"}`}
                                />
                                <div>
                                  <div className="font-medium text-zinc-900">
                                    {item.item_objective ?? "Sin objetivo"}
                                  </div>
                                  <div className="text-xs text-zinc-500">
                                    {item.work_line ?? "Sin linea"}
                                  </div>
                                </div>
                                <Select
                                  value={deadline}
                                  onValueChange={(value) =>
                                    setSelectedItems((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        ...prev[item.id],
                                        deadline: value,
                                      },
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
                                <Input
                                  value={observations}
                                  onChange={(event) =>
                                    setSelectedItems((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        ...prev[item.id],
                                        observations: event.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Observaciones"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  Quitar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-zinc-200/80 bg-zinc-900 text-zinc-50 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-6 md:flex-row">
            <Button
              type="button"
              className="gap-2 bg-white text-zinc-900 hover:bg-zinc-100"
              onClick={onSubmit}
            >
              <Download className="size-4" />
              Exportar PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 bg-white text-zinc-900 hover:bg-zinc-100"
              onClick={handleExportDraft}
            >
              Guardar borrador
            </Button>
            <input
              ref={draftInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  handleImportDraft(file)
                }
                if (draftInputRef.current) {
                  draftInputRef.current.value = ""
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2 bg-white text-zinc-900 hover:bg-zinc-100"
              onClick={() => draftInputRef.current?.click()}
            >
              Importar borrador
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
