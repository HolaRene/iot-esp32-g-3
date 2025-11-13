import { Card } from "@/components/ui/card"
import { Home, Leaf, Factory, Microscope } from "lucide-react"

const useCases = [
    {
        icon: Home,
        title: "Domótica Inteligente",
        description: "Controla temperatura, humedad y seguridad de tu hogar",
        example: "Thermostat automático, alertas de puertas, monitoreo ambiental",
    },
    {
        icon: Leaf,
        title: "Agricultura de Precisión",
        description: "Optimiza riego y nutrientes con datos en tiempo real",
        example: "Humedad de suelo, clima micro-local, crecimiento de plantas",
    },
    {
        icon: Factory,
        title: "Monitoreo Industrial",
        description: "Supervisa máquinas y procesos críticos",
        example: "Temperatura de equipos, vibraciones, consumo energético",
    },
    {
        icon: Microscope,
        title: "Investigación y Desarrollo",
        description: "Recolecta datos para tus proyectos de investigación",
        example: "Experimentos científicos, pruebas de prototipos, análisis de datos",
    },
]

export function UseCasesSection() {
    return (
        <section className="py-20 md:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Casos de Uso</h2>
                    <p className="text-lg text-muted-foreground">Tablero IoT funciona en múltiples industrias y aplicaciones</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {useCases.map((useCase, idx) => {
                        const Icon = useCase.icon
                        return (
                            <Card
                                key={idx}
                                className="p-6 border-border hover:border-accent/50 transition-smooth hover:shadow-lg group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 text-accent flex-shrink-0 group-hover:bg-accent/20 transition-smooth">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-foreground mb-2">{useCase.title}</h3>
                                        <p className="text-muted-foreground mb-3 leading-relaxed">{useCase.description}</p>
                                        <p className="text-sm text-muted-foreground italic border-l-2 border-accent/30 pl-3">
                                            {useCase.example}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
