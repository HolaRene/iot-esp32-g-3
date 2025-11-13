import { Card } from "@/components/ui/card"

export function HardwareSection() {
    return (
        <section className="py-20 md:py-32 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                        Funciona con tu Hardware Favorito
                    </h2>
                    <p className="text-lg text-muted-foreground">Compatible con múltiples plataformas y microcontroladores</p>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    {["ESP32", "ESP8266", "Arduino", "Raspberry Pi"].map((hw) => (
                        <Card
                            key={hw}
                            className="h-24 border-border hover:border-primary/50 transition-smooth flex items-center justify-center group cursor-pointer"
                        >
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary/70 group-hover:text-primary transition-smooth">
                                    {hw.split(" ")[0] === "ESP32" && "📱"}
                                    {hw.split(" ")[0] === "ESP8266" && "📡"}
                                    {hw === "Arduino" && "⚙️"}
                                    {hw === "Raspberry Pi" && "🥧"}
                                </div>
                                <p className="text-sm font-medium text-foreground mt-2">{hw}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                <Card className="p-8 bg-card border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">Conecta en 3 pasos:</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { num: "1", title: "Configura WiFi", desc: "Conecta tu dispositivo a la red" },
                            { num: "2", title: "Establece Device ID", desc: "Registra tu dispositivo en Tablero" },
                            { num: "3", title: "Envía datos JSON", desc: "Comienza a monitorear al instante" },
                        ].map((step) => (
                            <div key={step.num} className="flex gap-4">
                                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-bold">
                                    {step.num}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground">{step.title}</p>
                                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </section>
    )
}
