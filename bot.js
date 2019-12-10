const Telegraf = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

async function main () {
  bot.telegram.sendMessage(66478514, 'Hello!')
}

;(async () => {
  await main()
})()
