var express	= require("express");
var logfmt	= require("logfmt");
var app		= express();
var path	= require('path');

var questions   = require('./questions.js');
var results     = require('./results.js');

app.use(logfmt.requestLogger());

var do404 = function(res) {
	res.send(404, '<h2>404!</h2>Well, this is awkward...');
}

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/(index.html)?', function(req, res) {
	res.render('index.jade', {title: "The Mystery Web Quiz"});
});

app.get(/^\/q(\d+).html$/, function(req, res) {
	var qnum = parseInt(req.params[0]);

	nextpage = "q" + (qnum+1) + ".html";

	if (qnum == 1) {
		var question = questions.pictureQuestions[0];
		question.nextpage = nextpage;
		res.render('pictures.jade', question);
	}
	else if (qnum >= questions.mcStart && 
			 qnum <  questions.mcStart + questions.mc.length) { 

		var question = questions.mc[qnum-questions.mcStart];
		question.nextpage = nextpage;

		res.render("multipleChoice.jade", question);
	}
	else if (qnum == questions.mcStart + questions.mc.length) {
		var question = questions.pictureQuestions[1];
		question.nextpage = "results.html";
		res.render('pictures.jade', question);
	}
	else { 
		do404(res);
	}

});

for (var result in results.results) {
    var url = "/" + result + ".html";

    var path = /\/(.+).html$/;
    app.get(url, function(req, res) {
        var matches = req.path.match(path);
        var name = matches[1];
        results.results[name].img = "imgs/" + name + ".jpg";

        var fullurl = "http://" + req.headers.host + url;

        results.results[name].fburl = 
            "https://www.facebook.com/sharer/sharer.php?u=" + 
            encodeURIComponent(fullurl);

        res.render("results.jade", results.results[name]);
    });
};

app.get("/results.html", function(req, res) {
    var keys = Object.keys(results.results);
    index = Math.floor(Math.random() * keys.length);

    var url = "/" + keys[index] + ".html";
    res.redirect(url);
});

app.use(function(req, res, next){
    do404(res);
});


var port = Number(process.env.PORT || 2727);
app.listen(port, function() {
	console.log("Listening on " + port);
});
