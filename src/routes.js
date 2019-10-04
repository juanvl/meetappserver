import { Router } from 'express';
import multer from 'multer';
import multerConfig from 'config/multer';
import UserController from 'app/controllers/UserController';
import SessionController from 'app/controllers/SessionController';
import FileController from 'app/controllers/FileController';
import MeetupController from 'app/controllers/MeetupController';
import UserOwnedMeetupsController from 'app/controllers/UserOwnedMeetupsController';
import SubscriptionController from 'app/controllers/SubscriptionController';
import authMiddleware from 'app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/meetups/owned', UserOwnedMeetupsController.index);
routes.get('/meetups/owned/:id', UserOwnedMeetupsController.detail);
routes.put('/meetups/:id', UserOwnedMeetupsController.update);
routes.delete('/meetups/:id', UserOwnedMeetupsController.delete);

routes.get('/meetups', MeetupController.index);
routes.get('/meetups/:id', MeetupController.detail);
routes.post('/meetups', MeetupController.store);

routes.get('/subscriptions', SubscriptionController.index);
routes.post('/meetups/:id/subscriptions', SubscriptionController.store);

export default routes;
