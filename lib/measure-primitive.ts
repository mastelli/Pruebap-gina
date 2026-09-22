import {
  type ISeriesPrimitive,
  type ISeriesAttachedParameters,
  type IPrimitivePaneView,
  type IPrimitivePaneRenderer,
  type Time,
  type SeriesType,
  type MouseEventParams,
  type IChartApi,
} from "lightweight-charts"

interface MeasurePoint {
  time: Time
  price: number
}

/**
 * Plugin de medicion: fija un primer punto al hacer clic, sigue el cursor a modo
 * de preview, y fija el segundo punto con otro clic mostrando el resultado.
 * Un tercer clic reinicia la medicion.
 */
export class MeasurePrimitive implements ISeriesPrimitive<Time> {
  private _chart: IChartApi | null = null
  private _series: import("lightweight-charts").ISeriesApi<SeriesType, Time> | null = null
  private _requestUpdate: (() => void) | null = null
  private _start: MeasurePoint | null = null
  private _end: MeasurePoint | null = null
  private _preview: MeasurePoint | null = null
  private _currency = ""
  private _measureActive = false
  private _viewsCache: readonly IPrimitivePaneView[] = [new MeasurePaneView(this)]

  readonly onDestroy = () => {}

  get start(): MeasurePoint | null { return this._start }
  get end(): MeasurePoint | null { return this._end }
  get preview(): MeasurePoint | null { return this._preview }
  get currency(): string { return this._currency }

  setCurrency(c: string) {
    this._currency = c
  }

  setMeasureActive(active: boolean) {
    this._measureActive = active
    if (!active) this.clear()
  }

  isActive(): boolean {
    return this._measureActive
  }

  private _priceAt(e: MouseEventParams<Time>): number | null {
    if (!this._series) return null
    if (e.point) {
      const p = this._series.coordinateToPrice(e.point.y)
      if (p != null) return p
    }
    if (e.time) {
      const data = e.seriesData.get(this._series as import("lightweight-charts").ISeriesApi<"Candlestick", Time>) as
        | { close?: number }
        | undefined
      if (data && data.close != null) return data.close
    }
    return null
  }

  private _timeAt(e: MouseEventParams<Time>): Time | null {
    if (e.time) return e.time
    if (e.point && this._chart) {
      return this._chart.coordinateToTime(e.point.x)
    }
    return null
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
    if (!this._start && !this._end && !this._preview) return
    this._start = null
    this._end = null
    this._preview = null
    this._requestUpdate?.()
  }

  attached(param: ISeriesAttachedParameters<Time, SeriesType>) {
    this._chart = param.chart as IChartApi
    this._series = param.series
    this._requestUpdate = param.requestUpdate

    this._clearHandlers()
    const clickHandler = (e: MouseEventParams<Time>) => {
      if (!this._measureActive) return
      const time = this._timeAt(e)
      const price = this._priceAt(e)
      if (time == null || price == null) return
      const point: MeasurePoint = { time, price }
      if (!this._start) {
        this.setStart(point)
      } else if (!this._end) {
        this.setEnd(point)
      } else {
        this.setStart(point)
      }
    }
    const crosshairHandler = (e: MouseEventParams<Time>) => {
      if (!this._measureActive) {
        this.setPreview(null)
        return
      }
      const time = this._timeAt(e)
      const price = this._priceAt(e)
      if (time == null || price == null) {
        this.setPreview(null)
        return
      }
      this.setPreview({ time, price })
    }
    this._clickHandler = clickHandler
    this._crosshairHandler = crosshairHandler
    this._chart?.subscribeClick(clickHandler)
    this._chart?.subscribeCrosshairMove(crosshairHandler)
  }

  private _clickHandler: ((param: MouseEventParams<Time>) => void) | null = null
  private _crosshairHandler: ((param: MouseEventParams<Time>) => void) | null = null
  private _clearHandlers() {
    if (this._chart && this._clickHandler) this._chart.unsubscribeClick(this._clickHandler)
    if (this._chart && this._crosshairHandler) this._chart.unsubscribeCrosshairMove(this._crosshairHandler)
    this._clickHandler = null
    this._crosshairHandler = null
  }

  detached() {
    this._clearHandlers()
    this._chart = null
    this._series = null
    this._requestUpdate = null
  }

  updateAllViews() {}

  paneViews(): readonly IPrimitivePaneView[] {
    return this._viewsCache
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
    if (!series) return

    target.useMediaCoordinateSpace(({ context: ctx, mediaSize }) => {
      ctx.save()

      // Aunque no haya current (recien se fijo el inicio), dibuja el ancla
      if (start) {
        const sx = series.timeToCoordinate(start.time)
        const sy = series.priceToCoordinate(start.price)
        if (sx != null && sy != null) this.drawHandle(ctx, sx, sy)
      }

      if (!start || !current) {
        ctx.restore()
        return
      }

      const sx = series.timeToCoordinate(start.time)
      const sy = series.priceToCoordinate(start.price)
      const ex = series.timeToCoordinate(current.time)
      const ey = series.priceToCoordinate(current.price)
      if (sx == null || sy == null || ex == null || ey == null) {
        ctx.restore()
        return
      }

      const diff = current.price - start.price
      const pct = start.price !== 0 ? (diff / start.price) * 100 : 0
      const days = (Number(current.time) - Number(start.time)) / 86400

      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
      ctx.setLineDash([])

      this.drawHandle(ctx, sx, sy)
      this.drawHandle(ctx, ex, ey)

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

      const labelLines = [
        `Δ ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
        `Δ ${diff >= 0 ? "+" : ""}${diff.toFixed(2)} ${p.currency}`,
        `${days.toFixed(0)} ${days === 1 ? "día" : "días"}`,
      ]

      const fontSize = 11
      ctx.font = "500 " + fontSize + "px -apple-system, Segoe UI, Roboto, sans-serif"
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
      this.roundRect(ctx, bx, by, boxW, boxH, 4)

      ctx.textBaseline = "middle"
      labelLines.forEach((line, i) => {
        ctx.fillStyle = i === 0 ? (pct >= 0 ? "#16a34a" : "#dc2626") : "#334155"
        ctx.textAlign = "left"
        ctx.fillText(line, bx + padX, by + 9 + i * lineH)
      })

      if (!p.end) {
        ctx.fillStyle = "rgba(71,85,105,0.9)"
        ctx.textAlign = "center"
        ctx.font = "500 11px -apple-system, Segoe UI, Roboto, sans-serif"
        const msg = "Haz clic para fijar el final"
        ctx.fillText(msg, Math.min(Math.max(sx, 0), Math.max(mediaSize.width - ctx.measureText(msg).width, 0)), Math.max(sy - 18, 12))
      }

      ctx.restore()
    })
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, r)
      ctx.fill()
      ctx.stroke()
      return
    }
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.fill()
    ctx.stroke()
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