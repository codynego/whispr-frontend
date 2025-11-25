// components/avatars/TrainButton.tsx
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import useSWR from "swr"
import { toast } from "sonner"

interface Props {
  avatarId: string
  trained: boolean
  onTrained: () => void
}

export function TrainButton({ avatarId, trained, onTrained }: Props) {
  const { data: status, mutate } = useSWR(`/api/avatars/${avatarId}/training-status/`, {
    refreshInterval: 3000,
  })

  const isTraining = status?.status === "running" || status?.status === "queued"

  const train = async () => {
    toast.promise(
      fetch(`/api/avatars/${avatarId}/train/`, { method: "POST" }),
      {
        loading: "Starting training...",
        success: () => {
          mutate()
          onTrained()
          return "Training started!"
        },
        error: "Failed to start training",
      }
    )
  }

  if (isTraining) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Training... {status?.progress || ""}
      </Button>
    )
  }

  if (trained) {
    return (
      <Button variant="outline" onClick={train} className="w-full">
        Retrain AI
      </Button>
    )
  }

  return (
    <Button onClick={train} className="w-full bg-green-600 hover:bg-green-700">
      <CheckCircle2 className="w-4 h-4 mr-2" />
      Train My AI Now
    </Button>
  )
}