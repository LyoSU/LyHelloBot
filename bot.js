const fs = require('fs')
const path = require('path')
const Telegraf = require('telegraf')
const Composer = require('telegraf/composer')
const session = require('telegraf/session')
const I18n = require('telegraf-i18n')
const rateLimit = require('telegraf-ratelimit')
const {
  db
} = require('./database')
const {
  stats,
  updateUserDb
} = require('./middlewares')

const bot = new Telegraf(process.env.BOT_TOKEN)

;(async () => {
  console.log(await bot.telegram.getMe())
})()

bot.use(rateLimit({
  window: 500,
  limit: 1
}))

bot.catch(async (error, ctx) => {
  const escapeHTML = str => str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  )

  if (ctx.config) {
    let errorText = `<b>error for ${ctx.updateType}:</b>\n\n<code>${escapeHTML(error.stack)}</code>`
    if (ctx.from && ctx.from.id) errorText = `<a href="tg://user?id=${ctx.from.id}">${ctx.from.id}</a>\n${errorText}`

    await ctx.replyWithHTML(ctx.i18n.t('error.unknown')).catch(() => {})

    await ctx.telegram.sendMessage(ctx.config.mainAdminId, errorText, {
      parse_mode: 'HTML'
    }).catch(() => {})
  }

  console.error(`error for ${ctx.updateType}`, error)
})

bot.use((Composer.optional((ctx) => ctx.chat.type !== 'private', () => {}))) // only private

bot.context.db = db

const i18n = new I18n({
  directory: path.resolve(__dirname, 'locales'),
  defaultLanguage: 'ru',
  defaultLanguageOnMissing: true
})

bot.use(i18n)

bot.use(session({ ttl: 60 * 5 }))

bot.use(updateUserDb)

bot.use(stats)

bot.use((ctx, next) => {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
  ctx.config = config
  if (ctx.callbackQuery) ctx.state.answerCbQuery = []
  return next(ctx).then(() => {
    if (ctx.callbackQuery) return ctx.answerCbQuery(...ctx.state.answerCbQuery)
  })
})

require('./handlers')(bot)

bot.use((ctx) => {
  return ctx.replyWithHTML(ctx.i18n.t('undefined_message'))
})

db.connection.once('open', async () => {
  console.log('Connected to MongoDB')
  if (process.env.BOT_DOMAIN) {
    bot.launch({
      webhook: {
        domain: process.env.BOT_DOMAIN,
        hookPath: `/lyhellobot:${process.env.BOT_TOKEN}`,
        port: process.env.WEBHOOK_PORT || 2200
      }
    }).then(() => {
      console.log('bot start webhook')
    })
  } else {
    bot.launch().then(() => {
      console.log('bot start polling')
    })
  }
})
