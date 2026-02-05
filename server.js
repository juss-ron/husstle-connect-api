require('dotenv').config()
const express = require('express');
const sequelize = require('./database');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category')
const port = 3000

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);

sequelize.sync().then(() => {
  console.log('Databased synced');
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
});