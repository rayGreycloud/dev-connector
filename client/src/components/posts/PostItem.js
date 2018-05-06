import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import { deletePost, addLike, removeLike } from '../../actions/postActions';

class PostItem extends Component {
  onDeleteClick(id) {
    this.props.deletePost(id);
  }

  onAddLikeClick(id) {
    this.props.addLike(id);
  }

  onRemoveLikeClick(id) {
    this.props.removeLike(id);
  }

  findUserLike(likes) {
    const { auth } = this.props;

    return likes.filter(like => like.user === auth.user.id).length > 0;
  }

  render() {
    const { post, auth, showActions } = this.props;

    const thumbIconClass = classnames({
      'fas fa-thumbs-up': true,
      'text-success': this.findUserLike(post.likes),
      'text-secondary': !this.findUserLike(post.likes)
    });

    return (
      <div className="card card-body mb-3">
        <div className="row">
          <div className="col-md-2">
            {/* TODO: create link to author's profile */}
            <img
              className="rounded-circle d-md-block"
              src={post.avatar}
              alt="author avatar"
            />

            <br />
            <p className="text-center">{post.name}</p>
          </div>
          <div className="col-md-10">
            <p className="lead">{post.text}</p>
            {showActions ? (
              <span>
                <button
                  onClick={this.onAddLikeClick.bind(this, post._id)}
                  type="button"
                  className="btn btn-light mr-1"
                >
                  <i className={thumbIconClass} />
                  <span className="badge badge-light">{post.likes.length}</span>
                </button>
                <button
                  onClick={this.onRemoveLikeClick.bind(this, post._id)}
                  type="button"
                  className="btn btn-light mr-1"
                >
                  <i className="text-secondary fas fa-thumbs-down" />
                </button>
                <Link to={`/post/${post._id}`} className="btn btn-info mr-1">
                  Comments
                </Link>
                {post.user === auth.user.id ? (
                  <button
                    type="button"
                    onClick={this.onDeleteClick.bind(this, post._id)}
                    className="btn btn-danger mr-1"
                  >
                    <i className="fas fa-times" />
                  </button>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

PostItem.defaultProps = {
  showActions: true
};

PostItem.propTypes = {
  deletePost: PropTypes.func.isRequired,
  addLike: PropTypes.func.isRequired,
  removeLike: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { deletePost, addLike, removeLike })(
  PostItem
);
