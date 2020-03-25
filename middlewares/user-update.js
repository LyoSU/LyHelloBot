module.exports = async (ctx, next) => {
  if (!ctx.from) return next()
  let user = await ctx.db.User.findOne({ telegram_id: ctx.from.id })

  const now = Math.floor(new Date().getTime() / 1000)

  if (!user) {
    user = new ctx.db.User()
    user.telegram_id = ctx.from.id
    user.first_act = now
  }
  user.first_name = ctx.from.first_name
  user.last_name = ctx.from.last_name
  user.full_name = `${ctx.from.first_name}${ctx.from.last_name ? ` ${ctx.from.last_name}` : ''}`
  user.username = ctx.from.username
  user.language_code = ctx.from.language_code
  user.updatedAt = new Date()
  ctx.session.user = user

  if (ctx.session.user.settings.locale) ctx.i18n.locale(ctx.session.user.settings.locale)

  return next(ctx).then(async () => {
    await ctx.session.user.save()
  })
}
