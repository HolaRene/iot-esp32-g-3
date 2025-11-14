import Datos from "@/components/sensor/datos";


export default async function SensorPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    return (
        <div className="p-6 space-y-6">
            {/* TITULO */}
            <h1 className="text-2xl font-bold">
                Ver sensor
            </h1>
            <Datos id={id} />
        </div>
    );
}
