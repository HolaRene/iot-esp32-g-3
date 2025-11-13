
import { CTASection } from "@/components/landing/CTASenction"
import { DemoSection } from "@/components/landing/demo-section"
import { FeaturesSection } from "@/components/landing/feature-section"
import { HardwareSection } from "@/components/landing/hardware-section"
import { HeroSection } from "@/components/landing/hero-section"
import { LandingFooter } from "@/components/landing/landing-footer"
import { TestimonialsSection } from "@/components/landing/testimonial-section"
import { UseCasesSection } from "@/components/landing/use-caso-section"

export const metadata = {
  title: "Tablero IoT - Tu Centro de Control para Dispositivos Inteligentes",
  description:
    "Monitorea todos tus sensores en un solo lugar. Conecta dispositivos ESP32, visualiza datos en tiempo real y toma el control desde cualquier dispositivo.",
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <UseCasesSection />
      <HardwareSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </main>
  )
}
