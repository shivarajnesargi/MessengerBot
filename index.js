const PORT =9090;

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

const token = "YOUR_FACEBOOK_ACCESS_TOKEN"

app.set('port',process.env.PORT||PORT);

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.get('/',function(req,res){
	res.send("Hello World! I'm a chat bot");
});

app.get('/webhook/',function(req,res)
{
	console.log("The request for webhook is"+req);
	if(req.query['hub.verify_token']==process.env.VERIFICATION_TOKEN)
	{
		res.send(req.query['hub.challenge']);
	}
	res.send('Error,wrong token');	
});

app.listen(app.get('port'),function(){
	console.log('Listening on port' +PORT);
});

app.post('/webhook/',function(req,res){
	var messaging_events = req.body.entry[0].messaging;
	console.log("The messaging_events is: "+messaging_events);
	for(var i=0;i<messaging_events.length;i++)
	{
		var event = req.body.entry[0].messaging[i];
		var sender = event.sender.id;
		if(event.message && event.message.text)
		{
			var text = event.message.text;
			if(text=='generic')
			{
				sendGenericMessage(sender);
				continue;
			}	
			sendTextMessage(sender,"Text receive,echo: "+text.substring(0,200));
		}	
	}
	res.sendStatus(200);	
});

function sendTextMessage(sender,text)
{
	var messageData ={text:text};
	request(
	{
		url:'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method:'POST',
		json:{
			recipient:{id:sender},
			message:messageData,

		},function(error,response,body)
		{
			if(error)
			{
				console.log('Error sending messages'+error);
			}
			else if(response.body.error)
			{
				console.log('Error:'+response.body.error);
			}	
		}
	});
}

function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Pushup",
                    "subtitle": "Perform 40 pushups",
                    "image_url": "http://vignette4.wikia.nocookie.net/parkour/images/e/e0/Push_Up.jpg/revision/latest?cb=20141122161108",
                    "buttons": [{
                        "type": "web_url",
                        "url": "http://www.bodybuilding.com/exercises/detail/view/name/pushups",
                        "title": "Exercise Video"
                    }],
                }, {
                    "title": "Benchpress",
                    "subtitle": "Perform 20 reps of benchpress",
                    "image_url": "http://www.bodybuilding.com/exercises/exerciseImages/sequences/360/Male/m/360_1.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "http://www.bodybuilding.com/exercises/detail/view/name/pushups",
                        "title": "Excercise Video"
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}