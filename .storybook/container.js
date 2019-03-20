import React, { Component } from 'react';
import addons from '@storybook/addons';
import { AppProvider, ComponentBase, setLocalization, getTheme } from '@kuveytturk/boa-base';
import { Localization, Language } from '@kuveytturk/boa-utils';
import { context } from '@kuveytturk/boa-test/utils';
import detectSize from './utils/detectSize';
import Messages from './messages';

export default class Container extends ComponentBase {
  constructor(props) {
    super(props);
    this.onThemeChange = this.onThemeChange.bind(this);
    this.onLanguageChange = this.onLanguageChange.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onAction = this.onAction.bind(this);

    context.language = Language.EN;

    setLocalization({
      url: 'http://boaonedev',
      path: '/messaging/',
      versionPath: 'MessagingVersions.json',
      fileNameFormat: 'BOA.Messaging.{0}.json',
      timeout: 3000,
      languageId: context.language,
      localMessages: Messages,
    });

    context.deviceSize = detectSize();
    window.addEventListener('resize', this.onResize);
    this.state = { context };
  }

  componentDidMount() {
    const channel = addons.getChannel();
    channel.emit('props/change-context', this.state.context);
    channel.on('props/change-theme', this.onThemeChange);
    channel.on('props/change-language', this.onLanguageChange);
  }

  onResize() {
    const deviceSize = detectSize();
    this.setState({ context: Object.assign({}, this.state.context, { deviceSize }) });
  }

  onThemeChange(themeName) {
    const channel = addons.getChannel();
    channel.emit('props/change', { themeName });
    const theme = getTheme({ themeName: themeName });
    if (theme) {
      this.setState({ context: Object.assign({}, this.state.context, { theme }) },
        () => {
          channel.emit('props/change-context', this.state.context);
        });
    }
  }

  onLanguageChange(value) {
    const channel = addons.getChannel();
    const localization = { isRightToLeft: value === 5 ? true : false };
    Localization.staticConstructor(value);

    this.setState({
      context: Object.assign({}, this.state.context, {
        language: value,
        localization: localization,
        messagingContext: {},
      }),
    },
      () => {
        channel.emit('props/change-context', this.state.context);
      });
  }

  onAction() {
    const channel = addons.getChannel();
    channel.emit('action-created');
  }

  render() {
    const { story, context } = this.props;
    context.props = { context: this.state.context };
    context.props.onThemeChange = this.onThemeChange;
    context.props.onLanguageChange = this.onLanguageChange;
    context.props.onAction = this.onAction;

    return <AppProvider theme={this.state.context.theme}>{story(context)}</AppProvider>;
  }
}
