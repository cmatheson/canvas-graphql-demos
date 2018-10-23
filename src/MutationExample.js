import React from "react";
import { Mutation, Query, gql } from "./canvas-apollo";
import { Router, Link } from "@reach/router";

let MutationExample = ({ courseId }) => (
  <Query
    query={gql`
      query GroupSetsList($courseId: ID!) {
        course(id: $courseId) {
          id
          name
          groupSetsConnection {
            edges {
              groupSet: node {
                id
                name
              }
            }
          }
        }
      }
    `}
    variables={{ courseId }}
  >
    {({ data, loading, error }) => {
      if (loading) return "...";
      if (error) return "Something went wrong";
      if (!data.course) return "Course not found";

      let course = data.course;
      return (
        <div>
          <h2>Groups in {course.name}</h2>
          <ul>
            {course.groupSetsConnection.edges.map(({ groupSet }) => (
              <li key={groupSet.id}>
                <Link to={groupSet.id}>{groupSet.name}</Link>
              </li>
            ))}
          </ul>

          <Router>
            <GroupSetDetail path=":groupSetId" />
          </Router>
        </div>
      );
    }}
  </Query>
);

const GROUP_SET_DETAIL = gql`
  query groupSetDetail($groupSetId: ID!) {
    groupSet: node(id: $groupSetId) {
      ... on GroupSet {
        id
        name
        groupsConnection {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
`;

let GroupSetDetail = ({ groupSetId }) => (
  <Query query={GROUP_SET_DETAIL} variables={{ groupSetId }}>
    {({ data, loading, error }) => {
      if (loading) return "...";
      if (error) return `Something went wrong: ${error}`;
      if (!data.groupSet) return "not found";

      let groupSet = data.groupSet;

      return (
        <div>
          <h2>{groupSet.name}</h2>
          <ul>
            {groupSet.groupsConnection.edges.map(({ node }) => (
              <li key={node.id}>
                <GroupListItem group={node} />
              </li>
            ))}
          </ul>

          <NewGroupForm groupSet={groupSet} />
        </div>
      );
    }}
  </Query>
);

class GroupListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false
    };
  }

  render() {
    let group = this.props.group;

    return (
      <Mutation
        mutation={gql`
          mutation updateGroup($updatedGroup: UpdateGroupInput!) {
            updateGroup(input: $updatedGroup) {
              group {
                id
                name
              }
            }
          }
        `}
      >
        {(mutate, { loading, error }) => {
          if (this.state.editing) {
            return (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  mutate({
                    variables: {
                      updatedGroup: { id: group.id, name: this.nameInput.value }
                    }
                  });
                  this.setState({ editing: false });
                }}
              >
                <input
                  type="text"
                  defaultValue={group.name}
                  ref={input => {
                    this.nameInput = input;
                  }}
                />{" "}
                <input type="submit" value="Save" />{" "}
                <button
                  onClick={e => {
                    e.preventDefault();
                    this.setState({ editing: false });
                  }}
                >
                  Cancel
                </button>
              </form>
            );
          } else {
            return (
              <div>
                {group.name}{" "}
                {/* this group.id < 0 thing is from a optimistic response we
                are supplying (see the create mutation down below) */}
                {loading || group.id < 0 ? (
                  "..."
                ) : (
                  <button
                    onClick={() => {
                      this.setState({ editing: true });
                    }}
                  >
                    edit
                  </button>
                )}
              </div>
            );
          }
        }}
      </Mutation>
    );
  }
}

class NewGroupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ""
    };
  }

  render() {
    return (
      <Mutation
        mutation={gql`
          mutation createGroupInSet($groupSetId: ID!, $name: String!) {
            createGroupInSet(input: { groupSetId: $groupSetId, name: $name }) {
              group {
                id
                name
              }
            }
          }
        `}
        variables={{ groupSetId: this.props.groupSet.id }}
        // this is an optional attribute that allows us to specify a result to
        // use before the server returns
        optimisticResponse={{
          createGroupInSet: {
            group: {
              __typename: "Group",
              id: new Date() * -1,
              name: this.state.name
            }
          }
        }}
        // We're adding a new group with this mutation, but the mutation
        // doesn't have any information in its response to tell apollo about
        // the new group's relationship to the group set we're displaying on
        // this page we need to either refetch the groupset query, or update
        // Apollo's cache (in this case we'll update the cache
        update={(cache, { data }) => {
          // TODO: check for errors here
          let newGroup = data.createGroupInSet.group;

          // get previous query result
          let groupSetQueryCache = cache.readQuery({
            query: GROUP_SET_DETAIL,
            variables: { groupSetId: this.props.groupSet.id }
          });
          // add new group
          groupSetQueryCache.groupSet.groupsConnection.edges.push({
            __typename: "GroupEdge",
            node: newGroup
          });

          // update the cache (this will re-render anything that depended on
          // this data)
          cache.writeQuery({
            query: GROUP_SET_DETAIL,
            variables: { groupSetId: this.props.groupSet.id },
            data: groupSetQueryCache
          });
        }}
      >
        {(mutate, { loading, error }) => (
          <form
            onSubmit={e => {
              e.preventDefault();
              mutate({ variables: { name: this.state.name } });
              this.setState({ name: "" });
            }}
          >
            <fieldset>
              <legend>Add a new group</legend>
              <p>
                <label>
                  Name:{" "}
                  <input
                    type="text"
                    value={this.state.name}
                    onChange={this.onChange}
                    placeholder="Group Name"
                  />
                </label>
              </p>
              <p>
                <input type="submit" value="Save" />
              </p>
            </fieldset>
          </form>
        )}
      </Mutation>
    );
  }

  onChange = e => {
    this.setState({ name: e.target.value });
  };
}

export default MutationExample;
