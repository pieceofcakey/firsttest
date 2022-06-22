const express = require('express');
// const helmet = require('helmet');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connect = require('./schemas');

app.use(cors({ origin: true, credentials: true }));
// app.use(helmet({ contentSecurityPolicy: false }));
connect();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api/comments', require('./routes/commentsRouter.js'));
app.use('/api/posts', require('./routes/postsRouter.js'));
app.use('/api', require('./routes/usersRouter.js'));
app.use('/api', require('./routes/kakaoRouter'));
app.use(express.static('static'));

app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl, ' - ', new Date());
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`listening on 3000`);
});
