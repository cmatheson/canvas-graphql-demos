import React from "react";
import { Query, gql } from "./canvas-apollo";
import update from "immutability-helper";

let PaginationExample = ({ courseId }) => (
  <Query
    query={gql`
      query AssignmentsList($courseId: ID!, $after: String) {
        course(id: $courseId) {
          id
          name
          assignmentsConnection(
            first: 10
            after: $after
            filter: { gradingPeriodId: null }
          ) {
            edges {
              node {
                id
                name
                pointsPossible
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `}
    variables={{
      courseId,
      after: null
    }}
  >
    {({ data, loading, error, fetchMore }) => {
      if (loading) return "...";
      if (error) {
        return "Something went wrong";
      }

      let course = data.course;
      if (!course) return "Not found";

      let assignments = course.assignmentsConnection;

      // fetch next page
      if (assignments.pageInfo.hasNextPage) {
        fetchMore({
          variables: { after: assignments.pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult }) => {
            return update(prev, {
              course: {
                assignmentsConnection: {
                  edges: {
                    $push: fetchMoreResult.course.assignmentsConnection.edges
                  },
                  pageInfo: {
                    $set: fetchMoreResult.course.assignmentsConnection.pageInfo
                  }
                }
              }
            });
          }
        });
      }

      return (
        <div>
          <h2>Assignments in {course.name}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Points Possible</th>
              </tr>
            </thead>
            <tbody>
              {assignments.edges.map(({ node }) => (
                <tr key={node.id}>
                  <td>{node.name}</td>
                  <td>{node.pointsPossible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }}
  </Query>
);

export default PaginationExample;
