const url = 'http://localhost:8080/v1/graphql';
const secret = 'myadminsecretkey';

async function testQuery() {
  const query = `
    query {
      users {
        id
        email
        role
      }
    }
  `;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-hasura-admin-secret': secret,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  if (json.errors) {
    console.error('GQL errors:', json.errors);
  } else {
    console.log('Users found:', json.data.users);
  }
}

testQuery().catch(console.error);
