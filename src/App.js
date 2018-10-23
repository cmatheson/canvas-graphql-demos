import React, { Component } from "react";
import { Router, Link } from "@reach/router";
import { ApolloProvider, client } from "./canvas-apollo";

// graphql examples
import SimpleQueryExample from "./SimpleQueryExample";
import PaginationExample from "./PaginationExample";
import MutationExample from "./MutationExample";

let Intro = () => <h2>Click a link above to get started.</h2>;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "1"
    };
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <h1>Canvas GraphQL Demos</h1>

        <p>
          <label>
            Querying{" "}
            <input
              type="text"
              value={this.state.id}
              ref={node => (this.input = node)}
              onChange={() => this.setState({ id: this.input.value })}
              placeholder="id"
              style={{ width: "2em" }}
            />{" "}
          </label>
        </p>

        <nav>
          <Link to="query-example">Simple Query</Link> |{" "}
          <Link to="pagination-example">Pagination</Link> |{" "}
          <Link to="mutation-example">Mutation</Link>
        </nav>

        <hr />

        <Router>
          <Intro path="/" />
          <SimpleQueryExample path="query-example" courseId={this.state.id} />
          <PaginationExample
            path="pagination-example"
            courseId={this.state.id}
          />
          <MutationExample path="mutation-example/*" courseId={this.state.id} />
        </Router>
      </ApolloProvider>
    );
  }
}

export default App;
