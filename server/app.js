let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let config = require('./config/key');
let mongoose = require('mongoose');
let { User } = require('./model/User');
let cookieParser = require('cookie-parser');
let { Auth } = require('./middleware/Auth');
let port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(
  config.MONGO_URI,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log('not found mongoDB');
    }
    console.log('was connect MongoDB');
  }
);

app.get('/', (req, res) => {
  res.json({ message: '5000포트 연결 성공!' });
});

app.post('/api/user/up', (req, res) => {
  let newUser = new User(req.body);

  newUser.save((err, userInfo) => {
    if (err) {
      return res.json({ message: 'not found UserSignup', up: false });
    }

    res.json({ message: 'create user Sign up', up: true });
  });
});

app.post('/api/user/in', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({ message: 'not found user Email' });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({ message: 'not found user Password' });
      }
    });

    user.generateToken((err, user) => {
      if (!user) {
        return res.json({ message: 'not found user Token' });
      }

      res
        .cookie('auth', user.token)
        .status(200)
        .json({ message: 'create Login Successfully', login: true });
    });
  });
});

app.get('/api/user/auth', Auth, (req, res) => {
  res.json({
    _id: req.user.id,
    isAdmin: req.user.role === 0 ? true : false,
    email: req.user.email,
    role: req.user.role,
  });
});

app.get('/api/user/out', Auth, (req, res) => {
  User.findOne({ _id: req.user.id }, { token: '' }, (err, user) => {
    if (err) {
      return res.json({ message: ' not found User Logout', out: false });
    }
    res.json({ message: 'was Logout successfully', out: true });
  });
});

app.listen(port, (err) => {
  if (err) {
    console.log('not found 5000port ');
  }
  console.log(`was connect ${port}port`);
});
