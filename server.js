const express = require('express');
const app = express();
const port = 80;

app.get('/', (req, res) => {
	res.send('Hello juan and lucas!');

});

app.listen(port, () => {
	console.log(`Server running  at http://localhost:${port}`);
});

//Esto es un comentario
