import React from 'react';
import PropTypes from 'prop-types';
import { Navbar } from 'components';

const MainLayout = ({ children }) => {
  return (
    <React.Fragment>
      <Navbar/>
      <div>{children}</div>
    </React.Fragment>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node
};

export default MainLayout;
 