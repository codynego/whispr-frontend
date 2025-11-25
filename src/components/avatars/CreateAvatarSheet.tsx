// components/avatars/CreateAvatarSheet.tsx
"use client"; // ← Required because we use hooks + form

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Upload } from "lucide-react"
import { useState } from "react"
import { api } from "@/lib/fetcher" // ← uses your smart axios instance

const schema = z.object({
  name: z.string().min(2, "Name too short"),
  handle: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, _ and -")
    .min(3, "Handle too short")
    .max(30, "Handle too long"),
  purpose: z.string().min(1, "Purpose is required"),
  tone_preset: z.string().min(1, "Tone is required"),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateAvatarSheet({ open, onOpenChange, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      purpose: "personal",
      tone_preset: "friendly",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/avatars/", data)

      toast.success("Your AI clone is born! Now train it.")
      reset()
      setPhotoPreview(null)
      onSuccess()        // ← triggers mutate() in parent
      onOpenChange(false)
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || "Failed to create avatar"
      toast.error(message)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Your AI Clone</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={uploading}
              />
            </div>
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} placeholder="Abed" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Handle */}
          <div className="space-y-2">
            <Label>Handle</Label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">@</span>
              <Input {...register("handle")} placeholder="abed" />
            </div>
            {errors.handle && <p className="text-red-500 text-sm">{errors.handle.message}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-6">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create AI"
              )}
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