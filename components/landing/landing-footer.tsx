import { Separator } from "@/components/ui/separator"

export function LandingFooter() {
    const currentYear = new Date().getFullYear()

    const footerSections = [
        {
            title: "Producto",
            links: ["Características", "Precios", "Seguridad", "Hoja de ruta"],
        },
        {
            title: "Recursos",
            links: ["Documentación Técnica", "Ejemplos de Código", "Guía ESP32", "Blog"],
        },
        {
            title: "Empresa",
            links: ["Acerca de", "Blog", "Contacto", "Comunidad"],
        },
        {
            title: "Legal",
            links: ["Privacidad", "Términos de Servicio", "Cookies", "Licencias"],
        },
    ]

    return (
        <footer className="bg-card border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-5 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-lg text-foreground mb-4">Tablero IoT</h3>
                        <p className="text-sm text-muted-foreground">
                            Tu centro de control para dispositivos inteligentes en español.
                        </p>
                    </div>

                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h4 className="font-semibold text-foreground mb-4 text-sm">{section.title}</h4>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="my-6" />

                <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
                    <p>© {currentYear} Tablero IoT. Todos los derechos reservados.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-primary transition-colors">
                            Twitter
                        </a>
                        <a href="#" className="hover:text-primary transition-colors">
                            GitHub
                        </a>
                        <a href="#" className="hover:text-primary transition-colors">
                            LinkedIn
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
