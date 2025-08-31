import Router from '@koa/router'
import type { Application } from '../declarations'
import { verify } from 'jsonwebtoken'
import { logger } from '../logger'

export const configurePrintRoute = (app: Application) => {
  const router = new Router()

  router.get('/print', async (ctx) => {
    let accessToken = ctx.query.access_token as string | undefined
    if (!accessToken) {
      const authHeader = ctx.request.headers.authorization
      if (!authHeader) {
        ctx.throw(401, 'No Authorization header or access_token')
        return
      }
      accessToken = authHeader.replace(/^Bearer\s+/i, '')
    }

    let user: any
    try {
      const authResult = await app.service('authentication').authenticate(
        { strategy: 'jwt', accessToken },
        {}
      )
      user = authResult.user
    } catch (err) {
      try {
        const secret = app.get('authentication')?.secret
        if (!secret) throw new Error('Authentication secret not configured')

        const payload: any = verify(accessToken, secret)
        const userId = payload.sub ?? payload.id
        if (!userId) throw new Error('Token payload missing sub/id')

        user = await app.service('users').get(userId)
      } catch (err2) {
        logger.error('Authentication failed for /print:', err2)
        ctx.throw(401, 'Invalid token or unauthorized')
        return
      }
    }

    const { invoiceId } = ctx.query
    if (!invoiceId) {
      ctx.throw(400, 'invoiceId is required')
      return
    }

    const invoice = await app.service('invoices').get(Number(invoiceId), { user })

    let items: any[] = []
    const tryFindItems = async (serviceName: any) => {
      try {
        const res: any = await app.service(serviceName).find({
          query: { invoiceId: invoice.id },
          paginate: false
        })
        return Array.isArray(res) ? res : res.data ?? []
      } catch (e) {
        return null
      }
    }

    items = (await tryFindItems('invoices-items')) ?? (await tryFindItems('invoices-items')) ?? []

    const formatNum = (n: number) =>
      Number.isFinite(n) ? n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'

    const formatDateTime = (val: any) => {
      if (!val) return ''
      const d = typeof val === 'number' ? new Date(val) : new Date(String(val))
      if (Number.isNaN(d.getTime())) return String(val)
      return d.toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      })
    }

    const mapQty = (it: any) => Number(it.quantity ?? it.qty ?? it.cantidad ?? 1)
    const mapPrice = (it: any) => Number(it.price ?? it.unitPrice ?? it.unit_price ?? it.precio ?? 0)

    let computedTotal = 0

  const itemsHtml = items.length
    ? `
      <table class="items-table" style="width:100%;border-collapse:collapse; table-layout: fixed; margin-bottom:12px">
        <tbody>
          <thead>
            <tr>
              <th class="col-qty"></th>
              <th class="col-desc"></th>
              <th class="col-price"></th>
              <th class="col-subtotal"></th>
            </tr>
          </thead>
          ${items.map((it) => {
            const qty = mapQty(it)
            let price = mapPrice(it)
            const subtotal = qty * price
            computedTotal += subtotal
            const name = it.name ?? it.description ?? it.productName ?? it.product?.name ?? 'Item'
            return `
              <tr class="item-row">
                <td>${qty}</td>
                <td>${escapeHtml(name).toUpperCase()}</td>
                <td>${formatNum(price)}</td>
                <td>${formatNum(subtotal)}</td>
              </tr>`
          }).join('')}
        </tbody>
      </table>`
    : '<div style="padding:10px;text-align:center;color:#666">No hay items</div>'

    const totalToShow = invoice.total ?? computedTotal
    const userCuit = user?.cuit ?? '-'
    const userCompanyName = user?.companyName ?? '-'
    const userAddress = user?.address ?? '-'
    const userAlias = user?.alias ?? '-'
    const userCbu = user?.cbu ?? '-'
    const clientCuit = invoice?.cuit ?? '-'
    const clientCompanyName = invoice?.companyName ?? '-'
    const clientAddress = invoice?.address ?? '-'
    let invoiceType = invoice.type ?? ''
    let summary = ''
    let footer = ''
    if (invoiceType==='arca'){
      invoiceType = "FACTURA 'A'"
      summary = `<div style="min-width:120px;text-align:left">TOTAL S/ IVA: $${formatNum(Number(totalToShow))}</div>
        <div style="min-width:120px;text-align:left">IVA 21%: $${formatNum(Number(totalToShow)*0.21)}</div>
        <div style="min-width:120px;font-size:2.7em;text-align:left">TOTAL: $${formatNum(Number(totalToShow)+Number(totalToShow)*0.21)}</div>`
    } else {
      invoiceType = 'COMPROBANTE'
      summary = `<div>TOTAL:</div><div style="min-width:120px;text-align:left">$${formatNum(Number(totalToShow))}</div>`
      footer = `
        <div style="margin-top:10px"><strong>¡Gracias por su compra!<strong></div>
        <div><strong>Alias: ${escapeHtml(userAlias)}</strong></div>
        <div><strong>CBU: ${escapeHtml(userCbu)}</strong></div>`
    }
    ctx.type = 'html'
    ctx.body = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(invoiceType)} #${escapeHtml(String(invoice.id))}</title>
          <style>
            @font-face {font-family: "Ticketing"; src: url("https://cdn.glitch.global/7512b28f-8b2c-4a3e-bb02-e10754e44fab/public%2FTicketing.ttf?v=1739215600647") format("truetype") }
            body { font-family: "Ticketing", serif; padding: 0; margin: 0; color: #222 }
            .meta { margin-bottom: 12px; font-size: 2.6em }
            .meta div { margin-bottom: 4px }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              font-size: 2.2em;
              font-weight: 850;
              margin-left: 0;
              padding-left: 0;
            }
            .items-table td, .items-table th {
              padding: 6px 4px;
              vertical-align: top;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .col-qty      { width: 10%; text-align: left; }
            .col-desc     { width: 40%; text-align: left }
            .col-price    { width: 25%; text-align: right; }
            .col-subtotal { width: 25%; text-align: right; padding-left: 12px; }
            .item-subtotal { font-weight:600; font-size: 2.6em }
            .summary { margin-top:12px; font-size: 2.3em; align-items:left; gap:12px; font-weight:700 }
            .footer { margin-top:18px; font-size:2.1em; color:#333 }
          </style>
        </head>
        <body onload="window.print()">
          <h1 style="margin-top:0">${escapeHtml(invoiceType)} #${escapeHtml(String(invoice.id)).padStart(8, '0')}</h1>

          <div class="meta">
            <div>FECHA: <strong>${escapeHtml(formatDateTime(invoice.createdAt))}</strong></div>
            <div>CUIT: <strong>C${escapeHtml(userCuit)}</strong></div>
            <div>RAZÓN SOCIAL: <strong>${escapeHtml(userCompanyName.toUpperCase())}</strong></div>
            <div>DIRECCIÓN: <strong>${escapeHtml(userAddress.toUpperCase())}</strong></div>
            <div><strong>-----------------------------</strong></div>
            <div>CUIT: <strong>${escapeHtml(clientCuit)}</strong></div>
            <div>RAZÓN SOCIAL: <strong>${escapeHtml(clientCompanyName.toUpperCase())}</strong></div>
            <div>DIRECCIÓN: <strong>${escapeHtml(clientAddress.toUpperCase())}</strong></div>
            <div><strong>-----------------------------</strong></div>
          </div>
            ${itemsHtml}
          <div><strong>-------------------------------------</strong></div>
          <div class="summary">
            ${summary}
          </div>
          <div><strong>-------------------------------------</strong></div>

          <div class="footer">
            ${footer}
          </div>
        </body>
      </html>
    `
  })

  app.use(router.routes()).use(router.allowedMethods())
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}