import Image from "next/image";
import Link from "next/link";
export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        <a
          href="/#"
          target="_blank"
          rel="noreferrer"
        >
          <Image src={'/donjoe-foto.jpg'} alt="don" width={200} height={200} />
        </a>
        <span className="border-l rotate-45 h-6" />
        <Link href="/dashboard" >
          Ver el Tablero principal
        </Link>
      </div>
      <h1 className="sr-only">Una aplicación flexi de iot</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        con conexión a una esap32{" "}
        <a
          href="https://github.com/HolaRene/iot-esp32-g-3"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          Código fuente
        </a>{" "}
        y{" "}
        <a
          href="/#"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          nada
        </a>
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
