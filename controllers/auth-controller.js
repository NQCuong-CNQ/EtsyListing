var dirname = __dirname.slice(0, -11)

module.exports.login = function(req, res){
    res.sendFile(dirname + "public/views/add_tracking_etsy_history.html")
}