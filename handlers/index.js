const fs = require('fs')

module.exports = (bot) => {
  const handlersFile = fs.readdirSync(__dirname)

  handlersFile.forEach((fileName) => {
    if (fileName !== 'index.js') bot.use(require(`${__dirname}/${fileName}`))
  })
}
