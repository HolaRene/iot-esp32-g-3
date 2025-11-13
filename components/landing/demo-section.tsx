import { Card } from "@/components/ui/card"

export function DemoSection() {
    return (
        <section className="py-20 md:py-32 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Así funciona Tablero IoT</h2>
                    <p className="text-lg text-muted-foreground">Visualiza en tiempo real lo que sucede con tus dispositivos</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <img
                            src="/iot-dashboard-real-screenshot.jpg"
                            alt="Dashboard Real"
                            className="rounded-lg border border-border shadow-lg"
                        />
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                title: "Aquí ves tus dispositivos conectados",
                                desc: "Panel de estado con información de conexión en vivo",
                            },
                            {
                                title: "Gráficos en tiempo real con datos reales",
                                desc: "Actualizaciones instantáneas de sensores y métricas",
                            },
                            {
                                title: "Alertas y notificaciones automáticas",
                                desc: "Recibe avisos cuando algo requiere tu atención",
                            },
                            {
                                title: "Panel de control responsive",
                                desc: "Accede desde cualquier dispositivo, en cualquier momento",
                            },
                        ].map((item, idx) => (
                            <Card key={idx} className="p-4 border-border hover:border-primary/50 transition-smooth">
                                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
