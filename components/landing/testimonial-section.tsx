import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
    {
        name: "Carlos M.",
        role: "Ingeniero IoT",
        text: "Por fin una plataforma en español que entiende nuestras necesidades. La integración con ESP32 fue increíblemente sencilla.",
        initials: "CM",
    },
    {
        name: "Ana R.",
        role: "Investigadora Universitaria",
        text: "Tablero IoT me permitió concentrarme en mi investigación, no en configurar servidores. Los gráficos en tiempo real son perfectos.",
        initials: "AR",
    },
    {
        name: "Miguel T.",
        role: "Agricultor Tecnológico",
        text: "Monitoreo mis invernaderos desde el celular. Las alertas me avisan antes de que haya problemas.",
        initials: "MT",
    },
]

export function TestimonialsSection() {
    return (
        <section className="py-20 md:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                        Lo que dicen nuestros usuarios
                    </h2>
                    <p className="text-lg text-muted-foreground">Profesionales que confían en Tablero IoT</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, idx) => (
                        <Card key={idx} className="p-6 border-border hover:border-primary/50 transition-smooth">
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                ))}
                            </div>

                            <p className="text-muted-foreground mb-6 leading-relaxed italic">{testimonial.text}</p>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
