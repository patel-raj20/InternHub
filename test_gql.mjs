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
      interns {
        id
        user_id
        organization_id
        college_name
      }
      interns_aggregate {
        aggregate {
          count
        }
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
    console.log('Users found:', json.data.users.length);
    console.log('Interns found:', json.data.interns.length);
    console.log('Total count from aggregate:', json.data.interns_aggregate.aggregate.count);
    console.log('Sample intern organization ID:', json.data.interns[0]?.organization_id);
  }
}

testQuery().catch(console.error);
