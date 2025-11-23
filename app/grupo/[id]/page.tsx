import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GroupDetailsPage from "@/components/grupoId/Groupt"

export const metadata: Metadata = {
    title: "Detalles del Grupo",
    description: "Monitorea todos los sensores de tu grupo en tiempo real",
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { id } = await params

    // Verificar que el grupo pertenece al usuario
    const { data: group } = await supabase
        .from("sensor_groups")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (!group) {
        redirect("/grupos")
    }

    return <GroupDetailsPage id={id} />
}