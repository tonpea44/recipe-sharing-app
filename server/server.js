
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

let users = [];
let recipes = [];
let reviews = [];

let userIdCounter = 1;
let recipeIdCounter = 1;
let reviewIdCounter = 1;

app.post('/register', (req, res) => {
    const { name } = req.body;
    const user = { id: userIdCounter++, name };
    users.push(user);
    res.json(user);
});

app.post('/recipe', (req, res) => {
    const { userId, title, content, image, category } = req.body;
    const recipe = { id: recipeIdCounter++, title, content, image, category, userId };
    recipes.push(recipe);
    res.json(recipe);
});

app.post('/review', (req, res) => {
    const { userId, recipeId, rating, comment } = req.body;
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.userId === userId)
        return res.status(403).json({ error: 'You cannot review your own recipe' });
    const existing = reviews.find(r => r.userId === userId && r.recipeId === recipeId);
    if (existing)
        return res.status(400).json({ error: 'You have already reviewed this recipe' });
    const review = { id: reviewIdCounter++, userId, recipeId, rating, comment };
    reviews.push(review);
    res.json(review);
});

app.get('/recipes', (req, res) => {
    const result = recipes.map(recipe => {
        const recipeReviews = reviews.filter(r => r.recipeId === recipe.id);
        const averageRating = recipeReviews.length
            ? recipeReviews.reduce((sum, r) => sum + r.rating, 0) / recipeReviews.length
            : 0;
        return {
            ...recipe,
            reviews: recipeReviews,
            averageRating
        };
    });
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
