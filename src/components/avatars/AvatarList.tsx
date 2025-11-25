// components/avatars/AvatarList.tsx
import { AvatarCard } from "./AvatarCard"
import { Avatar } from "@/types"

interface Props {
  avatars: Avatar[]
  onEdit: (avatar: Avatar) => void
  onUpdated: () => void
}

export function AvatarList({ avatars, onEdit, onUpdated }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {avatars.map((avatar) => (
        <AvatarCard
          key={avatar.id}
          avatar={avatar}
          onEdit={() => onEdit(avatar)}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  )
}