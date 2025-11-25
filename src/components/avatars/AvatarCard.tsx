"use client"

// components/avatars/AvatarCard.tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrainButton } from "./TrainButton"
import { ExternalLink, Settings, Copy } from "lucide-react"
import { toast } from "sonner"

interface Props {
  avatar: any
  onEdit: () => void
  onUpdated: () => void
}

export function AvatarCard({ avatar, onEdit, onUpdated }: Props) {
  const publicUrl = `${window.location.origin}/@${avatar.handle}`

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    toast.success("Link copied!")
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatar.photo_url} />
            <AvatarFallback>{avatar.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{avatar.name}</h3>
            <p className="text-lg text-blue-600 font-medium">@{avatar.handle}</p>
          </div>
        </div>

        <Badge variant={avatar.trained ? "default" : "secondary"}>
          {avatar.trained ? "Ready" : "Not trained"}
        </Badge>
      </div>

      <p className="text-gray-600 text-sm mb-4">{avatar.purpose}</p>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>{avatar.total_conversations || 0} conversations</span>
        <span className="text-gray-400">•</span>
        <span>{avatar.total_messages || 0} messages</span>
      </div>

      <div className="flex flex-col gap-3">
        <TrainButton avatarId={avatar.id} trained={avatar.trained} onTrained={onUpdated} />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="w-4 h-4" />
          </Button>

          <Button asChild size="sm">
            <a href={`/@${avatar.handle}`} target="_blank" rel="noopener">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )
}