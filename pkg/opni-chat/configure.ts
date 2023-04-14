import { IExtension, RegisterFn } from '@shell/core/extensions/types';
import Chat from './components/Chat/index.vue';
import GlobalLink from './components/GlobalLink.vue';
import GlobalLink2 from './components/GlobalLink2.vue';
import ClusterDashboardGlance from './components/ClusterDashboardGlance.vue';

// Register and configure the extension
export default function(register: RegisterFn) {
  const extension: IExtension = register(require('./package.json'));

  console.log('API Initialized', extension.isInitialized); // eslint-disable-line no-console

  extension.router.addRoute({
    name:      'chat',
    path:      '/chat',
    component: Chat
  });

  extension.router.addRoute({
    name:      'about',
    path:      '/about',
    component: Chat
  });

  extension.ui.extendSlot('*', 'global-apps', 'Before', GlobalLink);
  extension.ui.extendSlot('*', 'global-apps', 'After', GlobalLink2);

  extension.ui.extendSlot('*', 'cluster-dashboard-glance', 'Replace', ClusterDashboardGlance);
}
