import { gqlFetch } from './src/lib/graphql-client.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const data = await gqlFetch(`
      query GetUser($email: String!) {
        users(where: {email: {_eq: $email}}) {
          id
          email
          role
          organization_id
          department_id
        }
      }
    `, { email: 'mansukh.savaliya@silvertouch.com' });
    console.log('User Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

test();
