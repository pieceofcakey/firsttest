const router = require('express').Router();
const joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { hash, compare } = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middlewares/authMiddleware');
const connect = require('../schemas');
const User = require('../schemas/usersSchema');
connect();

// 이미지 업로드 Multer
const upload = multer({
  dest: 'static/',
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './static');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
    fileFilter: (req, file, cb) => {
      if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype))
        cd(null, true);
      else cd(Error('PNG, jpeg만 업로드 하세요'), false);
    },
    limits: {
      fileSize: 1024 * 1024,
    },
  }),
});

const userSchema = joi.object({
  email: joi.string(),
  nickname: joi.string(),
  password: joi.string(),
  passwordCheck: joi.string(),
});

//회원가입
router.post('/signup', upload.single('userImage'), async (req, res) => {
  try {
    const { email, nickname, password, passwordCheck } =
      await userSchema.validateAsync(req.body);

    if (password !== passwordCheck) {
      return res.status(400).send({
        errormessage: '패스워드가 일치 하지 않습니다',
      });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { nickname }] });
    if (existingUser) {
      return res.status(400).send({
        errormessage: '이미 가입된 이메일 또는 닉네임이 있습니다.',
      });
    }
    const hashedPassword = await new hash(password, 10);
    if (req.file == undefined) {
      const userImage = 'http://3.35.170.203/defaultuserImage1655721219161.png';
      const user = await User.create({
        email,
        nickname,
        hashedPassword,
        userImage,
      });
      res
        .status(200)
        .json({ success: true, message: '회원가입 성공', user, userImage });
    } else {
      const userImage = 'http://3.35.170.203/' + req.file.filename;
      const user = await User.create({
        userImage,
        email,
        nickname,
        hashedPassword,
      });
      res
        .status(200)
        .json({ success: true, message: '회원가입 성공', user, userImage });
    }
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ errormessage: '요청한 데이터 형식이 올바르지 않습니다' });
  }
});

// 로그인 기능
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email });

    const isValid = await compare(password, existingUser.hashedPassword);
    if (!isValid) {
      return res.status(400).send({
        errormessage: '이메일 또는 비밀번호를 확인해주세요',
      });
    }
    const token = jwt.sign(
      { userId: existingUser._id.toHexString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '6h' }
    );
    res.send({ token });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      errormessage: '이메일 또는 비밀번호를 확인해주세요',
    });
  }
});

router.get('/auth', authMiddleware, async (req, res) => {
  try {
    console.log(res.locals);
    const { user } = res.locals;
    res.status(200).send({
      user: {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        userImage: user.userImage,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      errormessage: '사용자 정보를 가져오지 못하였습니다.',
    });
  }
});

module.exports = router;
