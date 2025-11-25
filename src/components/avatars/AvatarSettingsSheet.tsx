// components/avatars/AvatarSettingsSheet.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
// import { Loader2 } from "lucide-react"

interface Props {
  avatar: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function AvatarSettingsSheet({ avatar, open, onOpenChange, onSaved }: Props) {
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData)

    try {
      const res = await fetch(`/api/avatars/${avatar.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error()

      toast.success("Settings saved!")
      onSaved()
      onOpenChange(false)
    } catch {
      toast.error("Failed to save")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit @{avatar.handle}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSave} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label>Welcome Message</Label>
              <Textarea
                name="welcome_message"
                defaultValue={avatar.welcome_message || ""}
                placeholder="Hey! I'm Abed's AI. Ask me anything..."
                rows={3}
              />
            </div>

            <div>
              <Label>Pinned Instructions (always used)</Label>
              <Textarea
                name="pinned_instructions"
                defaultValue={avatar.pinned_instructions || ""}
                placeholder="My rate is $500/hr. I only take 3 clients/month..."
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="collect-name">Collect visitor name</Label>
                <Switch id="collect-name" name="collect_name" defaultChecked={avatar.collect_name} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="collect-email">Collect visitor email</Label>
                <Switch id="collect-email" name="collect_email" defaultChecked={avatar.collect_email} />
              </div>
            </div>

            <div>
              <Label>Calendly Link (optional)</Label>
              <Input
                name="calendly_link"
                type="url"
                defaultValue={avatar.calendly_link || ""}
                placeholder="https://calendly.com/abed/30min"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}