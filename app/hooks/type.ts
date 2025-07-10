// app/hooks/types.ts
export type BookWithAuthor = {
  id: string
  title: string
  author: string
}

export type CartItem = BookWithAuthor & {
  quantity: number
}
