import 'app-module-path/register';
import 'dotenv/config';

import Queue from 'lib/Queue';

Queue.processQueue();
