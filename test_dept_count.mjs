
const url = "http://localhost:8080/v1/graphql";
const secret = "myadminsecretkey";

async function testDeptCount() {
  const query = `
    query GetDeptCounts {
      departments {
        id
        name
        users_aggregate(where: { role: { _eq: "INTERN" } }) {
          aggregate {
            count
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": secret,
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();
    console.log(JSON.stringify(json.data.departments, null, 2));
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

testDeptCount();
