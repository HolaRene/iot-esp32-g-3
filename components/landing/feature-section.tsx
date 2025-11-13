import { Card } from "@/components/ui/card"
import { Zap, BarChart3, Layers, Shield } from "lucide-react"

const features = [
    {
        icon: Zap,
        title: "Configuración Sencilla",
        description: "Conecta tu ESP32 en minutos, no en horas",
        items: ["Sin servidores complicados", "API lista", "Documentación clara"],
    },
    {
        icon: BarChart3,
        title: "Visualización en Tiempo Real",
        description: "Gráficos que se actualizan al instante",
        items: ["Métricas en vivo", "Histórico ilimitado", "Widgets personalizables"],
    },
    {
        icon: Layers,
        title: "Gestión de Dispositivos",
        description: "Organiza por grupos y ubicaciones",
        items: ["Grupos personalizados", "Múltiples ubicaciones", "Estados de conexión"],
    },
    {
        icon: Shield,
        title: "Seguridad y Control",
        description: "Tus datos protegidos, tu control total",
        items: ["Autenticación segura", "Datos privados", "Acceso multiplataforma"],
    },
]

export function FeaturesSection() {
    return (
        <section className="py-20 md:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                        Características Principales
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Todo lo que necesitas para monitorear y controlar tus dispositivos IoT
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon
                        return (
                            <Card
                                key={idx}
                                className="p-6 border-border hover:border-primary/50 transition-smooth hover:shadow-lg group"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-smooth">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                                <ul className="space-y-2">
                                    {feature.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className="text-accent font-bold">•</span>
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
