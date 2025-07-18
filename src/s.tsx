// Register.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"

interface Role {
  _id: string
  type: string
}

interface FormData {
  name: string
  email: string
  password: string
  phone: string
  roles: string[]
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  phone?: string
  roles?: string
  general?: string
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    roles: [],
  })

  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("http://192.168.1.126:4000/app/roles")
        const data = await res.json()
        setAvailableRoles(data.roles)
      } catch (err) {
        console.error("Error al obtener roles:", err)
      }
    }
    fetchRoles()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Correo inválido"
    if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres"
    if (!formData.phone.match(/^[+]?[1-9][\d]{0,15}$/)) newErrors.phone = "Teléfono inválido"
    if (formData.roles.length === 0) newErrors.roles = "Selecciona al menos un rol"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      roles: checked ? [...prev.roles, roleId] : prev.roles.filter((r) => r !== roleId),
    }))
    if (errors.roles) setErrors((prev) => ({ ...prev, roles: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const res = await fetch("http://192.168.1.126:4000/app/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Error al registrar usuario")
      setIsSuccess(true)
      setTimeout(() => {
        setFormData({ name: "", email: "", password: "", phone: "", roles: [] })
        setIsSuccess(false)
      }, 3000)
    } catch (err: any) {
      setErrors({ general: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return isSuccess ? (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="text-center pt-6">
          <CheckCircle className="mx-auto text-green-500 h-16 w-16 mb-4" />
          <h2 className="text-2xl font-bold">Registro Exitoso</h2>
        </CardContent>
      </Card>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registro de Usuario</CardTitle>
          <CardDescription>Completa todos los campos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} />
              <Button type="button" variant="ghost" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input name="phone" value={formData.phone} onChange={handleInputChange} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <Label>Roles</Label>
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <div key={role._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={role._id}
                      checked={formData.roles.includes(role._id)}
                      onCheckedChange={(checked) => handleRoleChange(role._id, checked as boolean)}
                    />
                    <Label htmlFor={role._id}>{role.type}</Label>
                  </div>
                ))}
              </div>
              {errors.roles && <p className="text-sm text-red-500">{errors.roles}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear Cuenta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
