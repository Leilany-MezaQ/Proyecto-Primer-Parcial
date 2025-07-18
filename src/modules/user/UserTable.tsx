import { useState, useEffect } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2, AlertCircle, Users, Edit,
  ChevronLeft, ChevronRight, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import CreateUserModal from "@/components/modals/CreateUserModal"
import EditUserModal from "@/components/modals/EditUserModal"
import type { User, Role } from "../../components/types"

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // estados para modales
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const availableRoles: Role[] = [
    { _id: "1", type: "admin" },
    { _id: "2", type: "user" },
  ]

  const url = import.meta.env.VITE_USERS_URL
  const saveUrl = import.meta.env.VITE_SAVE_USERS_URL

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(res.statusText)
      const { userList } = await res.json()
      setUsers(userList)
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data: any) => {
    // POST /users
    const mappedRoles = data.roles
      .map((id: string) => availableRoles.find(r => r._id === id)?.type)
      .filter((type: string | undefined): type is string => Boolean(type));

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      roles: mappedRoles,            // ahora ["admin"] en lugar de ["1"]
    };
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    await fetchUsers()
    setShowCreate(false)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowEdit(true)
  }

  const handleSave = async (id: string, data: any) => {
    // PUT /users/:id
    await fetch(`${saveUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    await fetchUsers()
    setShowEdit(false)
  }

  // filtrado y paginación (igual que antes) …
  const filtered = users.filter(u =>
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const pageItems = filtered.slice(start, end)

  if (isLoading) return (
    <Card><CardContent className="text-center py-10">
      <Loader2 className="animate-spin mx-auto mb-4" />
      <p>Cargando usuarios…</p>
    </CardContent></Card>
  )
  if (error) return (
    <Card><CardContent className="py-10">
      <Alert variant="destructive">
        <AlertCircle /><AlertDescription>{error}</AlertDescription>
      </Alert>
      <Button onClick={fetchUsers} className="mt-4">Reintentar</Button>
    </CardContent></Card>
  )

  return (
    <div className="p-4 bg-blue-50 min-h-screen">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle>Usuarios</CardTitle>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              Registrar Usuario
            </Button>
          </div>
          <CardDescription>Gestión de usuarios</CardDescription>
          <div className="flex items-center gap-2 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                className="pl-10 w-64"
                placeholder="Buscar…"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
            </div>
            <Button onClick={fetchUsers} variant="outline">Actualizar</Button>
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
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Registrado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map(user => (
                      <TableRow key={user._id} className="hover:bg-gray-50">
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.roles.length
                            ? user.roles.map(r => (
                              <Badge key={r._id} className="mr-1">{r.type}</Badge>
                            ))
                            : <Badge variant="secondary">Sin roles</Badge>
                          }
                        </TableCell>
                        <TableCell>
                          {user.createDate ? new Date(user.createDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status ? "default" : "destructive"}>
                            {user.status ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm" variant="outline"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
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
              <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                <ChevronLeft /> Anterior
              </Button>
              <span>Página {currentPage} de {totalPages}</span>
              <Button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                Siguiente <ChevronRight />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <CreateUserModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
        availableRoles={availableRoles}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
          data={selectedUser}
          availableRoles={availableRoles}
        />
      )}
    </div>
  )
}
