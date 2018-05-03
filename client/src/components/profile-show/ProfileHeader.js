import React, { Component } from 'react';
import isEmpty from '../../validation/is-empty';

class ProfileHeader extends Component {
  render() {
    const { profile } = this.props;
    let socialLinks;

    if (isEmpty(profile.social)) {
      socialLinks = '';
    } else {
      const socialProps = Object.keys(profile.social);

      socialLinks = socialProps.map(prop => {
        if (prop !== '') {
          let classnames = `fab fa-${prop} fa-2x`;

          return (
            <a href={profile.social[prop]} className="text-white p-2">
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
              <p>{socialLinks}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProfileHeader;
