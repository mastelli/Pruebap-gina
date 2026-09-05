export default function Welcome() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Make It Right</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Gestión financiera para personas y empresas.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <a href="/calculator" className="btn btn-primary flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M2 12h20M4.93 4.93l2.83 2.83l2.83-2.83l-2.83-2.83l2.83-2.83l-2.83 2.83l2.83 2.83l2.83-2.83l-2.83 2.83l2.83 2.83l-2.83-2.83z" />
            </svg>
            <span>Calculadora de Interés Compuesto</span>
          </a>
          <a href="/analytics/overview" className="btn btn-secondary">
            Análisis Financiero
          </a>
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-medium mb-3">Características</h3>
          <div className="space-y-2">
            <div>Calculadora de Interés Compuesto</div>
            <div>Control de Patrimonio neto</div>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Versión actual. Las funciones completas requieren iniciar sesión.
        </p>
      </div>
    </div>
  )
}