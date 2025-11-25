// components/avatars/EmptyState.tsx
import { Button } from "@/components/ui/button"
import { Bot, Sparkles } from "lucide-react"

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="bg-gray-100 w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center">
        <Bot className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="text-3xl font-bold mb-4">You haven’t created any AI yet</h2>
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
        Create your first AI clone that talks, remembers, and acts just like you — in under 2 minutes.
      </p>
      <Button size="lg" onClick={onCreate} className="text-lg px-8">
        <Sparkles className="w-5 h-5 mr-2" />
        Create Your First AI
      </Button>
    </div>
  )
}