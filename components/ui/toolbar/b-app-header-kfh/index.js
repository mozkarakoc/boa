import React from 'react';
import PropTypes from 'prop-types';
import { BLocalization } from 'b-localization';
import cloneDeep from 'lodash/cloneDeep';
import { BDialogHelper } from 'b-dialog-box';
import { BComponent, BComponentComposer } from 'b-component';
import { BTabBar } from 'b-tab-bar';
import { BMenuHelper } from 'b-main-menu';
import { BPageHost } from 'b-page-host';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { BInputSearch } from 'b-input-search';
import  BUserProfile  from './appbar';
import { BAvatar } from 'b-avatar';
import { BButton } from 'b-button';
import { BMenuItem } from 'b-menu-item';
import List from '@material-ui/core/List';
import { BPopover } from 'b-popover';
import { BDivider } from 'b-divider';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import { BListItem } from 'b-list-item';

var DoubleChevronRight = require('b-icon').Actions.DoubleChevronRight;
var DoubleChevronLeft = require('b-icon').Actions.DoubleChevronLeft;
var KFHLogoWhite = require('b-icon').Logos.KFHLogoWhite;
var User = require('b-icon').Others.User;

const styles = {
  root: {
    width: '100%',
    maxWidth: '100%',
    right: 12,
  },
  iconRoot: { fontSize: '20px' }
};

@BComponentComposer
@withStyles(styles)
export class BAppHeaderKFH extends BComponent {
  static propTypes = {
    ...BComponent.propTypes,
    onTitleTouchTap: PropTypes.func,
    showMenuIconButton: PropTypes.bool,
    title: PropTypes.node,
    zDepth: PropTypes.oneOf([0, 1, 2, 3, 4, 5]),
    tabItems: PropTypes.array,
    initialSelectedIndex: PropTypes.number,
    searchDataSource: PropTypes.array,
    profilePicture: PropTypes.string,
    searchBarHintText: PropTypes.string,
    onTabItemChanged: PropTypes.func,
    onNewTabOpened: PropTypes.func,
    onEditProfile: PropTypes.func,
    onLogOut: PropTypes.func,
    onMenuDataAcquired: PropTypes.func,
    tabValue: PropTypes.any,
    resourceList: PropTypes.any,
    searchBarVisible: PropTypes.bool,
    classes: PropTypes.object.isRequired
  };

  static defaultProps = {
    ...BComponent.defaultProps,
    zDepth: 0,
    searchBarVisible: false
  };

  state = {
    userArrowDisplay: 'none',
  };

  constructor(props, context) {
    super(props, context);
 
    this.organizeState = this.organizeState.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onTabItemChanged = this.onTabItemChanged.bind(this);
    this.organizeState(props);
    this.leftContent = null;
    this.uniqueIncrement = 0;
    this.fullscreen = false;
    this.formStyle = { position: 'relative', left: 0, right: 0, top: (this.props.context.deviceSize >= BComponent.Sizes.MEDIUM) ? 112 : 104, bottom: 0 };
    this.resourceList = BMenuHelper.convertResourceMenu(this.props.resourceList);
    this.setFormStyle();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.context.localization.isRightToLeft != this.props.context.localization.isRightToLeft) {
      if (this.props.context.localization.isRightToLeft) {
        this.leftDrawerWidth = this.props.rightDrawerWidth;
        this.rightDrawerWidth = this.props.leftDrawerWidth;
      }
      else {
        this.leftDrawerWidth = this.props.leftDrawerWidth;
        this.rightDrawerWidth = this.props.rightDrawerWidth;
      }
    }
    var willBeRender = false;
    if (nextProps.context.language != this.props.context.language) {
      this.resourceList = [];
      this.resetSearchValue();
    }
    
    if (nextProps.children != this.props.children) {
      this.childContainer.getInstance().changePage(nextProps.children);
    }
    willBeRender && this.updateChildStyle();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.context !== this.props.context || this.state !== nextState || this.props !== nextProps);
  }

  componentDidMount() {
    
  }

  setFormStyle() {
    if (this.props.context.deviceSize <= BComponent.Sizes.SMALL) { // mobil görünümü
      this.formStyle.left = '0px';
      this.formStyle.right = '0px';
      this.leftDocked = false;
      this.rightDocked = false;
      this.openleft = false;
      this.openright = false;
    } else if (this.props.context.deviceSize <= BComponent.Sizes.MEDIUM) { // tablet görünümü
      if (!this.props.context.localization.isRightToLeft) {
        this.formStyle.left = '0px';
        this.formStyle.right = this.rightDrawerWidth + 'px';
        this.leftDocked = false;
        this.openleft = false;
      }
      else {
        this.formStyle.left = this.leftDrawerWidth + 'px';
        this.formStyle.right = '0px';
        this.rightDocked = false;
        this.openright = false;
      }
    }
    else {
      this.formStyle.left = this.leftDrawerWidth + 'px';
      this.formStyle.right = this.rightDrawerWidth + 'px';
    }
  }

  updateLeftDocked(value, isRender) {
    this.leftDocked = value;
    this.leftDrawer.getInstance().dockDrawer(value);
    isRender && this.updateChildStyle();
  }


  updateChildStyle() {
    if (this.leftDocked && this.openleft) {
      this.formStyle.left = this.leftDrawerWidth + 'px';
    }
    else {
      this.formStyle.left = '0px';
    }
    if (this.rightDocked && this.openright) {
      this.formStyle.right = this.rightDrawerWidth + 'px';
    }
    else {
      this.formStyle.right = '0px';
    }
    this.childContainer.getInstance().changeStyle(this.formStyle);
  }

  organizeState(newProps) {
    this.initialSelectedIndex = newProps.initialSelectedIndex;
    this.tabValue = newProps.tabValue;
    this.tabItems = newProps.tabItems;
    this.searchDataSource = null;
  }


  onCloseMobileTabClick(value) {
    // this.props.onRightIconClick && this.props.onRightIconClick(value);
    this.props.onRightIconClick ? this.props.onRightIconClick(value) : window.dispatchEvent(new CustomEvent('pageclose', { bubbles: true, cancelable: true, detail: { value: value } }));
  }

  handleTabItemChange(value) {
    var selectedTab =
      this.props.tabItems.filter(
        (tabItem) => {
          return tabItem.value == value;
        }
      );
    this.props.onTabItemChanged && this.props.onTabItemChanged(selectedTab[0].pageValue, selectedTab[0].pageId);
    BDialogHelper.close(this.props.context, BComponent.DialogResponse.NONE);
  }

  render() {
    const { isRightToLeft } = this.props.context.localization;

    this.debugLog('BAppBar Render Invoke');
    let boaPalette = this.props.context.theme.boaPalette;
    let tabs;
    if (this.props.context.deviceSize >= BComponent.Sizes.MEDIUM) {
      tabs = (
        <BTabBar
          ref={(item) => { this.tabsRoot = item; }}
          context={this.props.context}
          containerType={'default'}
          tabItems={this.props.tabItems}
          value={this.props.tabValue}
          onChange={this.onTabItemChanged}
          isContentDisabled={true}
          centered={false}
          scrollable={false}
          scrollButtons="auto"
          rightIconButtonVisibility={false}
          closeIcon ={false}
          style={{
            marginLeft: '20px',
            float: !this.props.context.localization.isRightToLeft ? 'left' : 'right'
          }} />);
    } else {
      let tabContents = this.props.tabItems.map((item, i) => {
        var style = {};
        if (this.props.tabValue !== item.value) {
          style = { height: 0, overflow: 'hidden' };
        }
        style = Object.assign({}, this.props.tabTemplateStyle, style);
        return <div key={i} style={style}>{item.content}</div>;
      });
      let tValue = this.props.tabValue == undefined ? 0 : this.props.tabValue;
      let selectedTab = this.props.tabItems.find((tab) => { return tab.value == tValue; });
      if (selectedTab == undefined) {
        selectedTab = this.props.tabItems[0];
        tValue = 0;
      }
      let moreIcon = isRightToLeft ? <DoubleChevronLeft /> : <DoubleChevronRight />;
      let moreIconVisibilty = this.props.tabItems && this.props.tabItems.length > 1 ? 'visible' : 'hidden';

 
      let rightButton = <BButton context={this.props.context}
            type="icon"
            style={{ verticalAlign: 'middle', visibility: moreIconVisibilty }}
            icon={moreIcon}
            iconProperties={{ nativeColor: boaPalette.comp500 }}
            onClick={this.showMobileTabMenu.bind(this)} />;

      tabs = (
        <div>
          <div style={{ width: '100%', float: 'left', height: '48px', position: 'absolute', backgroundColor: boaPalette.pri500 }}>
            
            <div style={{ float: 'right' }}>
              {rightButton}
            </div>
            <div style={{ width: 'calc(100% - 96px)', height: '48px', display: 'grid', verticalAlign: 'middle', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ display: '-webkit-box', webkitLineClamp: '2', webkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                {BLocalization.stringUpperCase(selectedTab.text)}
              </div>
            </div>
          </div>
          <div style={{ left: '0px', right: '0px', top: '104px', bottom: '0px', overflowY: 'scroll' }}>
            {tabContents}
          </div>
        </div>
      );
    }
  

    this._logo = <div style={{ float: !this.props.context.localization.isRightToLeft ? 'left' : 'right', paddingLeft: !this.props.context.localization.isRightToLeft ? '12px' : '0px', paddingRight: !this.props.context.localization.isRightToLeft ? '0px' : '12px', paddingTop: '0px' }}>
      <KFHLogoWhite context={this.props.context} style={{ width: '200px', height: 50, fill: 'white' }} />
    </div>;

    this._searchBarVisible = (this.props.searchBarVisible ? 'visible' : 'hidden');

    this.getToolbar(this.props.context);

    if (this.props.context.deviceSize >= BComponent.Sizes.MEDIUM) {
      this.toolBarContent = this.renderDesktopToolBar();
    }
    else {
      this.toolBarContent = this.renderMobileToolBar();
    }


    let toolbarStyle = { zIndex: 1, paddingLeft: '12px', paddingRight: '12px' };
    (this.props.context.deviceSize <= BComponent.Sizes.SMALL) ? toolbarStyle = Object.assign({}, toolbarStyle, { paddingLeft: '4px', paddingRight: '4px' }) : null;

    let tabDivStyle = (this.props.context.deviceSize <= BComponent.Sizes.SMALL) ? null : { marginRight: 24 };

    return (
      <div>
       
        <AppBar style={{ boxShadow: 'none' }}>
          <Toolbar style={toolbarStyle}>
            {this.toolBarContent}
          </Toolbar>
          <div style={tabDivStyle}>
            {tabs}
          </div>
        </AppBar>
        
        <BPageHost
          ref={(item) => { this.childContainer = item; }}
          context={this.props.context}
          content={this.props.children}
          style={this.formStyle} />
      </div>
    );
  }

  showMobileTabMenu() {
    let popoverTabs = [];

    for (let index = 0; index < this.props.tabItems.length; index++) {
      const item = this.props.tabItems[index];
      let contentMenu = (
        <div>
          <div style={{ display: 'flex', height: '48px', alignItems: 'center', paddingLeft: '16px' }}>{BLocalization.stringUpperCase(item.text)}</div>
        </div>
      );
      popoverTabs.push(<BListItem key={item.value} context={this.props.context}
        primaryText={contentMenu} style={{ padding: 0 }}
        onClick={this.handleTabItemChange.bind(this, item.value)} />);
    }

    let tabsMenu = <div style={{ overflowY: 'scroll' }}>{popoverTabs}</div>;

    BDialogHelper.show(this.props.context, tabsMenu,
      BComponent.DialogType.SUCCESS,
      BComponent.DialogResponseStyle.OK, null, null, { padding: '0px', maxHeight: 'fit-content', borderRadius: '2px', overflow: 'auto', width: 'calc(100vw - 16px)', height: 'calc(100% - 16px)' }, null, null, false);
  }


  onMenuItemSelected(menuItem) {
  
    this.openNewTabPage(menuItem);
  }

  onItemClick(menuItem) {
    this.openNewTabPage(menuItem.suggestion);
  }

  onTabItemChanged(event, menuItemProps) {

    var selectedTab =
      this.props.tabItems.filter(
        (tabItem) => {
          return tabItem.value == menuItemProps;
        }
      );

    this.props.onTabItemChanged && this.props.onTabItemChanged(selectedTab[0].pageValue, selectedTab[0].pageId);
  }

  openNewTabPage(menuItem, data = null, showAsNewPage = false, menuItemSuffix = null) {
    this.debugLog('Acılmaya calısılan menuItem:');
    this.debugLog(menuItem);
    var tabs: Object[] = this.tabItems;
    if (showAsNewPage || menuItemSuffix) {
      menuItem = cloneDeep(menuItem); // tabItem value'larının farklı olması gerektiğinden clone'landı.
    }

    menuItem.pageId = this.getPageId();
    var newTab = {
      text: menuItem.allProperties.name,
      pageValue: menuItem.allProperties,
      value: menuItem.pageId,
      pageId: menuItem.pageId
    };

    if (menuItemSuffix) {
      newTab.text = newTab.text + ' - ' + menuItemSuffix;
    }

    if (!showAsNewPage && tabs.filter(function (element) {
      return element.pageValue.resourceCode == newTab.pageValue.resourceCode && element.pageValue.name == newTab.pageValue.name;
    }).length == 1) {
      for (var i: number = 0; i < tabs.length; ++i) {
        if (tabs[i].pageValue.resourceCode == newTab.pageValue.resourceCode && tabs[i].pageValue.resourceCode == newTab.pageValue.resourceCode) {
          menuItem.allProperties = tabs[i].pageValue;
          this.tabValue = menuItem.allProperties;
          menuItem.pageId = tabs[i].pageId;
          // this.tabsRoot.getInstance().updateBTabBarDynamic(tabs, menuItem.allProperties);
          this.props.onTabItemChanged && this.props.onTabItemChanged(menuItem.allProperties, menuItem.pageId, menuItem.allProperties);
        }
      }
    }
    else if (showAsNewPage || tabs.filter(function (element) {
      return element.value == newTab.value;
    }).length == 0) {
      this.debugLog('Acıldı.');
      tabs.push(newTab);
      this.tabValue = newTab.value;
      // this.tabsRoot.getInstance().updateBTabBarDynamic(tabs, newTab.value);
      this.props.onNewTabOpened && this.props.onNewTabOpened(menuItem, menuItem.pageId, data);
    }
    else {
      this.tabValue = newTab.value;
      // this.tabsRoot.getInstance().updateBTabBarDynamic(tabs, newTab.value);
      this.props.onTabItemChanged && this.props.onTabItemChanged(menuItem.allProperties, newTab.pageId, newTab.pageValue);
    }
  }

  getPageId() {
    this.uniqueIncrement = this.uniqueIncrement + 1;
    return this.uniqueIncrement;
  }

  onMenuDataAcquired(menuItems) {
    this.debugLog('Tüm Menü');
    this.debugLog(menuItems);
    this.updateSearchDataSource(menuItems, true);
    if (this.props.onMenuDataAcquired) {
      this.props.onMenuDataAcquired(menuItems);
    }
  }

  updateSearchDataSource(searchDataSource) {
    this.inputSearch && this.inputSearch.getInstance().updateSearchDataSource(searchDataSource, true);
    this.favoriteMenu && this.favoriteMenu.getInstance().updateDataSource(searchDataSource);
  }

  updateOnlySearchDataSource(searchDataSource) {
    this.inputSearch && this.inputSearch.getInstance().updateSearchDataSource(searchDataSource, false);
  }

  timer = null;

  disappearPopoverArrow() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({
        userArrowDisplay: 'none',
        favoritesArrowDisplay: 'none',
      });
    }, 50);
  }

  getToolbar(context) {

    let picture = null;
    if (this.props.context.applicationContext &&
      this.props.context.applicationContext.login &&
      this.props.context.applicationContext.login.customerInformation &&
      this.props.context.applicationContext.login.customerInformation.picture) {
      picture = 'data:image/png;base64,' + this.props.context.applicationContext.login.customerInformation.picture;
    }

    const iconUserStyle = {
      float: !this.props.context.localization.isRightToLeft ? 'right' : 'left',
      cursor: 'pointer',
      // padding: '6px 7px'
    };

    if (context.deviceSize >= BComponent.Sizes.MEDIUM) {
      this._userElement =
        (<div style={iconUserStyle} onClick={this.openUserProfileMenu.bind(this)}>
          <BAvatar
            context={this.props.context}
            src={picture}
            style={{ margin: '12px', width: '36px', height: '36px' }}
            size={36}>
            {!picture && <User context={this.props.context} style={{ width: '36px', height: '36px', margin: '0px', opacity: 0.87 }} />}
          </BAvatar>
          <div>
            <ArrowDropUp style={{ color: 'white', width: '30px', height: '30px', display: this.state.userArrowDisplay, margin: '-18px 15px 0px 15px' }} />
           
          </div>
        </div>);
    }
    else {

      let isRightToLeft = this.props.context.localization.isRightToLeft;

      let user = <BAvatar
        context={this.props.context}
        icon={<User context={this.props.context} style={{ width: '32px', height: '32px' }} />}
        src={picture}
        style={{ width: '32px', height: '32px', margin: isRightToLeft ? '0 16px 0 0px' : '0 0 0 16px' }}
        size={36} >
        {!picture && <User context={this.props.context} style={{ width: '32px', height: '32px', opacity: 0.87 }} />}
      </BAvatar>;

      let arrow = <BButton context={context}
        type='icon'
        iconProperties={{ color: this.props.context.theme.boaPalette.base400 }}
        style={{ padding: '0px', margin: isRightToLeft ? '0 0 0 4px' : '0 4px 0 0' }}
        dynamicIcon={isRightToLeft ? 'KeyboardArrowLeft' : 'KeyboardArrowRight'} />;

      let leftIcon = isRightToLeft ? arrow : user;

      this._userElement =
        <BMenuItem primaryText={this.props.context.applicationContext.user.name}
          leftIcon={leftIcon}
          itemSelected={this.openUserProfileMenu.bind(this)}
          context={this.props.context}
        />;
    }
  }

  openUserProfileMenu() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({
        userArrowDisplay: 'block',
        favoritesArrowDisplay: 'none',
      });
    }, 130);
    this.userProfileMenu.getInstance().openUserProfileMenu();
  }

  onActionSearchClick() {
    this.inputSearch.getInstance().openSearchBar();
  }

  resetSearchValue() {
    this.inputSearch.getInstance().resetValue();
  }

  openPopover() {
    this.bPopover.openPopover();
  }

  closePopover() {
    this.bPopover.manualClose();
  }
  renderDesktopToolBar() {
    return (
      <div style={{ float: !this.props.context.localization.isRightToLeft ? 'left' : 'right', height: '50px', width: '100%' }}>
        <div style={{ float: !this.props.context.localization.isRightToLeft ? 'left' : 'right', width: '205px' }}>
          {this._navigationMenuElement}
          {this._logo}
        </div>
        <div style={{ float: !this.props.context.localization.isRightToLeft ? 'left' : 'right', width: 'calc(100% - 440px)' }}>
          <BInputSearch
            ref={(item) => { this.inputSearch = item; }}
            context={this.props.context}
            fullWidth={true}
            dataSource={this.resourceList}
            hintText={this.props.searchBarHintText}
            style={{ visibility: this._searchBarVisible, marginTop: 7 }}
            onItemClick={this.onItemClick} />
        </div>
        <div style={{ float: !this.props.context.localization.isRightToLeft ? 'left' : 'right', width: '235px' }}>
          {this._userElement}
          {
            <div>
              <BUserProfile
                ref={(item) => { this.userProfileMenu = item; }}
                context={this.props.context}
                onClose={this.disappearPopoverArrow.bind(this)}
                onEditProfile={this.props.onEditProfile} 
                onLogOut ={this.props.onLogOut}/>
            </div>
          }
        </div>
      </div>
    );
  }

  renderMobileToolBar() {
    let primaryButtonStyle = { color: this.props.context.theme.boaPalette.pri500, height: '48px', padding: '8px 8px' };
    let secondaryButtonStyle = { color: this.props.context.theme.boaPalette.obli500, height: '48px', padding: '8px 8px' };
    primaryButtonStyle = _.merge(primaryButtonStyle, this.props.context.theme.changeUser);
    secondaryButtonStyle = _.merge(secondaryButtonStyle, this.props.context.theme.logOut);
    let isRightToLeft = this.props.context.localization.isRightToLeft;
    
    let closeIcon =
      <BButton context={this.props.context}
        type='icon'
        iconProperties={{ color: this.props.context.theme.boaPalette.base400 }}
        style={{ padding: '0px', margin: isRightToLeft ? '0 0 0 4px' : '0 4px 0 0' }}
        dynamicIcon='Close' />;
 
    let leftIcon = isRightToLeft ? closeIcon : null;
    let rightIcon = !isRightToLeft ? closeIcon : null;
    return (
      <div style={{ width: '100%', height: '50px', backgroundColor: this.props.context.theme.boaPalette.pri500 }}>
       
        {this._logo}
        <div style={{ padding: '6px 0px', float: !this.props.context.localization.isRightToLeft ? 'right' : 'left' }}>


          <BButton context={this.props.context}
            type='icon'
            dynamicIcon='MoreVert'
            iconProperties={{ color: '#ffffff' }}
            style={{ color: 'white', float: !this.props.context.localization.isRightToLeft ? 'right' : 'left' }}
            onClick={this.openPopover.bind(this)} />
          <BPopover
            anchorReference='anchorPosition'
            anchorPosition={{ top: '8', left: '8', }}
            PaperProps={{
              style: {
                maxWidth: '100%',
                width: 'calc(100% - 16px)',
              },
            }}
            marginThreshold='8'
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            context={this.props.context} ref={(item) => { this.bPopover = item; }} >
            <List style={{ paddingTop: 0 }}>
              
              <BMenuItem
                primaryText={this.getMessage('BOAOne', 'Menu')}
                leftIcon={leftIcon}
                itemSelected={this.closePopover.bind(this)}
                context={this.props.context}
                rightIcon={rightIcon}
                primaryTextPadding={isRightToLeft ? '0px 16px 0px 24px' : '0px 24px 0px 16px'}
              />
              <BDivider context={this.props.context} style={{ margin: '0px' }} />
              {this._userElement}
              {
                <div>
                  <BUserProfile
                    ref={(item) => { this.userProfileMenu = item; }}
                    context={this.props.context}
                    onClose={this.disappearPopoverArrow.bind(this)}
                    onEditProfileClick={this.props.onEditProfileClick} 
                    onLogOutClick ={this.props.onLogOutClick}
                  />
                </div>
              }
             
              <BDivider context={this.props.context} style={{ margin: '0px' }} />
              <div style={{
                float: isRightToLeft ? 'left' : 'right',
                marginBottom: '6px',
                padding: isRightToLeft ? '0 0 0 16px' : '0 16px 0 0',
                display: 'flex', 'flex-direction': isRightToLeft ? 'row-reverse' : null
              }}>
                <div>
                  <BButton context={this.props.context} style={primaryButtonStyle} type="flat" text={this.getMessage('BOAOne', 'ChangeUser')} onClick={this.changeUser} />
                </div>
                <div>
                  <BButton context={this.props.context} style={secondaryButtonStyle} type="flat" text={this.getMessage('BOAOne', 'LogOut')} onClick={this.logOut} />
                </div>
              </div>
              {/* <div style={this.props.context.theme.changeUser}>CHANGE USER</div>
              <div style={this.props.context.theme.logOut}>LOG OUT</div> */}
            </List>
          </BPopover>


        </div>
        <div style={{ padding: '6px 0px', float: !this.props.context.localization.isRightToLeft ? 'right' : 'left' }}>
          <BButton context={this.props.context}
            type='icon'
            dynamicIcon='Search'
            iconProperties={{ color: '#ffffff' }}
            style={{ color: 'white', float: !this.props.context.localization.isRightToLeft ? 'right' : 'left' }}
            onClick={this.onActionSearchClick.bind(this)} />
        </div>
        <BInputSearch
          ref={(item) => { this.inputSearch = item; }}
          context={this.props.context}
          fullWidth={true}
          dataSource={this.resourceList}
          hintText={this.props.searchBarHintText}
          style={{ visibility: this._searchBarVisible }}
          onItemClick={this.onItemClick} />
      </div>
    );
  }
}

export default BAppHeaderKFH;
