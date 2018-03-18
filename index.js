//###################### INCLUDES ###############################
var app = require("express")();
var bodyParser = require("body-parser");
var express = require("express");
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");
var sha1 = require("sha1");
var Chess = require('./chess.min').Chess;

//###################### SETTING ###############################

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

//###################### VARIABLES ###############################

var game = {};

//###################### REQUESTS ###############################

app.get("/", function(req, res){
	res.redirect("/play?id=" + String(sha1(JSON.stringify(req.headers))).substring(0, 15) + "0");
});

app.get("/play", function (req, res) {
	var id = req.query.id;
	var gameID = id.slice(0, -1);

	if(!game.hasOwnProperty(gameID)){
		game[gameID] = new Chess();
	}

	if(id.slice(-1) == "0"){
		res.render("player", {color: "white", status: game[gameID].board()});
	} else {
		res.render("player", {color: "black", status: game[gameID].board()});
	}
});

app.post("/validate", function (req, res) {
	console.log("attempt " + req.body.oldPos.col + req.body.oldPos.row + " " + req.body.newPos.col + req.body.newPos.row);
	var lol = getJsonFromUrl(req.body.gameID, function (params) {
		var move = req.body.oldPos.col + req.body.oldPos.row + req.body.newPos.col + req.body.newPos.row;

		console.log(params["id"]);
		console.log(game[params["id"]].moves());

		var moveResult = game[params["id"]].move(move, {sloppy: true});

		console.log(moveResult);

		if(moveResult){
			res.send({ "valid": true, "data": moveResult});
		} else {
			res.send({ "valid": false, "data": {}});
		}
	});
});

io.on("connection", function(socket){
	console.log("Connection:\t\t" + socket.id);
	socket.on("move", function(data){
		console.log(data);
		io.emit("notify", data);
	});

	socket.on("disconnect", function(){
		console.log("Disconnected:\t\t" + socket.id);
	});
});

http.listen(3000, function(){
	console.log("listening on localhost:3000");
});

//###################### UTILITY FUNCTIONS ###############################

function getJsonFromUrl(params, callback) {
	var result = {};
	params.split("&").forEach(function(part) {
		var item = part.split("=");
		result[item[0]] = decodeURIComponent(item[1]);
	});
	callback(result);
}