import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider, Query, Mutation } from "react-apollo";

if (process.env.REACT_APP_CANVAS_TOKEN == null) {
  throw new Error(
    "you need to set a canvas api token in $REACT_APP_CANVAS_TOKEN (See README)"
  );
}

const client = new ApolloClient({
  uri: "/api/graphql",
  request: operation => {
    operation.setContext({
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "GraphQL-Metrics": true,
        Authorization: `Bearer ${process.env.REACT_APP_CANVAS_TOKEN}`
      }
    });
  },
  cache: new InMemoryCache({
    addTypename: true,
    dataIdFromObject: object => object.id || null
  })
});

export { client, gql, ApolloProvider, Query, Mutation };
