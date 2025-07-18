import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Save, X } from "lucide-react"

interface Role {
  _id: string
  type: string
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  status: boolean
}

interface OrderProduct {
  productId: {
    _id: string
    name: string
    price: number
  }
  quantity: number
  price: number
  _id: string
}

interface User {
  _id: string
  name: string
  email: string
  phone: string
  roles: Role[]
  status: boolean
}

interface Order {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  products: OrderProduct[]
  totalPrice: number
  subtotal: number
  status: string
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  data: User | Product | Order | null
  type: "user" | "product" | "order"
  availableRoles?: Role[]
  availableProducts?: Product[]
}

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  data,
  type,
  availableRoles = [],
  availableProducts = [],
}: EditModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (data && isOpen) {
      if (type === "user") {
        const user = data as User
        setFormData({
          name: user.name,
          phone: user.phone,
          roles: user.roles.map((role) => role._id),
          password: "",
        })
      } else if (type === "product") {
        const product = data as Product
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
        })
      } else if (type === "order") {
        const order = data as Order
        setFormData({
          status: order.status,
          products: order.products.map((p) => ({
            productId: p.productId._id,
            quantity: p.quantity,
            price: p.price,
          })),
        })
      }
    }
  }, [data, isOpen, type])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type: inputType } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: inputType === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      roles: checked ? [...prev.roles, roleId] : prev.roles.filter((r: string) => r !== roleId),
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      status: value,
    }))
  }

  const handleProductQuantityChange = (index: number, quantity: number) => {
    setFormData((prev: any) => ({
      ...prev,
      products: prev.products.map((p: any, i: number) => (i === index ? { ...p, quantity: quantity || 0 } : p)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios")
    } finally {
      setIsLoading(false)
    }
  }

  const renderUserForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleInputChange}
          placeholder="Nombre del usuario"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone || ""}
          onChange={handleInputChange}
          placeholder="+1234567890"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Nueva contraseña (opcional)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={handleInputChange}
          placeholder="Dejar vacío para mantener la actual"
        />
      </div>

      <div className="space-y-3">
        <Label>Roles</Label>
        <div className="space-y-2">
          {availableRoles.map((role) => (
            <div key={role._id} className="flex items-center space-x-2">
              <Checkbox
                id={role._id}
                checked={formData.roles?.includes(role._id) || false}
                onCheckedChange={(checked) => handleRoleChange(role._id, checked as boolean)}
              />
              <Label htmlFor={role._id} className="text-sm">
                {role.type}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderProductForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del producto</Label>
        <Input
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleInputChange}
          placeholder="Nombre del producto"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleInputChange}
          placeholder="Descripción del producto"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price || ""}
            onChange={handleInputChange}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock || ""}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )

  const renderOrderForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Estado de la orden</Label>
        <Select value={formData.status || ""} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="processing">Procesando</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Productos en la orden</Label>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {formData.products?.map((product: any, index: number) => {
            const productInfo = availableProducts.find((p) => p._id === product.productId)
            return (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{productInfo?.name || "Producto desconocido"}</p>
                  <p className="text-xs text-gray-500">Precio: ${product.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`quantity-${index}`} className="text-sm">
                    Cantidad:
                  </Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => handleProductQuantityChange(index, Number.parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const getTitle = () => {
    switch (type) {
      case "user":
        return "Editar Usuario"
      case "product":
        return "Editar Producto"
      case "order":
        return "Editar Orden"
      default:
        return "Editar"
    }
  }

  const getDescription = () => {
    switch (type) {
      case "user":
        return "Modifica la información del usuario"
      case "product":
        return "Actualiza los detalles del producto"
      case "order":
        return "Cambia el estado y productos de la orden"
      default:
        return "Modifica la información"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{getTitle()}</span>
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {type === "user" && renderUserForm()}
          {type === "product" && renderProductForm()}
          {type === "order" && renderOrderForm()}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
