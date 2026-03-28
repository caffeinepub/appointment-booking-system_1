import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Principal } from "@icp-sdk/core/principal";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Variant_pa_admin_customer,
  useAllUsers,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
} from "../../hooks/useQueries";
import type { UserProfile } from "../../hooks/useQueries";

type ModalMode = "add" | "edit";

interface UserFormState {
  principalId: string;
  name: string;
  role: Variant_pa_admin_customer;
}

const defaultForm: UserFormState = {
  principalId: "",
  name: "",
  role: Variant_pa_admin_customer.customer,
};

export default function UserManagement() {
  const { data: users = [], isLoading } = useAllUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [form, setForm] = useState<UserFormState>(defaultForm);
  const [editPrincipal, setEditPrincipal] = useState<Principal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Principal | null>(null);

  const openAdd = () => {
    setForm(defaultForm);
    setModalMode("add");
    setModalOpen(true);
  };

  const openEdit = (principal: Principal, profile: UserProfile) => {
    setForm({
      principalId: principal.toString(),
      name: profile.name,
      role: profile.role as Variant_pa_admin_customer,
    });
    setEditPrincipal(principal);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (modalMode === "add") {
        let principal: Principal;
        try {
          principal = Principal.fromText(form.principalId.trim());
        } catch {
          toast.error("Invalid Principal ID");
          return;
        }
        const customerNumber = await createUser.mutateAsync({
          principal,
          name: form.name,
          role: form.role,
        });
        const msg =
          form.role === Variant_pa_admin_customer.customer
            ? `User created. Customer #${customerNumber}`
            : "User created successfully";
        toast.success(msg);
      } else if (editPrincipal) {
        await updateUser.mutateAsync({
          principal: editPrincipal,
          name: form.name,
          role: form.role,
        });
        toast.success("User updated successfully");
      }
      setModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (principal: Principal) => {
    try {
      await deleteUser.mutateAsync(principal);
      toast.success("User deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-700",
      pa: "bg-blue-100 text-blue-700",
      customer: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${styles[role] ?? "bg-gray-100 text-gray-700"}`}
      >
        {role === "pa" ? "PA" : role}
      </span>
    );
  };

  const isBusy = createUser.isPending || updateUser.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {users.length} users total
          </span>
        </div>
        <Button
          onClick={openAdd}
          size="sm"
          data-ocid="users.add_button"
          style={{ backgroundColor: "oklch(0.30 0.09 249)", color: "white" }}
        >
          <Plus className="size-4 mr-1" />
          Add User
        </Button>
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12" data-ocid="users.empty_state">
            <Users className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No users yet</p>
            <p className="text-xs text-muted-foreground">
              Add your first user above
            </p>
          </div>
        ) : (
          <Table data-ocid="users.table">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Customer #
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Principal
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(([principal, profile], idx) => (
                <TableRow
                  key={principal.toString()}
                  data-ocid={`users.row.${idx + 1}`}
                >
                  <TableCell className="font-medium text-sm">
                    {profile.name}
                  </TableCell>
                  <TableCell>{roleBadge(profile.role)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {profile.customerNumber
                      ? `#${profile.customerNumber}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {principal.toString().slice(0, 16)}...
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(principal, profile)}
                        data-ocid={`users.edit_button.${idx + 1}`}
                        className="size-8 p-0"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(principal)}
                        data-ocid={`users.delete_button.${idx + 1}`}
                        className="size-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="users.dialog">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "add" ? "Add New User" : "Edit User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {modalMode === "add" && (
              <div className="space-y-1.5">
                <Label htmlFor="principal">Principal ID</Label>
                <Input
                  id="principal"
                  placeholder="e.g. aaaaa-aa..."
                  value={form.principalId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, principalId: e.target.value }))
                  }
                  data-ocid="users.principal.input"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="users.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    role: v as Variant_pa_admin_customer,
                  }))
                }
              >
                <SelectTrigger data-ocid="users.role.select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Variant_pa_admin_customer.admin}>
                    Admin
                  </SelectItem>
                  <SelectItem value={Variant_pa_admin_customer.pa}>
                    Personal Assistant (PA)
                  </SelectItem>
                  <SelectItem value={Variant_pa_admin_customer.customer}>
                    Customer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {modalMode === "add" &&
              form.role === Variant_pa_admin_customer.customer && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  A unique customer number will be auto-generated for this
                  customer.
                </p>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="users.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isBusy}
              data-ocid="users.submit_button"
              style={{
                backgroundColor: "oklch(0.30 0.09 249)",
                color: "white",
              }}
            >
              {isBusy ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {modalMode === "add" ? "Create User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm" data-ocid="users.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              data-ocid="users.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteUser.isPending}
              data-ocid="users.delete.confirm_button"
            >
              {deleteUser.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
