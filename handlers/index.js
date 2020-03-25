module.exports = (bot) => {
  const handlers = [
    'start'
  ]

  handlers.forEach((handler) => {
    bot.use(require(`./${handler}`))
  })
}
