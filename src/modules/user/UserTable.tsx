import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2, AlertCircle, Users, Edit,
  ChevronLeft, ChevronRight, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import CreateUserModal from "@/components/modals/CreateUserModal";
import EditUserModal from "@/components/modals/EditUserModal";
import type { User, Role } from "../../components/types";

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // estados para modales
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const availableRoles: Role[] = [
    { _id: "1", type: "admin" },
    { _id: "2", type: "user" },
  ];

  const url = import.meta.env.VITE_USERS_URL;
  const saveUrl = import.meta.env.VITE_SAVE_USERS_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const { userList } = await res.json();
      setUsers(userList);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    const mappedRoles = data.roles
      .map((id: string) => availableRoles.find(r => r._id === id)?.type)
      .filter((type: string | undefined): type is string => Boolean(type));

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      roles: mappedRoles,
    };

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetchUsers();
    setShowCreate(false);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEdit(true);
  };

  const handleSave = async (id: string, data: any) => {
    await fetch(`${saveUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchUsers();
    setShowEdit(false);
  };

  const filtered = users.filter(u =>
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filtered.slice(start, end);

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <Button onClick={fetchUsers}>Reintentar</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <Card className="max-w-6xl mx-auto shadow-lg rounded-2xl">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl font-bold">Gestión de Usuarios</CardTitle>
            </div>
            <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700">
              + Nuevo Usuario
            </Button>
          </div>
          <CardDescription className="mt-2">Administra los usuarios registrados en la plataforma</CardDescription>
          <div className="flex items-center gap-3 mt-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Button onClick={fetchUsers} variant="outline">Actualizar</Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {pageItems.length === 0
            ? <p className="text-center text-gray-500 py-10">No hay resultados</p>
            : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Registrado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map(user => (
                      <TableRow key={user._id} className="hover:bg-blue-50 transition-colors">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.roles.length
                            ? user.roles.map(r => (
                              <Badge key={r._id} className="mr-1 bg-blue-100 text-blue-700">
                                {r.type}
                              </Badge>
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
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
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
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <span className="text-gray-600">Página {currentPage} de {totalPages}</span>
              <Button
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
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
  );
}
