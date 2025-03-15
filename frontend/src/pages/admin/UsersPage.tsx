import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { useUsers } from '@/hooks/useUsers';
import { updateUserRole, deleteUser, type UserRole } from '@/api/users';
import { 
  Search, 
  Users,
  ChevronLeft, 
  ChevronRight,
  X,
  MoreVertical,
  Pencil,
  Loader2,
  Trash2,
  KeyRound
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { debounce } from "lodash";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Email', value: 'email' },
  { label: 'Role', value: 'role' },
  { label: 'Created', value: 'createdAt' },
] as const;

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'USER'];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]['value']>('createdAt');
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; role: UserRole } | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [tempRole, setTempRole] = useState<UserRole | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<{ id: string; email: string } | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const { users, meta, isLoading, error } = useUsers({
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
    sortBy,
  });
  const { user: currentUser, resetPassword } = useAuth();

  // Auto-focus input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !tempRole || tempRole === selectedUser.role) return;
    
    try {
      setIsUpdatingRole(true);
      await updateUserRole(selectedUser.id, tempRole);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
      setIsRoleDialogOpen(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteUser(userToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userToResetPassword) return;
    
    try {
      setIsResettingPassword(true);
      await resetPassword(userToResetPassword.email);
      setUserToResetPassword(null);
      toast.success('Password reset instructions sent successfully');
    } catch (error) {
      console.error('Error initiating password reset:', error);
      toast.error('Failed to send password reset instructions');
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <div className="p-4 rounded-full bg-destructive/10">
            <X className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium">Error loading users</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="w-full bg-white shadow-xl border rounded-xl overflow-hidden">
        <CardHeader className="border-b bg-white p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">Admin Users Management</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">
                    {meta?.total || 0} total users
                  </p>
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                ref={searchInputRef}
                placeholder="Search users..."
                onChange={handleSearchChange}
                defaultValue=""
                className="pl-10 h-9 sm:h-10 w-full"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 sm:h-10 w-full sm:w-[180px] font-medium">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 sm:h-10 w-full sm:w-[180px] font-medium">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {users?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-gray-500">Loading users...</p>
                </div>
              ) : (
                <>
                  <Users className="h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-900">No users found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity duration-200" : ""}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.profile?.firstName && user.profile?.lastName
                          ? `${user.profile.firstName} ${user.profile.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser({
                                id: user.id,
                                email: user.email,
                                role: user.role as UserRole
                              });
                              setTempRole(user.role as UserRole);
                              setIsRoleDialogOpen(true);
                            }}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            disabled={user.id === currentUser?.id || isLoading}
                            title={user.id === currentUser?.id ? "You cannot change your own role" : "Change user role"}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setUserToResetPassword({
                                id: user.id,
                                email: user.email
                              });
                            }}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            disabled={isLoading}
                            title="Send password reset instructions"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setUserToDelete({
                                id: user.id,
                                email: user.email
                              });
                            }}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            disabled={user.id === currentUser?.id || isLoading}
                            title={user.id === currentUser?.id ? "You cannot delete your own account" : "Delete user"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-white">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Showing {((meta?.page || 1) - 1) * (meta?.limit || 10) + 1} to{' '}
              {Math.min((meta?.page || 1) * (meta?.limit || 10), meta?.total || 0)} of {meta?.total || 0} users
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="h-9 font-medium px-2 sm:px-3 flex items-center justify-center flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="flex items-center text-sm font-medium text-gray-600 px-4 bg-white rounded-md border h-9">
                Page {meta?.page || 1} of {meta?.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === (meta?.totalPages || 1) || isLoading}
                className="h-9 font-medium px-2 sm:px-3 flex items-center justify-center flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={(open) => !isUpdatingRole && setIsRoleDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for user {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={tempRole || undefined}
              onValueChange={(value: UserRole) => setTempRole(value)}
              disabled={isUpdatingRole}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem 
                    key={role} 
                    value={role}
                    disabled={selectedUser?.role === role}
                  >
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsRoleDialogOpen(false)}
                disabled={isUpdatingRole}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleChange}
                disabled={isUpdatingRole || !tempRole || tempRole === selectedUser?.role}
              >
                {isUpdatingRole ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={!!userToResetPassword} onOpenChange={(open) => !isResettingPassword && !open && setUserToResetPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Send password reset instructions to {userToResetPassword?.email}. The user will receive an email with instructions to set a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setUserToResetPassword(null)}
              disabled={isResettingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !isDeleting && !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user {userToDelete?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 