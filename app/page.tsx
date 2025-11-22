
import { CTASection } from "@/components/landing/CTASenction"
import { DemoSection } from "@/components/landing/demo-section"
import { FeaturesSection } from "@/components/landing/feature-section"
import { HardwareSection } from "@/components/landing/hardware-section"
import { HeroSection } from "@/components/landing/hero-section"
import { LandingFooter } from "@/components/landing/landing-footer"
import { TestimonialsSection } from "@/components/landing/testimonial-section"
import { UseCasesSection } from "@/components/landing/use-caso-section"
import { CategoriesSection } from "@/components/landing/categories-section"

export const metadata = {
  title: "Tablero IoT - Gestiona Sensores por Grupos y Categorías",
  description:
    "Organiza tus sensores ESP32 en grupos personalizados. 7 categorías disponibles: Ambiental, Calidad de Aire, Suelo, Industrial, Energía, Seguridad y Personalizado. Visualiza datos en tiempo real.",
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <DemoSection />
      <UseCasesSection />
      <HardwareSection />
      {/* <TestimonialsSection /> */}
      <CTASection />
      <LandingFooter />
    </main>
  )
}

