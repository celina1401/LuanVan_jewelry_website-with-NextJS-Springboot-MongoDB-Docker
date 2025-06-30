import { Metadata } from "next"

export const metadata: Metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage user accounts and permissions",
}

export default function UsersPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Add New User
        </button>
      </div>

      <div className="grid gap-6">
        {/* Filters */}
        <div className="flex gap-4 p-4 border rounded-lg">
          <input
            type="text"
            placeholder="Search users..."
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <select className="px-3 py-2 border rounded-md">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select className="px-3 py-2 border rounded-md">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="rounded-lg border">
          <div className="p-4">
            <div className="grid grid-cols-6 gap-4 font-medium border-b pb-2">
              <div>User</div>
              <div>Email</div>
              <div>Role</div>
              <div>Status</div>
              <div>Last Active</div>
              <div>Actions</div>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              Users will be displayed here
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 