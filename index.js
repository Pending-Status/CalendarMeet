const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World from Team Pending Status!');
});

app.get('/bryan', (req, res) => {
    res.send('Hello from Bryan! I love basketball and coding projects.');
});

app.get('/emily', (req, res) => {
    res.send('Hello, I\'m Emily! I enjoy game development and art.');
});

app.get('/erik', (req, res) => {
    res.send('Hello, my name is Erik. My interests include gaming and cybersecurity.')
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
