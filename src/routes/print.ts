import Router from '@koa/router'
import type { Application } from '../declarations'
import { verify } from 'jsonwebtoken'
import { logger } from '../logger'

export const configurePrintRoute = (app: Application) => {
  const router = new Router()

  router.get('/print', async (ctx) => {
    // 1) Obtener token (query o header)
    let accessToken = ctx.query.access_token as string | undefined
    if (!accessToken) {
      const authHeader = ctx.request.headers.authorization
      if (!authHeader) {
        ctx.throw(401, 'No Authorization header or access_token')
        return
      }
      accessToken = authHeader.replace(/^Bearer\s+/i, '')
    }

    // 2) Autenticar: primero con authenticate(), si falla usar verify() y cargar usuario
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

        const payload: any = verify(accessToken, secret) // lanza si inválido/expirado
        const userId = payload.sub ?? payload.id
        if (!userId) throw new Error('Token payload missing sub/id')

        user = await app.service('users').get(userId)
      } catch (err2) {
        logger.error('Authentication failed for /print:', err2)
        ctx.throw(401, 'Invalid token or unauthorized')
        return
      }
    }

    // 3) invoiceId
    const { invoiceId } = ctx.query
    if (!invoiceId) {
      ctx.throw(400, 'invoiceId is required')
      return
    }

    // 4) Cargar factura (pasando user a hooks)
    const invoice = await app.service('invoices').get(Number(invoiceId), { user })

    // 5) Cargar items: intentamos 'invoice-items' y si no existe probamos 'invoices-items'
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

    // 6) Utilidades: formateo de número y fecha, mapping de campos
    const formatNum = (n: number) =>
      Number.isFinite(n) ? n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'

    const formatDateTime = (val: any) => {
      if (!val) return ''
      const d = typeof val === 'number' ? new Date(val) : new Date(String(val))
      if (Number.isNaN(d.getTime())) return String(val)
      // DD/MM/YYYY HH:mm en locale es-AR
      return d.toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      })
    }

    const mapQty = (it: any) => Number(it.quantity ?? it.qty ?? it.cantidad ?? 1)
    const mapPrice = (it: any) => Number(it.price ?? it.unitPrice ?? it.unit_price ?? it.precio ?? 0)

    // 7) Construir lista plana de items y total
    let computedTotal = 0
    const itemsHtml = items.length
      ? items.map((it) => {
          const qty = mapQty(it)
          const price = mapPrice(it)
          const subtotal = qty * price
          computedTotal += subtotal
          const name = it.name ?? it.description ?? it.productName ?? it.product?.name ?? 'Item'
          // cada item como bloque / fila plana
          return `
            <li style="padding:10px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center">
              <div style="flex:1">
                <div style="font-weight:600">${escapeHtml(name)}</div>
                ${it.note ? `<div style="font-size:0.9em;color:#666;margin-top:4px">${escapeHtml(String(it.note))}</div>` : ''}
              </div>
              <div style="width:120px;text-align:center">${qty}</div>
              <div style="width:120px;text-align:right">$${formatNum(price)}</div>
              <div style="width:120px;text-align:right;font-weight:600">$${formatNum(subtotal)}</div>
            </li>`
        }).join('')
      : '<li style="padding:10px;text-align:center;color:#666">No hay items</li>'

    const totalToShow = invoice.total ?? computedTotal

    const userAlias = user?.alias ?? user?.username ?? user?.name ?? '-'
    const userCbu = user?.cbu ?? user?.bankAccount ?? '-'

    ctx.type = 'html'
    ctx.body = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Factura #${escapeHtml(String(invoice.id))}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #222 }
            h1 { margin: 0 0 8px 0 }
            .meta { margin-bottom: 12px; font-size: 0.95em }
            .meta div { margin-bottom: 4px }
            .items { list-style:none; padding:0; margin:0; border:1px solid #eee; border-radius:6px; overflow:hidden }
            .summary { margin-top:12px; display:flex; justify-content:flex-end; align-items:center; gap:12px; font-weight:700 }
            .footer { margin-top:18px; font-size:0.95em; color:#333 }
          </style>
        </head>
        <body onload="window.print()">
          <h1>Factura #${escapeHtml(String(invoice.id))}</h1>

          <div class="meta">
            <div><strong>Cliente:</strong> ${escapeHtml(String(invoice.companyName))}</div>
            <div><strong>Fecha:</strong> ${escapeHtml(formatDateTime(invoice.createdAt))}</div>
          </div>

          <ul class="items">
            ${itemsHtml}
          </ul>

          <div class="summary">
            <div>Total:</div>
            <div style="min-width:120px;text-align:right">$${formatNum(Number(totalToShow))}</div>
          </div>

          <div class="footer">
            <div><strong>Alias:</strong> ${escapeHtml(userAlias)}</div>
            <div><strong>CBU:</strong> ${escapeHtml(userCbu)}</div>
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