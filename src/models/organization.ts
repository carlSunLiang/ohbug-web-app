import { history } from 'umi';
import type { User } from 'umi';

import type { Model, RootState } from '@/interfaces';
import api from '@/api';

export interface Organization {
  id?: number;
  name?: string;
  avatar?: string;
  introduction?: string;
  users?: User[];
}
export interface OrganizationModelState {
  current?: Organization;
  data?: Organization[];
}
export interface OrganizationModel extends Model<OrganizationModelState> {
  namespace: 'organization';
}

const organization: OrganizationModel = {
  namespace: 'organization',
  state: {},
  reducers: {
    setState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
  effects: {
    *create({ payload: { name, introduction } }, { select, call, put }) {
      const admin_id = yield select((state: RootState) => state.user.id);
      const organizations = yield select((state: RootState) => state.organization.data);

      if (name && admin_id) {
        const data = yield call(api.organization.create, {
          name,
          introduction,
          admin_id,
        });
        if (data) {
          yield put({
            type: 'setOrganizations',
            payload: [...organizations, data],
          });
          yield put({
            type: 'setCurrentOrganization',
            payload: data,
          });
          history.push('/');
        }
      }
    },

    *setOrganizations({ payload }, { put }) {
      yield put({
        type: 'setState',
        payload: {
          data: payload,
        },
      });
    },

    *setCurrentOrganization({ payload }, { put }) {
      yield put({
        type: 'setState',
        payload: {
          current: payload,
        },
      });
      yield put({
        type: 'project/getAllProjectByOrganizationId',
      });
    },
  },
};

export default organization;
