const express = require('express');

const app = express();

app.use(express.static('files', {
    extensions: ['html']
}));

app.listen(80, function() { console.log('Im listening')});