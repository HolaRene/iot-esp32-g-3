import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                ¡Gracias por suscribirte!
              </CardTitle>
              <CardDescription>Checkea tu correo para confirnal</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hemos enviado un correo de confirmación a tu dirección. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu suscripción. Si no lo encuentras, revisa la carpeta de spam o espera unos minutos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
