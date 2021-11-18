/***************************************************************************************
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

import React from 'react';
import { connect } from 'react-redux';
import {
  Item,
  ActionButton,
  TabList,
  TabPanels,
  Tabs,
  TextField,
  Flex,
  Well
} from '@adobe/react-spectrum';
import CloseIcon from '@spectrum-icons/workflow/Close';
import { createAction } from 'redux-actions';
import { FieldArray, getFormValues } from 'redux-form';
import { isPlainObject } from 'is-plain-object';
import { getCurrentViewPropsFromState } from '../reduxActions/reducer';
import EditorButton from '../components/editorButton';
import FullWidthField from '../components/fullWidthField';
import InfoTip from '../components/infoTip';
import WrappedField from '../components/wrappedField';
import './directCall.styl';

const VIEW_MODE_SIMPLE = 'simple';
const VIEW_MODE_ADVANCED = 'advanced';
const ACTION_SET_INITIALIZED = 'actions/directCall/SET_INITIALIZED';
const ACTION_SET_VIEW_PREFERENCE = 'actions/directCall/SET_VIEW_PREFERENCE';
const ACTION_DELAY_SAVE = 'actions/directCall/DELAY_SAVE';
const actions = {
  setViewPreference: createAction(ACTION_SET_VIEW_PREFERENCE)
};

const FORWARD_SLASH = 0x2215;
const OPENING_CURLY = 0x007b;
const CLOSING_CURLY = 0x007d;
const COLON = 0x003a;
const SEMICOLON = 0x003b;

const SimpleViewRows = ({ fields }) => {
  return (
    <>
      <Well className="simpleForm">
        <span className="codeLine">
          <em>
            {String.fromCharCode(FORWARD_SLASH)}&nbsp;
            {String.fromCharCode(FORWARD_SLASH)}&nbsp; enhances the direct call
            this information
          </em>
        </span>
        <span className="codeLine">
          const detail = {String.fromCharCode(OPENING_CURLY)}
        </span>
        {fields.map((detailRow, index) => (
          <Flex
            key={detailRow}
            gap="size-100"
            width="100%"
            margin="size-200"
            alignItems="center"
          >
            <WrappedField
              name={`${detailRow}.key`}
              type="text"
              component={TextField}
              placeholder="key"
              supportDataElement
              isRequired
            />
            <span className="codeText">{String.fromCharCode(COLON)}</span>
            <WrappedField
              name={`${detailRow}.value`}
              type="text"
              component={TextField}
              placeholder="value"
              supportDataElement
              isRequired
            />
            <ActionButton
              aria-label="Delete"
              isQuiet
              onPress={() => {
                fields.remove(index);
                if (fields.length === 1) {
                  fields.push({});
                }
              }}
            >
              <CloseIcon size="XS" />
            </ActionButton>
          </Flex>
        ))}
        <span className="codeLine">
          {String.fromCharCode(CLOSING_CURLY)}
          {String.fromCharCode(SEMICOLON)}
        </span>
        <span className="codeLine">
          return detail{String.fromCharCode(SEMICOLON)}
        </span>
      </Well>
      <ActionButton marginTop="size-200" onPress={() => fields.push({})}>
        Add Field
      </ActionButton>
    </>
  );
};

const filterEmptySimpleViewRows = (simpleViewObjectEntries) => {
  const sanitized = {};
  if (!simpleViewObjectEntries?.length) {
    return sanitized;
  }

  return simpleViewObjectEntries.reduce((entries, nextRow) => {
    const { key, value } = nextRow;
    if (key?.length && value?.length) {
      return {
        ...entries,
        [key]: value
      };
    }
    return entries;
  }, sanitized);
};

const settingsResembleSimpleForm = (settings) => {
  return settings.detail != null && isPlainObject(settings.detail);
};

// Places settings.detail into simpleViewObjectEntries if it should, or
// gives a default list of an empty item to the form.
const decorateSimpleFormSettings = (settings) => {
  if (settingsResembleSimpleForm(settings)) {
    return {
      ...settings,
      simpleViewObjectEntries: Object.entries(settings.detail).map(
        ([key, value]) => ({
          key,
          value
        })
      )
    };
  }

  return {
    ...settings,
    simpleViewObjectEntries: [{}]
  };
};

// Places settings.detail into advancedFormJavascript if it should, or
// loads the default text into the form.
const decorateAdvancedFormSettings = (settings) => {
  const defaultTemplate =
    `// return a JavaScript object containing the event detail to
    // include to the next rule.
    var detail = {

    };
    // It is your responsibility to return a JavaScript object here.
    return detail;
  `.replace(/^(?!\n)\s+/gm, '');

  if (!settingsResembleSimpleForm(settings)) {
    return {
      ...settings,
      advancedFormJavascript: settings.detail || defaultTemplate
    };
  }

  return {
    ...settings,
    advancedFormJavascript: defaultTemplate
  };
};

const DirectCall = ({ dispatch, selectedView }) => {
  if (!selectedView) {
    return null;
  }

  return (
    <div className="directCall">
      <Tabs
        selectedKey={selectedView}
        onSelectionChange={(view) => dispatch(actions.setViewPreference(view))}
        height="100%"
      >
        <TabList>
          <Item key={VIEW_MODE_SIMPLE}>Simple Mode</Item>
          <Item key={VIEW_MODE_ADVANCED}>Advanced Mode</Item>
        </TabList>
        <TabPanels>
          <Item key={VIEW_MODE_SIMPLE}>
            <FullWidthField
              label="Direct Call Identifier"
              name="identifier"
              containerMinWidth="size-6000"
              isRequired
            />

            <FieldArray
              component={SimpleViewRows}
              name="simpleViewObjectEntries"
            />
          </Item>
          <Item key={VIEW_MODE_ADVANCED}>
            <FullWidthField
              label="Direct Call Identifier"
              name="identifier"
              containerMinWidth="size-6000"
              isRequired
            />

            <div className="u-gapTop">
              <p>
                The code that you provide in the editor will be run to provide
                an event detail to the Direct Call.
              </p>

              <WrappedField
                name="advancedFormJavascript"
                component={EditorButton}
                language="javascript"
              />
              <InfoTip placement="bottom">
                Enter a script that returns a valid JavaScript key-value object.
              </InfoTip>
            </div>
          </Item>
        </TabPanels>
      </Tabs>
    </div>
  );
};

const mapStateToProps = (state) => {
  const loadedViewData = getCurrentViewPropsFromState(state);
  return {
    ...loadedViewData,
    formValues: getFormValues('default')(state)
  };
};
export default connect(mapStateToProps)(DirectCall);

export const formConfig = {
  settingsToFormValues(values, moduleSettings, getState, dispatch) {
    let formSettings = { ...moduleSettings };
    const loadedViewData = getCurrentViewPropsFromState(getState());
    if (!loadedViewData.initialized) {
      if (
        settingsResembleSimpleForm(moduleSettings) ||
        moduleSettings.detail == null
      ) {
        dispatch({
          type: ACTION_SET_VIEW_PREFERENCE,
          payload: VIEW_MODE_SIMPLE
        });
      } else {
        dispatch({
          type: ACTION_SET_VIEW_PREFERENCE,
          payload: VIEW_MODE_ADVANCED
        });
      }

      dispatch({
        type: ACTION_SET_INITIALIZED
      });
    }

    formSettings = decorateSimpleFormSettings(formSettings);
    formSettings = decorateAdvancedFormSettings(formSettings);

    const reconciledValues = {
      ...values,
      ...formSettings
    };
    delete reconciledValues.detail;
    return reconciledValues;
  },
  formValuesToSettings(settings, values, getState) {
    const props = getCurrentViewPropsFromState(getState());
    let detail;

    if (props.selectedView === VIEW_MODE_SIMPLE) {
      detail = filterEmptySimpleViewRows(values.simpleViewObjectEntries);
    } else {
      detail = values.advancedFormJavascript;
    }

    return {
      ...settings,
      identifier: values.identifier,
      detail
    };
  },
  validate(errors, values, getState) {
    errors = { ...errors };
    const props = getCurrentViewPropsFromState(getState());

    if (!values.identifier) {
      errors.identifier = 'Please specify an identifier.';
    }

    if (props.selectedView === VIEW_MODE_SIMPLE) {
      errors.simpleViewObjectEntries = [];
      values.simpleViewObjectEntries?.forEach((row, index) => {
        errors.simpleViewObjectEntries[index] = {};
        const isRowEmpty = !row.key?.length && !row.value?.length;
        if (!isRowEmpty) {
          if (!row.key?.length) {
            errors.simpleViewObjectEntries[index].key = 'This is required';
          } else if (!row?.value?.length) {
            errors.simpleViewObjectEntries[index].value = 'This is required';
          }
        }
      });
    } else {
      // todo: something here
    }

    return errors;
  },
  viewReducer: (
    state = {
      initialized: false,
      selectedView: null,
      hasDelayedSave: false
    },
    action
  ) => {
    switch (action.type) {
      case ACTION_SET_INITIALIZED:
        return {
          ...state,
          initialized: true
        };
      case ACTION_SET_VIEW_PREFERENCE:
        return {
          ...state,
          selectedView: action.payload
        };
      case ACTION_DELAY_SAVE:
        return {
          hasDelayedSave: true
        };
      default:
        return state;
    }
  }
};
