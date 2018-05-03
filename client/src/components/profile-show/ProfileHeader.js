import React, { Component } from 'react';
import isEmpty from '../../validation/is-empty';

class ProfileHeader extends Component {
  render() {
    const { profile } = this.props;
    let profileLinks;

    if (isEmpty(profile.social)) {
      profileLinks = '';
    } else {
      const socialProps = Object.keys(profile.social);

      profileLinks = socialProps.map(prop => {
        if (profile.social[prop] !== '') {
          let classnames = `fab fa-${prop} fa-2x`;

          return (
            <a
              key={prop}
              href={profile.social[prop]}
              target="_blank"
              className="text-white p-2"
            >
              <i className={classnames} />
            </a>
          );
        } else {
          return '';
        }
      });
    }

    return (
      <div className="row">
        <div className="col-md-12">
          <div className="card card-body bg-info text-white mb-3">
            <div className="row">
              <div className="col-4 col-md-3 m-auto">
                <img
                  src={profile.user.avatar}
                  alt="User Avatar"
                  className="rounded-circle"
                />
              </div>
            </div>
            <div className="text-center">
              <h1 className="display-4 text-center">{profile.user.name}</h1>
              <p className="lead text-center">
                {profile.status}{' '}
                {isEmpty(profile.company) ? null : (
                  <span>at {profile.company}</span>
                )}
              </p>
              {isEmpty(profile.location) ? null : <p>{profile.location}</p>}
              <p>
                {isEmpty(profile.website) ? null : (
                  <a
                    href={profile.website}
                    target="_blank"
                    className="text-white p-2"
                  >
                    <i className="fas fa-globe fa-2x" />
                  </a>
                )}
                {profileLinks}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProfileHeader;
