import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 pt-20 pb-32">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Hecho para hispanohablantes</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
                        Monitorea todos tus sensores en un solo lugar
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 text-balance leading-relaxed">
                        Conecta dispositivos ESP32, visualiza datos en tiempo real y toma el control desde cualquier dispositivo
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={'/auth/login'}>
                            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                                Inicia sesión
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href={'/dashboard'}><Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 bg-transparent">
                            Ir al tablero principal                        </Button></Link>
                    </div>
                </div>

                {/* Dashboard mockup placeholder */}
                <div className="mt-16 relative">
                    <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                        <img src="/iot-dashboard-with-charts-and-metrics.jpg" alt="Tablero IoT Dashboard" className="w-full h-auto" />
                    </div>
                    {/* Floating device icons - decorative */}
                    <div className="absolute -top-8 -left-12 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-lg border border-primary/30 p-4 shadow-lg backdrop-blur">
                        <div className="w-full h-full bg-secondary/10 rounded flex items-center justify-center">
                            <span className="text-xs font-mono text-primary">ESP32</span>
                        </div>
                    </div>
                    <div className="absolute -bottom-6 -right-12 w-28 h-28 bg-gradient-to-br from-accent/20 to-transparent rounded-lg border border-accent/30 p-4 shadow-lg backdrop-blur">
                        <div className="w-full h-full bg-secondary/10 rounded flex items-center justify-center">
                            <span className="text-xs font-mono text-accent">Sensor</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
