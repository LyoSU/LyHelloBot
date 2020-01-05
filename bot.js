const Telegraf = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

;(async () => {
  console.log(await bot.telegram.getMe())
})()

bot.use(async (ctx, next) => {
  ctx.ms = new Date()
  next()
})

bot.use(async (ctx, next) => {
  await next(ctx)

  const ms = new Date() - ctx.ms

  console.log('Response time %sms', ms)
})

bot.start(async (ctx, next) => {
  ctx.reply('Start command')
})

bot.use(async (ctx, next) => {
  await ctx.reply('Any message')
})

bot.catch((err, ctx) => {
  console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err)
})

if (process.env.BOT_DOMAIN) {
  bot.launch({
    webhook: {
      domain: process.env.BOT_DOMAIN,
      hookPath: `/HistoryBot:${process.env.BOT_TOKEN}`,
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
