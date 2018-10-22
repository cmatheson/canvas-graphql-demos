import React from "react";
import { Query, gql } from "./canvas-apollo";

let SimpleQueryExample = ({ courseId }) => (
  <Query
    query={gql`
      query CourseOverviewQuery($courseId: ID!) {
        course(id: $courseId) {
          id
          name
          state
          sectionsConnection {
            edges {
              node {
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
      if (error) {
        return <strong>Something went wrong</strong>;
      }
      if (loading) {
        return "...";
      }
      let course = data.course;

      if (!course) return "Not found";

      return (
        <div>
          <h2>{course.name}</h2>
          <p>
            State: <strong>{course.state}</strong>
          </p>
          <div>Sections:</div>
          <ul>
            {course.sectionsConnection.edges.map(edge => (
              <li key={edge.node.id}>{edge.node.name}</li>
            ))}
          </ul>
        </div>
      );
    }}
  </Query>
);

export default SimpleQueryExample;
