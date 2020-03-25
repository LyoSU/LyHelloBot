const fs = require('fs')
const path = require('path')
const Composer = require('telegraf/composer')
const Markup = require('telegraf/markup')
const I18n = require('telegraf-i18n')

const i18n = new I18n({
  directory: path.resolve(__dirname, '../locales'),
  defaultLanguage: 'ru',
  defaultLanguageOnMissing: true
})

const composer = new Composer()

const main = async (ctx) => {
  const localseFile = fs.readdirSync('./locales/')

  const locales = {}

  localseFile.forEach((fileName) => {
    const localName = fileName.split('.')[0]
    locales[localName] = {
      name: i18n.t(localName, 'language_name')
    }
  })

  if (ctx.updateType === 'callback_query') {
    if (locales[ctx.match[1]]) {
      if (['supergroup', 'group'].includes(ctx.chat.type)) {
        const chatMember = await ctx.tg.getChatMember(
          ctx.callbackQuery.message.chat.id,
          ctx.callbackQuery.from.id
        )

        if (chatMember && ['creator', 'administrator'].includes(chatMember.status)) {
          ctx.answerCbQuery(locales[ctx.match[1]])
          ctx.group.info.settings.locale = ctx.match[1]
          ctx.i18n.locale(ctx.match[1])
        } else {
          ctx.answerCbQuery()
        }
      } else {
        ctx.answerCbQuery(locales[ctx.match[1]].name)
        ctx.session.user.settings.locale = ctx.match[1]
        ctx.i18n.locale(ctx.match[1])
      }
    }
  }

  const button = []

  Object.keys(locales).map((key) => {
    let btnName = locales[key].name
    if (key === ctx.i18n.languageCode) btnName = `✅ ${btnName}`
    button.push(Markup.callbackButton(btnName, `set_language:${key}`))
  })

  const resultText = '🇷🇺 Выберите язык\n🇺🇸 Choose language'

  if (ctx.callbackQuery) {

    await ctx.editMessageText(resultText, {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard(button, {
        columns: 2
      })
    }).catch(() => {})
  } else {
    ctx.replyWithHTML(resultText, {
      reply_markup: Markup.inlineKeyboard(button, {
        columns: 2
      })
    })
  }
}

composer.command('lang', main)
composer.action(/set_language:(.*)/, main)

module.exports = composer
