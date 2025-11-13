import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
    return (
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/40">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                    ¿Listo para conectar tu primer dispositivo?
                </h2>

                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Regístrate gratis y comienza en 10 minutos. Incluye 5 dispositivos para empezar.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                        Comenzar Gratis Ahora
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 bg-transparent">
                        Ver Documentación Técnica
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                    No requiere tarjeta de crédito • Gratis siempre para 5 dispositivos
                </p>
            </div>
        </section>
    )
}
