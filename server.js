const express = require('express');
const sequelize = require('./database');
const authRoutes = require('./routes/auth');
const port = 3000

const app = express();
app.use(express.json);

app.use('/auth', authRoutes);

sequelize.sync().then(() => {
  console.log('Databased synced');
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
});