"use client"

import { BadgeCheck, Building2, Calculator, Coins, FileText } from "lucide-react"

// Guía didáctica sobre la nómina en España: qué es, sus partes
// y cómo detectar errores antes de firmarla.
export function IncomeGuide() {
  return (
    <div className="rounded-2xl bg-card shadow-sm">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">¿Qué es y cómo se lee la nómina?</h3>
        </div>
      </div>

      <div className="space-y-5 px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
        <p>
          La nómina es el documento con el que tu empresa te paga y certifica cada mes qué conceptos forman tu salario.
          No es solo un papel para archivar: es una fuente de información fiscal y de derechos. Saber leerla te permite
          comprobar que te pagan lo pactado, que la retención de IRPF es razonable y que estás cotizando correctamente.
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <h4 className="font-semibold text-foreground">La parte superior: datos de la empresa y datos tuyos</h4>
          </div>
          <p>
            El encabezado recoge dos bloques. Por un lado, los de la empresa: nombre, domicilio, CIF y su código de
            cuenta de cotización. Por otro, los tuyos: nombre, DNI, número de afiliación a la Seguridad Social,
            categoría profesional y antigüedad. También figura el período de liquidación, es decir, qué mes cubre esa
            nómina.
          </p>
          <p>
            Un error en la antigüedad o en la categoría no es un detalle menor: ambas determinan tu convenio colectivo,
            tus complementos y parte de tus derechos. Revisa estos campos al menos cuando recibas la primera nómina.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 shrink-0 text-primary" />
            <h4 className="font-semibold text-foreground">Devengos: lo que ganas</h4>
          </div>
          <p>
            El salario bruto mensual es el salario anual pactado repartido entre las pagas que cobres. Si ganas
            24.000 € al año en 12 pagas, son 2.000 € brutos al mes. A esa base se le pueden sumar complementos
            (devengos): plus de convenio, antigüedad, nocturnidad, horas extra o primas de productividad.
          </p>
          <p>
            Algunas percepciones no son salariales, como dietas, plus de transporte o indemnizaciones: se abonan junto
            a la nómina, pero no cotizan ni cuentan para el cálculo de la pensión. Conviene saber cuáles son para no
            venderte mal tu propio sueldo.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 shrink-0 text-primary" />
            <h4 className="font-semibold text-foreground">Deducciones: lo que se te resta</h4>
          </div>
          <p>En casi todas las nóminas aparecen dos grandes restas:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Cotización a la Seguridad Social:</strong> principalmente contingencias
              comunes (alrededor del 6,35% de tu base de cotización, más pequeñas aportaciones por desempleo, formación
              y horas extra si las hay). Varía algo según el tipo de contrato y el convenio.
            </li>
            <li>
              <strong className="text-foreground">Retención del IRPF:</strong> un anticipo del impuesto que pagarás por
              todos tus ingresos al año. No es un gasto fijo: depende de cuánto cobras y de tu situación personal y
              familiar. Al hacer la declaración de la Renta se descuenta todo lo retenido: si te retuvieron de más,
              te devuelven; si de menos, pagas la diferencia. Tú puedes pedir que ajusten esta retención en tu nómina.
            </li>
          </ul>
          <p>
            Recuerda que, además, la empresa paga por ti por su cuenta (alrededor de un 30% adicional de tu
            retribución en cotizaciones y otros costes). No aparece en tu nómina, pero forma parte de lo que tu salario
            le cuesta realmente a la empresa. Puedes consultar tus bases de cotización en el portal «Tu Seguridad Social».
          </p>
        </div>

        <div className="rounded-xl bg-secondary/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Un ejemplo con cifras redondas</p>
          <p className="mt-2">
            Con 2.000 € <strong className="text-foreground">brutos</strong> mensuales (12 pagas), cotización a la
            Seguridad Social del 6,35% y retención de IRPF del 9%:
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Seguridad Social</p>
              <p className="font-semibold text-foreground">127 €</p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">IRPF</p>
              <p className="font-semibold text-foreground">180 €</p>
            </div>
            <div className="rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground">Total a percibir (neto)</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">≈ 1.693 €</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            <h4 className="font-semibold text-foreground">La parte final: el total a percibir y el «Recibí»</h4>
          </div>
          <p>
            Al pie aparece la cantidad que vas a cobrar y, habitualmente, una línea de «Recibí» que firma la persona
            trabajadora. Con esa firma reconoces que has cobrado esa cantidad, pero no renuncias a reclamar nada más:
            si has cobrado de menos, puedes y debes reclamar la diferencia. Las nóminas se guardan como justificante:
            cuando se envían por email, ese correo tiene a efectos prácticos la misma validez, y la empresa está
            obligada a entregarte una copia firmada si la necesitas (por ejemplo, para un préstamo).
          </p>
        </div>

        <p>
          No todas las nóminas son iguales: los devengos y las deducciones cambian según el convenio, el tipo de
          contrato y tus circunstancias personales. Pero en cuanto identificas las cuatro partes —datos, devengos,
          deducciones y total a percibir—, ya eres capaz de leer cualquier nómina y de detectar errores antes de que
          se conviertan en algo permanente.
        </p>
      </div>
    </div>
  )
}