import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import isEmpty from '../../validation/is-empty';

class ProfileGithub extends Component {
  constructor(props) {
    super(props);
    // TODO: Refactor github repo fetch to backend api service
    this.state = {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      count: 5,
      sort: 'created: asc',
      repos: []
    };
  }

  componentDidMount() {
    const { clientID, clientSecret } = this.state;
    const { username } = this.props;

    if (isEmpty(username)) {
      this.setState({
        repos: null
      });
    } else {
      const { count, sort } = this.state;
      const url = `https://api.github.com/users/${username}/repos?per_page=${count}&sort=${sort}&client_id=${clientID}&client_secret=${clientSecret}`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (this.refs.myRef) {
            this.setState({
              repos: data
            });
          }
        })
        .catch(err => console.log(err));
    }
  }

  render() {
    const { repos } = this.state;
    let repoItems;

    if (repos === null) {
      repoItems = (
        <div className="card card-body">
          <p className="text-info">No GitHub repos found</p>
        </div>
      );
    } else {
      repoItems = repos.map(repo => (
        <div key={repo.id} className="card card-body mb-2">
          <div className="row">
            <div className="col-md-6">
              <h4>
                <Link to={repo.html_url} className="text-info" target="_blank">
                  {repo.name}
                </Link>
              </h4>
              <p>{repo.description}</p>
            </div>
            <div className="col-md-6">
              <span className="badge badge-info mr-1">
                Stars: {repo.stargazers_count}
              </span>
              <span className="badge badge-secondary mr-1">
                Watchers: {repo.watchers_count}
              </span>
              <span className="badge badge-success">
                Forks: {repo.forks_count}
              </span>
            </div>
          </div>
        </div>
      ));
    }

    return (
      <div ref="myRef">
        <hr />
        <h3 className="mb-4">Latest Github Repos</h3>
        {repoItems}
      </div>
    );
  }
}

ProfileGithub.propTypes = {
  username: PropTypes.string.isRequired
};

export default ProfileGithub;
