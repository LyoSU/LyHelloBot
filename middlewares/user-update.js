module.exports = async (ctx, next) => {
  if (!ctx.from) return next()
  const oldFrom = ctx.from.id
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
  user.updatedAt = new Date()
  ctx.session.user = user

  ctx.from.id = oldFrom
  return next(ctx).then(async () => {
    await ctx.session.user.save()
  })
}
