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

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Item, TabList, TabPanels, Tabs } from '@adobe/react-spectrum';
import { createAction, handleActions } from 'redux-actions';
import { FieldArray } from 'redux-form';
import EditorButton from '../components/editorButton';
import FullWidthField from '../components/fullWidthField';
import InfoTip from '../components/infoTip';
import WrappedField from '../components/wrappedField';

const ACTION_SET_VIEW_PREFERENCE = 'actions/directCall/SET_VIEW_PREFERENCE';
const ACTION_DELAY_SAVE = 'actions/directCall/DELAY_SAVE';
const actions = {
  setViewPreference: createAction(ACTION_SET_VIEW_PREFERENCE)
};

const SimpleViewRows = ({ fields }) => {
  return (
    <>
      {fields.map((field) => (
        <input type="text" value={field.value} />
      ))}
      <button type="button" onClick={() => fields.push({})}>
        add field
      </button>
    </>
  );
};

const DirectCall = ({ dispatch, selectedView }) => {
  const [selectedTab, setSelectedTab] = useState('simple');
  React.useEffect(() => {
    dispatch(actions.setViewPreference('simple'));
  }, []);

  if (!selectedView) {
    return null;
  }

  return (
    <>
      <h1>hello world</h1>
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
        height="100%"
      >
        <TabList>
          <Item key="simple">Simple Mode</Item>
          <Item key="advanced">Advanced Mode</Item>
        </TabList>
        <TabPanels>
          <Item key="simple">
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
          <Item key="advanced">
            <FullWidthField
              label="Direct Call Identifier"
              name="identifier"
              containerMinWidth="size-6000"
              isRequired
            />

            <div className="u-gapTop">
              <p>
                (optional) The code that you provide in the editor will be run
                to provide an event detail to the Direct Call.
              </p>

              <WrappedField
                name="detail"
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
    </>
  );
};

const mapStateToProps = ({ directCallAction = {} }) => ({
  ...directCallAction
});
export default connect(mapStateToProps)(DirectCall);

export const formConfig = {
  settingsToFormValues(values, settings) {
    const simpleViewObjectEntries = settings.simpleViewObjectEntries || [];
    if (!simpleViewObjectEntries.length) {
      simpleViewObjectEntries.push({});
    }
    return {
      ...values,
      ...settings,
      simpleViewObjectEntries
    };
  },
  formValuesToSettings(settings, values) {
    return {
      ...settings,
      ...values
    };
  },
  validate(errors, values) {
    errors = {
      ...errors
    };

    if (!values.identifier) {
      errors.identifier = 'Please specify an identifier.';
    }

    // values.detail is optional, so skip its validation

    return errors;
  },
  getReducer() {
    return handleActions(
      {
        [ACTION_SET_VIEW_PREFERENCE]: (
          { directCallAction = {}, ...state },
          action
        ) => ({
          ...state,
          directCallAction: {
            ...directCallAction,
            selectedView: action.payload
          }
        }),
        [ACTION_DELAY_SAVE]: ({ directCallAction = {}, ...state }) => ({
          ...state,
          directCallAction: {
            ...directCallAction,
            hasDelayedSave: true
          }
        })
      },
      {}
    );
  }
};
