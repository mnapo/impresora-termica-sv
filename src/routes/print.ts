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
      <table class="items-table" style="width:100%;border-collapse:collapse">
        <tbody>
          ${items.map((it) => {
            const qty = mapQty(it)
            let price = mapPrice(it)
            if (invoice.type==='comprobante'){
              price = price + price * 0.21
            }
            const subtotal = qty * price
            computedTotal += subtotal
            const name = it.name ?? it.description ?? it.productName ?? it.product?.name ?? 'Item'
            return `
              <tr class="item-row">
                <td style="padding:6px;vertical-align:top">
                  ${escapeHtml(name)}
                  ${it.note ? `<div style="font-size:0.85em;color:#666;margin-top:2px">${escapeHtml(String(it.note))}</div>` : ''}
                </td>
                <td style="padding:6px;text-align:right">$${formatNum(price)}</td>
                <td style="padding:6px;text-align:right">${qty}</td>
                <td style="padding:6px;text-align:right">$${formatNum(subtotal)}</td>
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
        <div style="margin-top:10px">¡Gracias por su compra!</div>
        <div><strong>Alias:</strong> ${escapeHtml(userAlias)}</div>
        <div><strong>CBU:</strong> ${escapeHtml(userCbu)}</div>`
    }
    ctx.type = 'html'
    ctx.body = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(invoiceType)} #${escapeHtml(String(invoice.id)).padStart(8, '0')}</title>
          <style>
            @font-face {font-family: "Ticketing"; src: url("https://cdn.glitch.global/7512b28f-8b2c-4a3e-bb02-e10754e44fab/public%2FTicketing.ttf?v=1739215600647") format("truetype") }
            body { font-family: "Ticketing", serif; padding: 1px; color: #222 }
            .meta { margin-bottom: 12px; font-size: 2.6em }
            .meta div { margin-bottom: 4px }
            .items { list-style:none; padding:0; font-size: 2.6em; margin:0; width: 80% }
            .item-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              font-size: 2em;
              border: 0;
              padding: 2px 0;
              gap: 8px;
            }
            .item-name { flex: 2 1 0; font-size: 2.6em; font-weight:600; min-width: 0; }
            .item-price, .item-qty, .item-subtotal {
              flex: 1 1 0;
              text-align: right;
              min-width: 60px;
              font-size: 2.6em;
              word-break: keep-all;
            }
            .item-subtotal { font-weight:600; font-size: 2.6em }
            .summary { margin-top:12px; font-size: 2.3em; align-items:left; gap:12px; font-weight:700 }
            .footer { margin-top:18px; font-size:2.1em; color:#333 }
          </style>
        </head>
        <body onload="window.print()">
          <h3 style="margin-top:0">${escapeHtml(invoiceType)} #${escapeHtml(String(invoice.id))}</h3>

          <div class="meta">
            <div><strong>FECHA:</strong> ${escapeHtml(formatDateTime(invoice.createdAt))}</div>
            <div><strong>CUIT:</strong> ${escapeHtml(userCuit)}</div>
            <div><strong>RAZÓN SOCIAL:</strong> ${escapeHtml(userCompanyName.toUpperCase())}</div>
            <div><strong>DIRECCIÓN:</strong> ${escapeHtml(userAddress.toUpperCase())}</div>
            <div><strong>-----------------------------</strong></div>
            <div><strong>CUIT:</strong> ${escapeHtml(clientCuit)}</div>
            <div><strong>RAZÓN SOCIAL:</strong> ${escapeHtml(clientCompanyName.toUpperCase())}</div>
            <div><strong>DIRECCIÓN:</strong> ${escapeHtml(clientAddress.toUpperCase())}</div>
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