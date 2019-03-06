import React from 'react';
import { STORY_RENDERED, STORY_CHANGED } from '@storybook/core-events';
import addons, { types } from '@storybook/addons';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import ReactJson from 'react-json-view';
import AppProvider from '../../packages/base/src/AppProvider';
import ComponentBase from '../../packages/base/src/ComponentBase';
import Divider from '../../packages/components/src/Divider';
import Input from '../../packages/components/src/Input';
import InputNumeric from '../../packages/components/src/InputNumeric';
import Label from '../../packages/components/src/Label';
import Toggle from '../../packages/components/src/Toggle';
import {
  generateDefaultValue,
  getPropType,
  getPropValue,
  getAvailableValues,
  getDefaultValue
} from '../../stories/base/utils';

const ADDON_ID = 'boa-props';
const PANEL_ID = `${ADDON_ID}/panel`;

const style = {
  scrollStyle: { maxHeight: 300, padding: 12, wordWrap: 'break-word' },
  menuItem: { paddingBottom: 12, wordWrap: 'break-word' },
  menuItemDivider: { marginLeft: '0', marginRight: '0', marginTop: '6px', marginBottom: '18px' },
  buttonStyle: { height: 40, minWidth: '100%', textAlign: 'left' },
};

const themeItems = [
  { title: 'Kuveyt Turk', value: 'kuveytturk' },
  { title: 'Violet', value: 'violet' },
  { title: 'Winter', value: 'winter' },
  { title: 'Spring', value: 'spring' },
  { title: 'Summer', value: 'summer', color: '#D11919' },
  { title: 'Fall', value: 'fall' },
  { title: 'Night', value: 'night' },
  { title: 'Sea', value: 'sea' },
  { title: 'Rose', value: 'rose' },
  { title: 'Ash', value: 'ash' },
  { title: 'Dark', value: 'dark' },
  { title: 'Orange', value: 'orange' },
  { title: 'Magenta', value: 'magenta' },
];

const languageItems = [
  { title: 'Türkçe', value: 1 },
  { title: 'English', value: 2 },
  { title: 'Deutsch', value: 3 },
  { title: 'русский', value: 4 },
  { title: 'العربية', value: 5 },
];

class PropsPanel extends ComponentBase {
  state = {
    value: '',
    availableProperties: [],
    availableComposedProperties: [],
    currentProperties: {},
  };

  constructor(props, context) {
    super(props, context);
    this.componentPropertySource = [];
    this.onStoryChange = this.onStoryChange.bind(this);
    this.onContextChange = this.onContextChange.bind(this);
    this.onPropertyChanged = this.onPropertyChanged.bind(this);
  }

  componentDidMount() {
    const { api } = this.props;
    api.on('props/change-context', this.onContextChange);
    api.on(STORY_RENDERED, this.onStoryChange);
  }

  componentWillUnmount() {
    const { api } = this.props;
    api.on('props/change-context', this.onContextChange);
    api.off(STORY_RENDERED, this.onStoryChange);
  }

  onContextChange(context) {
    this.setState({
      context,
      selectedTheme: context.theme.themeName,
      selectedLanguage: context.language,
    });
  }

  onStoryChange(id) {
    const { api } = this.props;
    const doc = api.getParameters(id, 'doc');
    this.prepareData(doc);
  };

  onPropertyChanged() {
  };

  prepareData(doc) {
    console.log(AppProvider);
    const self = this;
    const propMetaData = doc.props;
    const composeMetaData = doc.composeProps;

    const availableProperties = [];
    const availableComposedProperties = [];
    const currentProperties = {};

    const createPropMeta = (metaData, available, current) => {
      Object.keys(metaData)
        .sort()
        .forEach(key => {
          const prop = metaData[key];
          if (prop.description && prop.description.includes('@ignore')) return;

          const property = {
            name: key,
            type: getPropType(prop),
            value: getPropValue(prop),
            values: getAvailableValues(prop),
            default: getDefaultValue(prop),
          };

          available.push(property);
          const defaultValue = getDefaultValue(prop);
          if (defaultValue) {
            current[key] = defaultValue;
          }
        });

      if (available && available.length > 0) {
        available.sort((a, b) => {
          if (a.type < b.type) return -1;
          if (a.type > b.type) return 1;
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      }
    };

    if (composeMetaData) {
      Object.keys(composeMetaData).forEach(composeName => {
        createPropMeta(
          composeMetaData[composeName],
          availableComposedProperties,
          currentProperties,
        );
      });
    }

    createPropMeta(propMetaData, availableProperties, currentProperties);

    // currentProperties.data = this.props.sampleData;
    Object.assign(currentProperties, this.props.defaultProps);

    this.setState({ availableProperties, availableComposedProperties, currentProperties }, () => {
      // // const code = self.getComponentString();
      // this.setState({ code });
    });
  }

  render() {
    if (!this.props.active) {
      return null;
    }

    if (!this.state.context || !this.state.context.theme) {
      return (<h3>Loading...</h3>)
    }

    const self = this;
    const { api } = this.props;
    const {
      context,
      currentProperties,
      availableProperties,
      availableComposedProperties
    } = this.state;
    const hasComposedProps = availableComposedProperties.length > 0;

    if (availableProperties.length === 0 && availableComposedProperties.length === 0) {
      return (<h3>No prop definition</h3>)
    }

    return (
      <div style={{ padding: 24 }}>
        <FormControl style={{ maxWidth: 300, width: '100%' }}>
          <InputLabel htmlFor="theme">Theme</InputLabel>
          <Select
            value={this.state.selectedTheme}
            onChange={event => {
              self.setState({
                selectedTheme: event.target.value,
              });
              api.emit('props/change-theme', event.target.value);
            }}
          >
            {themeItems.map((item, index) => {
              return (
                <MenuItem
                  key={`themeItems${index}`} // eslint-disable-line
                  value={item.value}
                >
                  {item.title}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl
          style={{
            maxWidth: 300,
            width: '100%',
            marginTop: 15,
            marginBottom: 15,
          }}
        >
          <InputLabel htmlFor="lang">Language</InputLabel>
          <Select
            value={this.state.selectedLanguage}
            onChange={event => {
              self.setState({
                selectedLanguage: event.target.value,
              });
              if (self.props.onThemeChange) {
                self.props.onLanguageChange(event.target.value);
              }
            }}
          >
            {languageItems.map((item, index) => {
              return (
                <MenuItem
                  key={`languageItems${index}`} // eslint-disable-line
                  value={item.value}
                >
                  {item.title}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {availableProperties.map((property, i) => {
          return <div>{property.name}</div>
        })}
        {hasComposedProps && (
          <Divider context={context} style={{ width: 'inherit', margin: '12px -24px' }} />
        )}
        {hasComposedProps && (
          <Label
            context={context}
            text="Inherited Props"
            style={{
              color: context.theme.palette.primary.main,
              fontSize: 14,
              paddingBottom: 12,
            }}
          />
        )}
        {availableComposedProperties.map((property, i) => {
          return <div>{property.name}</div>
        })}
      </div>
    );
  }
}

addons.register(ADDON_ID, api => {
  const render = ({ active, ...others }) => {
    return <PropsPanel api={api} active={active} />;
  }
  const title = 'Props';

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title,
    render,
  });
});
