"use client"
// app/dashboard/avatars/page.tsx
import { AvatarList } from "@/components/avatars/AvatarList"
import { EmptyState } from "@/components/avatars/EmptyState"
import { CreateAvatarSheet } from "@/components/avatars/CreateAvatarSheet"
import { AvatarSettingsSheet } from "@/components/avatars/AvatarSettingsSheet"
import useSWR from "swr"
import { Avatar } from "@/types"
import { fetcher } from "@/lib/fetcher"
import { useState } from "react"
import { Plus } from "lucide-react"

export default function AvatarsPage() {
  const { data: avatars, mutate, isLoading } = useSWR<Avatar[]>("/api/avatars/", fetcher)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Avatars</h1>
            <p className="text-gray-600 mt-2">Your AI clones that talk, remember, and act like you</p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            <Plus className="w-5 h-5" />
            New AI
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border rounded-xl p-6 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!avatars || avatars.length === 0) && (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        )}

        {/* Avatar Grid */}
        {!isLoading && avatars && avatars.length > 0 && (
          <AvatarList
            avatars={avatars}
            onEdit={setSelectedAvatar}
            onUpdated={mutate}
          />
        )}
      </div>

      {/* Modals / Sheets */}
      <CreateAvatarSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          setCreateOpen(false)
          mutate()
        }}
      />

      {selectedAvatar && (
        <AvatarSettingsSheet
          avatar={selectedAvatar}
          open={!!selectedAvatar}
          onOpenChange={(open) => !open && setSelectedAvatar(null)}
          onSaved={() => {
            setSelectedAvatar(null)
            mutate()
          }}
        />
      )}
    </>
  )
}