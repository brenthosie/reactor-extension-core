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

import reduceReducers from 'reduce-reducers';
import { reducer as formReducer } from 'redux-form';
import bridgeAdapterActions from './bridgeAdapterActions';

export const LOADED_VIEW_DATA_STATE_KEY = 'loadedViewData';
export const getCurrentViewPropsFromState = (state) => {
  return state[LOADED_VIEW_DATA_STATE_KEY];
};

export default (viewReducer) =>
  reduceReducers(
    bridgeAdapterActions,

    // Setup for redux-form.
    (state, action) => ({
      ...state,
      form: formReducer(state.form, action)
    }),
    (state, action) => ({
      ...state,
      // state area for the current view
      [LOADED_VIEW_DATA_STATE_KEY]: viewReducer(
        state[LOADED_VIEW_DATA_STATE_KEY],
        action
      )
    })
  );
