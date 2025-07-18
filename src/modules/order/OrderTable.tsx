import { useState, useEffect } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Loader2, AlertCircle, ShoppingCart, Edit, ChevronLeft, ChevronRight, Search,
} from "lucide-react"

import CreateOrderModal from "@/components/modals/CreateOrderModal"
import EditOrderModal   from "@/components/modals/EditOrderModal"
import type { Order, OrderProduct, Product } from "@/components/types"

export default function OrdersTable() {
  const [orders, setOrders]               = useState<Order[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [searchTerm, setSearchTerm]       = useState("")
  const [currentPage, setCurrentPage]     = useState(1)
  const itemsPerPage                      = 10

  const [showCreate, setShowCreate]       = useState(false)
  const [showEdit, setShowEdit]           = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])

  const listUrl   = import.meta.env.VITE_ORDERS_URL!
  const saveUrl   = import.meta.env.VITE_SAVE_ORDERS_URL!
  const createUrl = import.meta.env.VITE_CREATE_ORDER_URL!

  useEffect(() => {
    fetchOrders()
    fetchAvailableProducts()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(listUrl)
      if (!res.ok) throw new Error(res.statusText)
      const data: Order[] = await res.json()
      setOrders(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableProducts = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_PRODUCTS_URL || "")
      if (!res.ok) return
      const json = await res.json()
      setAvailableProducts(json.products || [])
    } catch {
      // ignore
    }
  }

  const handleCreateOrder = async (
    values: { status: string; products: { productId: string; quantity: number }[] }
  ) => {
    const userId = sessionStorage.getItem('userId') || ''
    if (!userId) {
      console.error('No existe userId en sessionStorage')
      return
    }

    const payload = {
      userId,
      status:   values.status,   // pending | shipped | delivered | cancelled
      products: values.products.map(p => ({
        productId: p.productId,
        quantity:  p.quantity,
      })),
    }

    console.log('🛠️ CreateOrder payload:', payload)

    const res = await fetch(createUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('POST error body:', text)
      throw new Error(`Error ${res.status}`)
    }

    await fetchOrders()
    setShowCreate(false)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowEdit(true)
  }
  const handleSaveOrder = async (
    id: string,
    payload: { status: string; products: { price: number; quantity: number }[] }
  ) => {
    const res = await fetch(`${saveUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error('PUT error body:', text)
      throw new Error(`Error ${res.status}`)
    }
    await fetchOrders()
    setShowEdit(false)
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("es-ES", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)

  // Badge con los nuevos enums
  const getStatusBadge = (status: string) => {
    const cfg: Record<string, { variant: any; label: string }> = {
      pending:   { variant: "secondary",  label: "Pendiente" },
      shipped:   { variant: "default",    label: "Enviado"   },
      delivered: { variant: "default",    label: "Entregado" },
      cancelled: { variant: "destructive", label: "Cancelada" },
    }
    const { variant, label } = cfg[status] || cfg.pending
    return <Badge variant={variant} className="text-xs">{label}</Badge>
  }

  const getProductsSummary = (products: OrderProduct[]) => {
    const total = products.reduce((sum, p) => sum + p.quantity, 0)
    const names = products
      .map(p => {
        if (typeof p.productId === "string") {
          const prod = typeof p.productId === "string"
            ? availableProducts.find(ap => typeof p.productId === "string" && ap._id === p.productId)
            : undefined
          return prod?.name ?? "(desconocido)"
        }
        if (p.productId && typeof p.productId === "object" && "name" in p.productId) {
          return p.productId.name
        }
        return "(desconocido)"
      })
      .join(", ")

    return (
      <div className="space-y-1">
        <div className="text-sm font-medium">
          {total} {total > 1 ? "productos" : "producto"}
        </div>
        <div className="text-xs text-gray-500 max-w-xs truncate" title={names}>
          {names}
        </div>
      </div>
    )
  }

  const filtered = orders.filter(o =>
    o.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o._id.includes(searchTerm) ||
    o.products.some(p => {
      let nm = ""
      if (typeof p.productId === "string") {
        nm = typeof p.productId === "string"
          ? availableProducts.find(ap => typeof p.productId === "string" && ap._id === p.productId)?.name || ""
          : ""
      } else if (p.productId && typeof p.productId === "object" && "name" in p.productId) {
        nm = p.productId.name
      }
      return nm.toLowerCase().includes(searchTerm.toLowerCase())
    })
  )

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const start      = (currentPage - 1) * itemsPerPage
  const pageItems  = filtered.slice(start, start + itemsPerPage)

  if (isLoading) return <Loader2 className="animate-spin" />
  if (error)      return (
    <Card>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchOrders}>Reintentar</Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-4 bg-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
              <CardTitle>Gestión de Órdenes</CardTitle>
            </div>
            <Button onClick={() => setShowCreate(true)}>Registrar Orden</Button>
          </CardHeader>
          <CardDescription>Visualización y seguimiento de las órdenes</CardDescription>

          <div className="flex items-center gap-2 px-6 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10 w-80"
                placeholder="Buscar…"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
            <Button onClick={fetchOrders} variant="outline">Actualizar</Button>
          </div>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map(o => (
                  <TableRow key={o._id}>
                    <TableCell className="font-mono">#{o._id.slice(-8)}</TableCell>
                    <TableCell>{o.userId.name}</TableCell>
                    <TableCell>{getProductsSummary(o.products)}</TableCell>
                    <TableCell>{formatCurrency(o.totalPrice ?? 0)}</TableCell>
                    <TableCell>{getStatusBadge(o.status)}</TableCell>
                    <TableCell>{formatDate(o.orderDate)}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleEditOrder(o)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft /> Anterior
                </Button>
                <span>Página {currentPage} de {totalPages}</span>
                <Button
                  onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente <ChevronRight />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateOrderModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreateOrder}
        availableProducts={availableProducts}
      />
      {selectedOrder && (
        <EditOrderModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveOrder}
          data={selectedOrder}
          availableProducts={availableProducts}
        />
      )}
    </div>
  )
}
