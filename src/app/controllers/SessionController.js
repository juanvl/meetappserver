import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import User from 'app/models/User';
import authConfig from 'config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid/Missing data in form' });
    }

    const { email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (!userExists) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    if (!(await userExists.checkPassword(password))) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { id, name } = userExists;

    return res.json({
      user: { id, name, email },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
