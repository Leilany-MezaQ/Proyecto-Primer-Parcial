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
  Loader2, AlertCircle, Package, Edit, ChevronLeft, ChevronRight, Search,
} from "lucide-react"

import CreateProductModal from "@/components/modals/CreateProductModal"
import EditProductModal   from "@/components/modals/EditProductModal"
import type { Product }   from "../../components/types"

interface ProductsResponse {
  products: Product[]
}

export default function ProductsTable() {
  const [products, setProducts]           = useState<Product[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [searchTerm, setSearchTerm]       = useState("")
  const [currentPage, setCurrentPage]     = useState(1)
  const itemsPerPage                      = 10

  // modales
  const [showCreate, setShowCreate]       = useState(false)
  const [showEdit, setShowEdit]           = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const listUrl   = import.meta.env.VITE_PRODUCTS_URL
  const saveUrl   = import.meta.env.VITE_SAVE_PRODUCTS_URL
  const createUrl = import.meta.env.VITE_CREATE_PRODUCT_URL

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(listUrl)
      if (!res.ok) throw new Error(res.statusText)
      const data: ProductsResponse = await res.json()
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message || "Error al cargar los productos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (values: any) => {
    // POST /productos
    await fetch(createUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    await fetchProducts()
    setShowCreate(false)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowEdit(true)
  }

  const handleSave = async (id: string, values: any) => {
    await fetch(`${saveUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    await fetchProducts()
    setShowEdit(false)
  }

  // filtrado y paginación
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p._id.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const start = (currentPage - 1) * itemsPerPage
  const end   = start + itemsPerPage
  const pageItems = filtered.slice(start, end)

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amt)

  const getStatusBadge = (status: boolean) =>
    <Badge variant={status ? "default" : "secondary"} className="text-xs">
      {status ? "Activo" : "Inactivo"}
    </Badge>

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive" className="text-xs">Sin stock</Badge>
    if (stock <= 5) return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Stock bajo</Badge>
    if (stock <= 10) return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Stock medio</Badge>
    return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Stock alto</Badge>
  }

  if (isLoading) return (
    <Card><CardContent className="text-center py-10">
      <Loader2 className="animate-spin mx-auto mb-4"/>
      <p>Cargando productos…</p>
    </CardContent></Card>
  )
  if (error) return (
    <Card><CardContent className="py-10">
      <Alert variant="destructive">
        <AlertCircle/><AlertDescription>{error}</AlertDescription>
      </Alert>
      <Button onClick={fetchProducts} className="mt-4">Reintentar</Button>
    </CardContent></Card>
  )

  return (
    <div className="p-4 bg-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* ... tus tarjetas de stats aquí ... */}
        </div>

        {/* Header + Buscar + Registrar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-green-600"/>
                <CardTitle>Inventario de Productos</CardTitle>
              </div>
              <Button onClick={() => setShowCreate(true)}>
                Registrar Producto
              </Button>
            </div>
            <CardDescription>Gestión y control del inventario de productos</CardDescription>
            <div className="flex items-center gap-2 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input
                  className="pl-10 w-80"
                  placeholder="Buscar…"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                />
              </div>
              <Button onClick={fetchProducts} variant="outline">Actualizar</Button>
            </div>
          </CardHeader>

          <CardContent>
            {pageItems.length === 0
              ? <p className="py-10 text-center">No hay resultados</p>
              : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageItems.map(p => (
                        <TableRow key={p._id} className="hover:bg-gray-50">
                          <TableCell className="font-mono">#{p._id.slice(-8)}</TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell title={p.description}>{p.description}</TableCell>
                          <TableCell>{formatCurrency(p.price)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{p.stock} unidades</span>
                              {getStockBadge(p.stock)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(p.status ?? false)}</TableCell>
                          <TableCell>{formatCurrency(p.price * p.stock)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm" variant="outline"
                              onClick={() => handleEdit(p)}
                            >
                              <Edit className="h-4 w-4"/>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            }

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button onClick={() => setCurrentPage(c => Math.max(c-1,1))} disabled={currentPage===1}>
                  <ChevronLeft/> Anterior
                </Button>
                <span>Página {currentPage} de {totalPages}</span>
                <Button onClick={() => setCurrentPage(c => Math.min(c+1,totalPages))} disabled={currentPage===totalPages}>
                  Siguiente <ChevronRight/>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <CreateProductModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
      />
      {selectedProduct && (
        <EditProductModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
          data={selectedProduct}
        />
      )}
    </div>
  )
}
