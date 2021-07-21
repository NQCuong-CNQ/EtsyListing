scheduleUpdate()
async function scheduleUpdate() {
  var date = new Date().getTime()
  date = Math.floor(date / 3600000)
  console.log(date % 26)
}