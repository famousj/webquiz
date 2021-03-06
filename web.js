var express	= require("express");
var logfmt	= require("logfmt");
var app		= express();
var path	= require('path');

var questions   = require('./questions.js');
var results     = require('./results.js');

app.use(logfmt.requestLogger());

app.configure('development', function(){
  app.use(express.errorHandler());
  app.locals.pretty = true;
});

var do404 = function(req, res) {
    res.status(404);
	res.render('404.jade', { url:req.url });
}

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/(index.html)?', function(req, res) {
    var hosturl = "http://" + req.headers.host;
    var bgimg = "imgs/sew-crates.jpg";

    var pageinfo = {
        "title": "The Mystery Web Quiz",
        "url":  hosturl + req.path,
        "bgimg": bgimg,

        "description": "Take this quiz.  When we're done, we'll let you know what quiz you were taking and also what your results are.",
        "fbimg": hosturl + "/" + bgimg,
    };
 
	res.render('index.jade', pageinfo);
});

app.get('/about.html', function(req, res) {
    res.render('about.jade', {title: "About", results: results.results});
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
		question.nextpage = nextpage;
		res.render('pictures.jade', question);
	}
    else if (qnum == questions.mcStart + questions.mc.length + 1) {
        var question = {
            "title": "True or False",
            "questions": questions.trueFalse,
            "nextpage": "results.html",
        };
        
        res.render('trueFalse.jade', question);
    }
	else { 
		do404(req, res);
	}
});

app.get("/tf.html", function(req, res) {

    });


for (var result in results.results) {
    var url = "/" + result + ".html";

    var path = /\/(.+).html$/;
    app.get(url, function(req, res) {
        var matches = req.path.match(path);
        var name = matches[1];

        var host = "http://" + req.headers.host;
        results.results[name].img = host + "/imgs/" + name + ".jpg";
        results.results[name].url = host + req.path;
        results.results[name].fbimg = host + "/imgs/" + name + "_fb.jpg";

        results.results[name].fburl = 
            "https://www.facebook.com/sharer/sharer.php?u=" + 
            encodeURIComponent(host + req.path);
        results.results[name].twurl = "https://twitter.com/intent/tweet?url=" + 
                                      encodeURIComponent(url) + 
                                      "&text=Hammertime";

        
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
    do404(req, res);
});


var port = Number(process.env.PORT || 2727);
app.listen(port, function() {
	console.log("Listening on " + port);
});
