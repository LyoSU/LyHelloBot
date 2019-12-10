const Telegraf = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

async function main () {
  bot.telegram.sendMessage(66478514, 'Hello from GitHub Actions!')
}

;(async () => {
  await main()
})()

bot.use(async (ctx, next) => {
  await next(ctx)

  const ms = new Date() - ctx.ms

  console.log('Response time %sms', ms)
})

bot.start(async (ctx, next) => {
  ctx.reply('Star from GitHub Actions!')
})

bot.use(async (ctx, next) => {
  ctx.reply('Message')
})

bot.catch((err, ctx) => {
  console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err)
})

bot.launch().then(() => {
  console.log('bot start polling')
})
