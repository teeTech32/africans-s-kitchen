"use server"

import { revalidatePath } from "next/cache"

export async function revalidatePage(){
  revalidatePath('/meals')
}