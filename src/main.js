import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// For FontAwesome if you're using it
import '@fortawesome/fontawesome-free/css/all.css';

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');
