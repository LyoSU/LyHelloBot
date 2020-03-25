const Composer = require('telegraf/composer')

const composer = new Composer()

composer.start(async (ctx) => {
  ctx.replyWithHTML(ctx.i18n.t('start.info', {
    user: ctx.session.user
  }))
})

module.exports = composer
