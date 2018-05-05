import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container">
    <div className="row">
      <div className="col-md-12">
        <h1 className="display-4 text-center">Page Not Found</h1>
        <p className="lead text-center">
          Sorry, the requested page does not exist.
        </p>
        <p className="lead text-center">
          <Link to="/">Go home</Link>
        </p>
      </div>
    </div>
  </div>
);

export default NotFound;
