import express from 'express';
import moment from 'moment';
import { isLoggedIn, isVerified, isAdmin } from '../middleware';
import User from '../models/user';
import Committee from '../models/committee';

const router = express.Router();

router.post('/committees', isLoggedIn, isAdmin, (req, res) => {
  const {
    committee: {
      title,
      purpose,
      startDate,
      chairman,
      members,
    }, committee,
  } = req.body;
  if (!(title && purpose && startDate && chairman && members)) {
    req.flash('error', 'All fields need to be completed');
    return res.render('newCommittee');
  }
  const newCommittee = new Committee(committee);
  newCommittee.save().then(() => {
    req.flash('success', 'Committee has been created successfully');
  }).catch(() => {
    req.flash('error', 'Something went wrong, contact the system admin');
  });
  return res.redirect('/committees');
});

router.get('/committees', isLoggedIn, async (req, res) => {
  const committees = await Committee.find().populate({
    path: 'chairman',
    select: ['firstname', 'lastname'],
  }).populate({
    path: 'members',
    select: ['firstname', 'lastname'],
  });
  res.render('committees', {
    title: 'CYON | Committees',
    committees,
    moment,
  });
});

router.get('/committees/new', isLoggedIn, isAdmin, async (req, res) => {
  const users = await User.find().sort('firstname lastname');
  res.render('newCommittee', {
    title: 'CYON | Add new committee',
    users,
  });
});

router.get('/committees/:id/edit', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const committee = await Committee.findById(id);
    const users = await User.find().sort('firstname lastname');
    return res.render('editCommittee', { committee, users, moment });
  } catch (err) {
    req.flash('error', 'Committee not found, contact the system admin');
    return res.redirect('/committees');
  }
});

router.get('/committees/:id/delete', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const committee = await Committee.findById(id);
    return res.render('deleteCommittee', { committee });
  } catch (err) {
    req.flash('error', 'Committee not found, contact the system admin');
    return res.redirect('/committees');
  }
});

router.put('/committees/:id/', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { committee } = req.body;
  try {
    await Committee.findByIdAndUpdate(id, committee);
    req.flash('success', 'Committee updated successfully');
    return res.redirect('/committees');
  } catch (err) {
    req.flash('error', 'Committee update failed, contact the system admin');
    return res.redirect(`/committees/${id}/edit`);
  }
});

router.delete('/committees/:id/', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await Committee.findByIdAndDelete(id);
    req.flash('success', 'Committee deleted successfully');
  } catch (err) {
    req.flash('error', 'Could not delete committee, contact the system admin');
  }
  return res.redirect('/committees');
});

export default router;
