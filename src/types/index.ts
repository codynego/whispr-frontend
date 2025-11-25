// types/avatar.ts
export interface Avatar {
  id: string
  name: string
  handle: string
  photo_url: string | null
  purpose: string
  visibility: "public" | "protected" | "private"
  trained: boolean
  total_conversations: number
  total_messages: number
  welcome_message: string | null
  collect_name: boolean
  collect_email: boolean
  calendly_link: string | null
  pinned_instructions: string | null
  // add more as needed
}