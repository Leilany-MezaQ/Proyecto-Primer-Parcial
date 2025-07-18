import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import UserForm from './UserForm'
import type { User } from '../types'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: any) => Promise<void>
  data: User
  availableRoles: { _id: string; type: string }[]
}

export default function EditUserModal({ isOpen, onClose, onSave, data, availableRoles }: EditUserModalProps) {
  const handleSubmit = async (values: any) => {
    await onSave(data._id, values)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>Modifica la información del usuario.</DialogDescription>
        </DialogHeader>
        <UserForm
          defaultValues={{
            name: data.name,
            email: data.email ?? '',
            phone: data.phone,
            password: '',
            roles: data.roles.map(r => r._id),
          }}
          onSubmit={handleSubmit}
          availableRoles={availableRoles}
        />
      </DialogContent>
    </Dialog>
  )
}