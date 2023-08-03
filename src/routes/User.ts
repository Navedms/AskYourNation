import express, { Request, Response } from 'express';
const router = express.Router();

import User, { IUserModel } from '../models/User';
import { auth } from '../middleware/auth';

// POST (Register and Login Admin and User)

router.post('/', async (req: Request, res: Response) => {
  // check if email already register (User)...
  const loginUser = await User.findOne({ email: req.body.email });

  if (!loginUser) {
    // register new admin
    const user = new User(req.body);
    const doc = await user.save();

    // register new user and... login!
    doc.generateToken((err, user) => {
      if (err) return res.status(400).send(err);
      res.cookie('auth', user.token).json({
        register: true,
        token: user.token,
        id: user._id,
      });
    });
  } else {
    // else compare passwords and make a login
    loginUser.comparePassword(req.body.password, (err, isMatch) => {
      if (err) throw err;
      // if NOT send an Error
      if (!isMatch)
        return res.status(400).json({
          error: 'The password is incorrect',
        });
      // if passwords is match.... login!
      loginUser.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie('auth', user.token).send(user.token);
      });
    });
  }
});
// GET AND UPDATE (User personal profile)

// GET (User profile)

// router.get('/', auth, (req: any, res: Response) => {
//   res.json({
//     id: req.user._id,
//     email: req.user.email,
//     firstName: req.user.firstName,
//     lastName: req.user.lastName,
//     nation: req.user.nation,
//     active: req.user.active,
//     points: req.user.points,
//     postQuestions: req.user.postQuestions,
//     answeredQuestions: req.user.answeredQuestions,
//     token: req.user.token,
//   });
// });

router.get('/', (req: any, res: Response) => {
  res.json({
    id: 'hello!',
  });
});

// UPDATE (User update profile)

// router.patch('/update', auth, async (req: any, res: Response) => {
//   const profile: any = {
//     id: req.body.id,
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//     companyName: req.body.companyName,
//   };
//   if (req.images !== undefined && req.images.length > 0) {
//     profile.logoImg = req.images;
//     profile.images = req.images.map((fileName: string) => ({
//       fileName: fileName,
//     }));
//   }
//   if (req.body.deletlogoImg) {
//     profile.logoImg = '';
//   }
//   User.findByIdAndUpdate(req.body.id, profile, (err, doc) => {
//     if (err) return res.status(400).send(err);
//     if (!doc) {
//       return res.status(400).json({
//         error: translate('errors.user.update'),
//       });
//     }
//     res.json({
//       success: true,
//       msg: translate('success.user.update'),
//     });
//   });
// });

// // RESET PASSWORD (User reset password)

// router.post('/reset-password', auth, async (req: Request, res: Response) => {
//   User.findById(req.body.id, (err: Error, loginUser: UserModel) => {
//     if (err) throw err;
//     if (!loginUser) {
//       return res.status(400).json({
//         error: translate('errors.user.notExist'),
//       });
//     } else {
//       // else compare passwords and make a login
//       loginUser.comparePassword(req.body.oldPassword, (err: Error, isMatch) => {
//         if (err) throw err;
//         // if NOT send an Error
//         if (!isMatch)
//           return res.status(400).json({
//             error: translate('errors.user.password'),
//           });
//         // if passwords is match.... change it!
//         loginUser.password = req.body.newPassword;

//         loginUser.save((err, doc) => {
//           if (err) return res.status(400).send(err);
//           res.json({
//             success: true,
//             msg: translate('success.user.password.change'),
//           });
//         });
//       });
//     }
//   });
// });

export default router;
