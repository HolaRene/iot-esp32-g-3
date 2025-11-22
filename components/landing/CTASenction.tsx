import { Button } from "@/components/ui/button"
import { ArrowRight, FolderTree } from "lucide-react"
import Link from "next/link"

export function CTASection() {
    return (
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/40">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                    ¿Listo para organizar tus sensores?
                </h2>

                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Crea grupos personalizados y clasifica tus sensores por categoría. Comienza ahora mismo.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link href="/grupos">
                        <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                            <FolderTree className="w-4 h-4" />
                            Ver Grupos
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Link href="/dispositivos-flexis">
                        <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 bg-transparent">
                            Gestionar Sensores
                        </Button>
                    </Link>
                </div>

                <p className="text-sm text-muted-foreground">
                    7 categorías disponibles • Grupos ilimitados • Datos en tiempo real
                </p>
            </div>
        </section>
    )
}
