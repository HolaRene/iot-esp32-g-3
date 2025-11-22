import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Wind, Sprout, Factory, Zap, Shield, Wrench } from "lucide-react"

const categories = [
    {
        icon: Cloud,
        name: "Ambiental",
        description: "Temperatura, humedad y presión atmosférica",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
        icon: Wind,
        name: "Calidad de Aire",
        description: "CO2, partículas PM2.5, gases contaminantes",
        color: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    {
        icon: Sprout,
        name: "Suelo",
        description: "Humedad del suelo, pH, nutrientes",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
        icon: Factory,
        name: "Industrial",
        description: "Vibración, temperatura de máquinas, presión",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
        icon: Zap,
        name: "Energía",
        description: "Consumo eléctrico, voltaje, corriente",
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    {
        icon: Shield,
        name: "Seguridad",
        description: "Movimiento, puertas, cámaras, alarmas",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
    },
    {
        icon: Wrench,
        name: "Personalizado",
        description: "Crea tus propios sensores con campos personalizados",
        color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    },
]

export function CategoriesSection() {
    return (
        <section className="py-20 md:py-32 bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                        7 Categorías de Sensores
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Clasifica tus sensores según su función y obtén configuraciones específicas para cada tipo
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map((category, idx) => {
                        const Icon = category.icon
                        return (
                            <Card
                                key={idx}
                                className={`p-6 border transition-all duration-300 hover:scale-105 hover:shadow-xl ${category.color}`}
                            >
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-background/50">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>

                <div className="mt-12 text-center">
                    <Badge variant="outline" className="px-4 py-2 text-sm">
                        Cada categoría tiene campos específicos adaptados a sus necesidades
                    </Badge>
                </div>
            </div>
        </section>
    )
}
