const express = require('express');
const User = require('../schemas/usersSchema');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

// 로그인 정보 저장 + 토큰 발급

router.post('/auth/kakao', async (req, res) => {
  console.log(req.body);
  const { email, nickname, userImage } = req.body;

  const existsUsers = await User.findOne({ email: email });
  console.log(existsUsers);
  if (existsUsers) {
    // 이미 해당 이메일이 DB에 있는 경우 DB에 new User로 새로 테이블을 만들어주지 않고 토큰만 보내준다.
    return res.send({
      result: true,
      token: jwt.sign(
        { userId: existsUsers._id.toHexString() },
        JWT_SECRET_KEY,
        {
          expiresIn: '6h',
        }
      ),
    });
  } else {
    const user = await User.create({
      nickname,
      email,
      userImage,
    });
    return res.send({
      result: true,
      token: jwt.sign({ userId: user._id.toHexString() }, JWT_SECRET_KEY, {
        expiresIn: '6h',
      }),
    });
  }
  // await user.save();
});

module.exports = router;
