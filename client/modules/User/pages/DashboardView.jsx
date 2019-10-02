import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory, Link } from 'react-router';
import { updateSettings, initiateVerification, createApiKey, removeApiKey } from '../actions';
import Nav from '../../../components/Nav';
import Overlay from '../../App/components/Overlay';

import AssetList from '../../IDE/components/AssetList';
import CollectionList from '../../IDE/components/CollectionList';
import SketchList from '../../IDE/components/SketchList';
import Searchbar from '../../IDE/components/Searchbar';

import CollectionCreate from '../components/CollectionCreate';
import DashboardTabSwitcher, { TabKey } from '../components/DashboardTabSwitcher';

class DashboardView extends React.Component {
  static defaultProps = {
    user: null,
  };

  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  componentDidMount() {
    document.body.className = this.props.theme;
  }

  closeAccountPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  selectedTabKey() {
    const path = this.props.location.pathname;

    if (/assets/.test(path)) {
      return TabKey.assets;
    } else if (/collections/.test(path)) {
      return TabKey.collections;
    }

    return TabKey.sketches;
  }

  ownerName() {
    if (this.props.params.username) {
      return this.props.params.username;
    }

    return this.props.user.username;
  }

  isOwner() {
    return this.props.user.username === this.props.params.username;
  }

  isCollectionCreate() {
    const path = this.props.location.pathname;
    return /collections\/create$/.test(path);
  }

  returnToDashboard = () => {
    browserHistory.push(`/${this.ownerName()}/collections`);
  }

  renderActionButton(tabKey, username) {
    if (!this.isOwner()) {
      return null;
    }

    switch (tabKey) {
      case TabKey.assets:
        return null;
      case TabKey.collections:
        return <Link className="dashboard__action-button" to={`/${username}/collections/create`}>Create collection</Link>;
      case TabKey.sketches:
      default:
        return <Link className="dashboard__action-button" to="/">New sketch</Link>;
    }
  }

  renderContent(tabKey, username) {
    switch (tabKey) {
      case TabKey.assets:
        return <AssetList username={username} />;
      case TabKey.collections:
        return <CollectionList username={username} />;
      case TabKey.sketches:
      default:
        return <SketchList username={username} />;
    }
  }

  render() {
    const currentTab = this.selectedTabKey();
    const isOwner = this.isOwner();
    const { username } = this.props.params;

    return (
      <div className="dashboard">
        <Nav layout="dashboard" />

        <section className="dashboard-header">
          <div className="dashboard-header__header">
            <h2 className="dashboard-header__header__title">{this.ownerName()}</h2>
            <div className="dashboard-header__actions">
              <DashboardTabSwitcher currentTab={currentTab} isOwner={isOwner} username={username} />
              {currentTab === TabKey.sketches && <Searchbar />}
              {this.renderActionButton(currentTab, username)}
            </div>
          </div>

          <div className="dashboard-content">
            {this.renderContent(currentTab, username)}
          </div>
        </section>
        {this.isCollectionCreate() &&
          <Overlay
            title="Create collection"
            closeOverlay={this.returnToDashboard}
          >
            <CollectionCreate />
          </Overlay>
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    previousPath: state.ide.previousPath,
    user: state.user,
    theme: state.preferences.theme
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateSettings, initiateVerification, createApiKey, removeApiKey
  }, dispatch);
}

DashboardView.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  params: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
  previousPath: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardView);
