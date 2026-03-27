
const url = "http://localhost:8080/v1/graphql";
const secret = "myadminsecretkey";

async function introspect() {
  const query = `
    query IntrospectUsers {
      __type(name: "users") {
        fields {
          name
          type {
            name
            kind
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
    console.log(JSON.stringify(json.data.__type.fields, null, 2));
  } catch (err) {
    console.error("Introspection failed:", err.message);
  }
}

introspect();
