import { Op } from 'sequelize';
import SubscriptionMail from 'app/jobs/SubscriptionMail';
import Queue from 'lib/Queue';
import Subscription from 'app/models/Subscription';
import Meetup from 'app/models/Meetup';
import User from 'app/models/User';
import File from 'app/models/File';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
          include: [
            User,
            {
              model: File,
              as: 'file',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
      order: [[Meetup, 'date']],
    });
    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup_id = req.body.meetupId;
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(meetup_id, { include: [User] });
    const user = await User.findByPk(req.userId);

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup does not exist' });
    }

    if (user_id === meetup.user_id) {
      return res
        .status(401)
        .json({ error: 'You can not subscribe to your own meetup' });
    }

    if (meetup.past) {
      return res
        .status(401)
        .json({ error: 'You can not subscribe to past meetups' });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res.status(400).json({
        error: 'Already subscribed to a meetup at the same date and time',
      });
    }

    const subscription = await Subscription.create({
      meetup_id,
      user_id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    const subscription = await Subscription.findByPk(req.params.id);

    await subscription.destroy();

    return res.send();
  }
}

export default new SubscriptionController();
