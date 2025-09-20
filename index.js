const express = require('express');
const app = express();
const PORT = 3000;

// Default route
app.get('/', (req, res) => {
    res.send('Hello World from Team Pending Status!');
});

// Your personal route (Exercise 3)
app.get('/bryan', (req, res) => {
    res.send('Hello from Bryan! I love basketball and coding projects.');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
