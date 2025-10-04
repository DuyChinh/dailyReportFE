import { createStore } from 'vuex';
import auth from './auth';
import reports from './reports';
import tasks from './tasks';
import users from './users';

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    auth,
    reports,
    tasks,
    users
  }
});
