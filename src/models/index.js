// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Announcement } = initSchema(schema);

export {
  Announcement
};