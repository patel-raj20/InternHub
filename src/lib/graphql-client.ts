/**
 * Executes a GraphQL query on the Hasura GraphQL Engine.
 */
export async function gqlFetch<T = any>(query: string, variables: any = {}): Promise<T> {

    const url = process.env.HASURA_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql";
    const secret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": secret || "",
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
    });

    const json = await response.json();

    if (json.errors) {
        console.error("GraphQL errors:", json.errors[0].message);
        throw new Error(`GraphQL query failed: ${json.errors[0].message}`);
    }

    return json.data;
}
