import React from "react";
import { Query, gql } from "./canvas-apollo";
import PropTypes from 'prop-types'
import { propType } from "graphql-anywhere";

let QUERY = gql`
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
`;

let SimpleQueryExample = ({ courseId }) => (
  <Query query={QUERY} variables={{ courseId }}>
    {props => <CourseOverview {...props} />}
  </Query>
);

class CourseOverview extends React.Component {
  render() {
    const { data, loading, error } = this.props;

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
  }
}
CourseOverview.propTypes = {
  course: propType(QUERY)
}

export default SimpleQueryExample;
