import {
  type IChartApi,
  type ISeriesApi,
  type ISeriesPrimitive,
  type SeriesAttachedParameter,
  type IPrimitivePaneRenderer,
  type IPrimitivePaneView,
  type MouseEventParams,
  type Time,
  type SeriesType,
} from "lightweight-charts"

const dbg = (msg: string, ...args: unknown[]) => console.log("[measure]", msg, ...args)

type BitmapScope = {
  context: CanvasRenderingContext2D
  horizontalPixelRatio: number
  verticalPixelRatio: number
  bitmapSize: { width: number; height: number }
}

type CanvasTarget = {
  useBitmapCoordinateSpace(callback: (scope: BitmapScope) => void): void
}

export interface MeasurePoint {
  time: Time
  price: number
}

interface ViewPoint {
  x: number | null
  y: number | null
}

export interface MeasureToolOptions {
  fillColor: string
  lineColor: string
  labelColor: string
  labelTextColor: string
  currency: string
}

const defaultOptions: MeasureToolOptions = {
  fillColor: "rgba(59, 130, 246, 0.15)",
  lineColor: "#3b82f6",
  labelColor: "rgba(37, 99, 235, 0.95)",
  labelTextColor: "#ffffff",
  currency: "",
}

export class MeasureRectangle implements ISeriesPrimitive<Time> {
  readonly _chart: IChartApi
  readonly _series: ISeriesApi<SeriesType, Time>
  private _p1: MeasurePoint
  private _p2: MeasurePoint
  private readonly _options: MeasureToolOptions
  private readonly _paneViews: MeasurePaneView[]
  private _requestUpdateRef: (() => void) | null = null

  constructor(
    chart: IChartApi,
    series: ISeriesApi<SeriesType, Time>,
    p1: MeasurePoint,
    p2: MeasurePoint,
    options: Partial<MeasureToolOptions> = {}
  ) {
    this._chart = chart
    this._series = series
    this._p1 = p1
    this._p2 = p2
    this._options = { ...defaultOptions, ...options }
    this._paneViews = [new MeasurePaneView(this)]
  }

  get p1(): MeasurePoint {
    return this._p1
  }

  get p2(): MeasurePoint {
    return this._p2
  }

  get options(): MeasureToolOptions {
    return this._options
  }

  setStart(p: MeasurePoint) {
    this._p1 = p
    this._p2 = p
    this._requestUpdateRef?.()
  }

  setEnd(p: MeasurePoint) {
    this._p2 = p
    this._paneViews.forEach((v) => v.update())
    this._requestUpdateRef?.()
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return this._paneViews
  }

  updateAllViews() {
    this._paneViews.forEach((v) => v.update())
  }

  attached(param: SeriesAttachedParameter<Time, SeriesType>) {
    dbg("rect attached")
    this._requestUpdateRef = param.requestUpdate
    this._paneViews.forEach((v) => v.update())
  }

  detached() {
    this._requestUpdateRef = null
  }
}

export class MeasurePaneView implements IPrimitivePaneView {
  private readonly _source: MeasureRectangle
  private _p1: ViewPoint = { x: null, y: null }
  private _p2: ViewPoint = { x: null, y: null }

  constructor(source: MeasureRectangle) {
    this._source = source
  }

  update() {
    const series = this._source._series
    const timeScale = this._source._chart.timeScale()
    this._p1 = {
      x: timeScale.timeToCoordinate(this._source.p1.time),
      y: series.priceToCoordinate(this._source.p1.price),
    }
    this._p2 = {
      x: timeScale.timeToCoordinate(this._source.p2.time),
      y: series.priceToCoordinate(this._source.p2.price),
    }
  }

  renderer(): IPrimitivePaneRenderer {
    return new MeasureRenderer(this._p1, this._p2, this._source)
  }
}

class MeasureRenderer implements IPrimitivePaneRenderer {
  private readonly _p1: ViewPoint
  private readonly _p2: ViewPoint
  private readonly _source: MeasureRectangle

  constructor(p1: ViewPoint, p2: ViewPoint, source: MeasureRectangle) {
    this._p1 = p1
    this._p2 = p2
    this._source = source
  }

  draw(target: CanvasTarget) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      if (this._p1.x === null || this._p1.y === null || this._p2.x === null || this._p2.y === null) return
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio
      const x1 = this._p1.x * hpr
      const y1 = this._p1.y * vpr
      const x2 = this._p2.x * hpr
      const y2 = this._p2.y * vpr
      const opts = this._source.options
      const left = Math.min(x1, x2)
      const right = Math.max(x1, x2)
      const top = Math.min(y1, y2)
      const bottom = Math.max(y1, y2)

      ctx.fillStyle = opts.fillColor
      ctx.fillRect(left, top, right - left, bottom - top)

      ctx.strokeStyle = opts.lineColor
      ctx.lineWidth = 1
      ctx.setLineDash([5 * hpr, 5 * hpr])
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.setLineDash([])

      this.handle(ctx, x1, y1)
      this.handle(ctx, x2, y2)

      const diff = this._source.p2.price - this._source.p1.price
      const base = this._source.p1.price
      const pct = base !== 0 ? (diff / base) * 100 : 0
      const days =
        (Number(this._source.p2.time) - Number(this._source.p1.time)) / 86400
      const sign = diff >= 0 ? "+" : ""
      const cur = opts.currency ? ` ${opts.currency}` : ""
      const lines = [
        { text: `Δ ${sign}${pct.toFixed(2)}%`, color: pct >= 0 ? "#16a34a" : "#dc2626" },
        { text: `Δ ${sign}${diff.toFixed(2)}${cur}`, color: opts.labelTextColor },
        { text: `${days.toFixed(0)} ${days === 1 ? "día" : "días"}`, color: "#94a3b8" },
      ]

      const fontSize = Math.round(12 * vpr)
      const padX = Math.round(8 * hpr)
      const lineH = Math.round(17 * vpr)
      ctx.font = `500 ${fontSize}px -apple-system, Segoe UI, Roboto, sans-serif`
      const widths = lines.map((l) => ctx.measureText(l.text).width)
      const boxW = Math.max(...widths) + padX * 2
      const boxH = lines.length * lineH + Math.round(8 * vpr)
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2
      let bx = midX - boxW / 2
      let by = midY - boxH - Math.round(14 * vpr)
      bx = Math.max(4, Math.min(bx, scope.bitmapSize.width - boxW - 4))
      by = Math.max(4, by)

      ctx.fillStyle = opts.labelColor
      this.roundRect(ctx, bx, by, boxW, boxH, Math.round(5 * hpr), () => ctx.fill())

      ctx.textBaseline = "middle"
      lines.forEach((l, i) => {
        ctx.fillStyle = l.color
        ctx.textAlign = "left"
        ctx.fillText(l.text, bx + padX, by + Math.round(10 * vpr) + i * lineH)
      })
    })
  }

  private handle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#3b82f6"
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: () => void
  ) {
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, r)
      fill()
      return
    }
    let radius = r
    radius = Math.min(radius, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
    ctx.lineTo(x + w, y + h - radius)
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    ctx.lineTo(x + radius, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    fill()
  }
}

export class MeasureTool {
  private readonly _chart: IChartApi
  private readonly _series: ISeriesApi<SeriesType, Time>
  private readonly _defaults: Partial<MeasureToolOptions>
  private _active = false
  private _currency = ""
  private _p1: MeasurePoint | null = null
  private _p2: MeasurePoint | null = null
  private _rect: MeasureRectangle | null = null

  private readonly _clickHandler = (param: MouseEventParams<Time>) => {
    try {
      this._onClick(param)
    } catch (err) {
      dbg("click error", err)
    }
  }

  private readonly _moveHandler = (param: MouseEventParams<Time>) => {
    try {
      this._onMouseMove(param)
    } catch (err) {
      dbg("move error", err)
    }
  }

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType, Time>, options: Partial<MeasureToolOptions> = {}) {
    this._chart = chart
    this._series = series
    this._defaults = options
    chart.subscribeClick(this._clickHandler)
    chart.subscribeCrosshairMove(this._moveHandler)
  }

  setActive(active: boolean) {
    dbg("setActive", { active })
    this._active = active
    if (!active) this._clear()
  }

  isActive(): boolean {
    return this._active
  }

  updateCurrency(currency: string) {
    this._currency = currency
  }

  remove() {
    this._chart.unsubscribeClick(this._clickHandler)
    this._chart.unsubscribeCrosshairMove(this._moveHandler)
    this._clear()
  }

  private _onClick(param: MouseEventParams<Time>) {
    dbg("click", { active: this._active, hasPoint: !!param.point, time: param.time })
    if (!this._active) return
    if (!param.point) return
    const time = param.time ?? this._chart.timeScale().coordinateToTime(param.point.x)
    const price = this._series.coordinateToPrice(param.point.y)
    dbg("click resolved", { time, price })
    if (time == null || price == null) return
    const point: MeasurePoint = { time, price }
    if (!this._p1) {
      this._p1 = point
      this._addRect(point, point)
    } else if (!this._p2) {
      this._p2 = point
      this._rect?.setEnd(point)
    } else {
      this._clear()
      this._p1 = point
      this._addRect(point, point)
    }
  }

  private _onMouseMove(param: MouseEventParams<Time>) {
    if (!this._active || !this._p1 || !this._rect || this._p2) return
    if (!param.point) return
    const time = param.time ?? this._chart.timeScale().coordinateToTime(param.point.x)
    const price = this._series.coordinateToPrice(param.point.y)
    if (time == null || price == null) return
    this._rect.setEnd({ time, price })
  }

  private _addRect(p1: MeasurePoint, p2: MeasurePoint) {
    const rect = new MeasureRectangle(this._chart, this._series, p1, p2, {
      ...this._defaults,
      currency: this._currency,
    })
    this._series.attachPrimitive(rect)
    this._rect = rect
  }

  private _clear() {
    this._p1 = null
    this._p2 = null
    if (this._rect) {
      this._series.detachPrimitive(this._rect)
      this._rect = null
    }
  }
}