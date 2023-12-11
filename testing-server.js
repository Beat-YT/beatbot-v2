const express = require('express');

const app = express();

// add the Accept-CH to get every header
app.use(function(req, res, next) {
    res.set('Accept-CH', 'DPR, Width, Viewport-Width, Downlink, Save-Data, Sec-CH-UA-Model');
    next();
});

app.post('/report', express.json(), function(req, res) {
    console.log(req.body);
    res.send('Report received');
});

app.use(express.static('files', {
    extensions: ['html']
}));

app.listen(80, function() { console.log('Im listening')});