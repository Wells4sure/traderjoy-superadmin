"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { EditUserModal } from "@/components/EditUserModal";
import { timeAgo } from "@/lib/utils";

const PAGE_SIZE = 10;

function userStatusVariant(status: string) {
  if (status === "ACTIVE")    return "success" as const;
  if (status === "INACTIVE")  return "gray" as const;
  if (status === "SUSPENDED") return "danger" as const;
  return "gray" as const;
}

export function UsersTable({ users: initialUsers }: { users: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const slice = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleUserSaved(updated: any) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
    router.refresh();
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Login</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center">
                      <UserCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 leading-none">{u.name || "—"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "OWNER" ? "warning" : u.role === "ADMIN" ? "info" : "gray"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={userStatusVariant(u.status ?? "ACTIVE")}>{u.status ?? "ACTIVE"}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(u.lastLogin)}</td>
                <td className="px-4 py-3">
                  {u.email_verified_at ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-orange-500"
                    title="Edit user"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={users.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={handleUserSaved}
        />
      )}
    </>
  );
}
