const { client } = require("./src/lib/apollo-client");
const { gql } = require("@apollo/client");

const GET_INTERNS = gql`
  query GetInterns {
    interns(limit: 5) {
      id
      user {
        first_name
        last_name
      }
    }
  }
`;

async function main() {
  try {
    const { data } = await client.query({ query: GET_INTERNS });
    console.log(JSON.stringify(data.interns, null, 2));
  } catch (error) {
    console.error("Error fetching interns:", error);
  }
}

main();
