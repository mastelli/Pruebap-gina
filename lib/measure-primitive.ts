import {
  type ISeriesPrimitive,
  type ISeriesAttachedParameters,
  type IPrimitivePaneView,
  type IPrimitivePaneRenderer,
  type Time,
  type SeriesType,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts"

interface MeasurePoint {
  time: UTCTimestamp
  price: number
}

/**
 * Plugin de medicion: fija un primer punto al hacer clic, sigue el cursor a modo
 * de preview, y fija el segundo punto con otro clic mostrando el resultado.
 * Un tercer clic reincia la medicion.
 */
export class MeasurePrimitive implements ISeriesPrimitive<Time> {
  private _chart: ISeriesAttachedParameters<Time, SeriesType>["chart"] | null = null
  private _series: ISeriesAttachedParameters<Time, SeriesType>["series"] | null = null
  private _requestUpdate: (() => void) | null = null
  private _start: MeasurePoint | null = null
  private _end: MeasurePoint | null = null
  private _preview: MeasurePoint | null = null
  private _currency = ""
  private _measureActive = false
  private _clickHandler: ((param: MouseEventParams<Time>) => void) | null = null
  private _crosshairHandler: ((param: MouseEventParams<Time>) => void) | null = null

  get start(): MeasurePoint | null { return this._start }
  get end(): MeasurePoint | null { return this._end }
  get preview(): MeasurePoint | null { return this._preview }
  get currency(): string { return this._currency }

  setCurrency(c: string) {
    this._currency = c
  }

  setMeasureActive(active: boolean) {
    this._measureActive = active
    if (!active && this._chart) {
      this.clear()
    }
  }

  setStart(point: MeasurePoint) {
    this._start = point
    this._end = null
    this._preview = null
    this._requestUpdate?.()
  }

  setEnd(point: MeasurePoint) {
    this._end = point
    this._preview = null
    this._requestUpdate?.()
  }

  setPreview(point: MeasurePoint | null) {
    this._preview = point
    this._requestUpdate?.()
  }

  clear() {
    this._start = null
    this._end = null
    this._preview = null
    this._requestUpdate?.()
  }

  attached(param: ISeriesAttachedParameters<Time, SeriesType>) {
    this._chart = param.chart
    this._series = param.series
    this._requestUpdate = param.requestUpdate

    this._clickHandler = (e: MouseEventParams<Time>) => {
      if (!this._measureActive || !e.time || !e.point || !this._series) return
      const data = e.seriesData.get(this._series) as { close?: number } | undefined
      if (data == null || data.close == null) return
      const point = { time: e.time as UTCTimestamp, price: data.close }
      if (!this._start) {
        this.setStart(point)
      } else if (!this._end) {
        this.setEnd(point)
      } else {
        this.clear()
        this.setStart(point)
      }
    }

    this._crosshairHandler = (e: MouseEventParams<Time>) => {
      if (!this._measureActive || !e.time || !this._series || this._end) { this.setPreview(null); return }
      const data = e.seriesData.get(this._series) as { close?: number } | undefined
      if (data == null || data.close == null) { this.setPreview(null); return }
      this.setPreview({ time: e.time as UTCTimestamp, price: data.close })
    }

    this._chart?.subscribeClick(this._clickHandler)
    this._chart?.subscribeCrosshairMove(this._crosshairHandler)
  }

  detached() {
    if (this._chart && this._clickHandler) this._chart.unsubscribeClick(this._clickHandler)
    if (this._chart && this._crosshairHandler) this._chart.unsubscribeCrosshairMove(this._crosshairHandler)
    this._chart = null
    this._series = null
    this._requestUpdate = null
    this._clickHandler = null
    this._crosshairHandler = null
  }

  updateAllViews() {}

  paneViews(): readonly IPrimitivePaneView[] {
    return [new MeasurePaneView(this)]
  }
}

export class MeasurePaneView implements IPrimitivePaneView {
  readonly _primitive: MeasurePrimitive

  constructor(primitive: MeasurePrimitive) {
    this._primitive = primitive
  }

  renderer(): IPrimitivePaneRenderer | null {
    return new MeasureRenderer(this._primitive)
  }
}

class MeasureRenderer implements IPrimitivePaneRenderer {
  readonly _primitive: MeasurePrimitive

  constructor(primitive: MeasurePrimitive) {
    this._primitive = primitive
  }

  draw(target: import("lightweight-charts").CanvasRenderingTarget2D) {
    const p = this._primitive
    const series = (p as unknown as { _series: import("lightweight-charts").ISeriesApi<SeriesType, Time> | null })._series
    const start = p.start
    const current = p.end ?? p.preview
    if (!series || !start || !current) return

    const sx = series.timeToCoordinate(start.time as Time)
    const sy = series.priceToCoordinate(start.price)
    const ex = series.timeToCoordinate(current.time as Time)
    const ey = series.priceToCoordinate(current.price)
    if (sx == null || sy == null || ex == null || ey == null) return

    const diff = current.price - start.price
    const pct = start.price !== 0 ? (diff / start.price) * 100 : 0
    const days = (Number(current.time) - Number(start.time)) / 86400

    target.useMediaCoordinateSpace(({ context: ctx, mediaSize }) => {
      ctx.save()

      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
      ctx.setLineDash([])

      // Marcadores de anclaje
      this.drawHandle(ctx, sx, sy)
      this.drawHandle(ctx, ex, ey)

      // Distancias vertical / horizontal
      ctx.strokeStyle = "rgba(59,130,246,0.4)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, sy)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(ex, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()

      // Etiqueta con el resultado
      const labelLines = [
        `Δ ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
        `Δ ${diff >= 0 ? "+" : ""}${diff.toFixed(2)} ${p.currency}`,
        `${days.toFixed(0)} ${days === 1 ? "día" : "días"}`,
      ]

      const fontSize = 11
      ctx.font = `500 ${fontSize}px -apple-system, Segoe UI, Roboto, sans-serif`
      const padX = 8
      const lineH = fontSize + 6
      const boxW = Math.max(...labelLines.map((l) => ctx.measureText(l).width)) + padX * 2
      const boxH = labelLines.length * lineH + 6
      let bx = ex + 10
      let by = ey - boxH - 4
      if (bx + boxW > mediaSize.width) bx = ex - boxW - 10
      if (by < 4) by = 4

      ctx.fillStyle = "rgba(255,255,255,0.95)"
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(bx, by, boxW, boxH, 4)
      ctx.fill()
      ctx.stroke()

      ctx.textBaseline = "middle"
      labelLines.forEach((line, i) => {
        ctx.fillStyle = i === 0 ? (pct >= 0 ? "#16a34a" : "#dc2626") : "#334155"
        ctx.textAlign = "left"
        ctx.fillText(line, bx + padX, by + 9 + i * lineH)
      })

      // Help cuando no hay end
      if (!p.end) {
        ctx.fillStyle = "rgba(71,85,105,0.9)"
        ctx.textAlign = "center"
        ctx.font = `500 11px -apple-system, Segoe UI, Roboto, sans-serif`
        const msg = "Haz clic para fijar el final"
        ctx.fillText(msg, Math.min(Math.max(sx, 0), Math.max(mediaSize.width - ctx.measureText(msg).width, 0)), Math.max(sy - 18, 12))
      }

      ctx.restore()
    })
  }

  private drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#3b82f6"
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
}