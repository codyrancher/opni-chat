import { importTypes } from '@rancher/auto-import';
import { ActionLocation, IPlugin, ActionOpts } from '@shell/core/types';
import Vue from 'vue';
import Chat from './components/Chat/index.vue';
import Slideout from './components/Chat/Slideout.vue';
import NewHome from './components/NewHome.vue';

// Init the package
export default function(plugin: IPlugin, context: any) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  let toggle: any = null;

  plugin.addAction(
    ActionLocation.HEADER,
    {},
    {
      tooltip:    'AI Assistant',
      svg:       require('./assets/icon-opni-chat.svg'),
      invoke(opts: any, resources: any) {
        toggle?.();
      }
    }
  );

  plugin.addAction(
    ActionLocation.TABLE,
    { resource: ['pod'] },
    {
      label:    'AI Insights',
      svg:       require('./assets/icon-opni-chat.svg'),
      invoke(opts: ActionOpts, resources: any[]) {
        toggle?.(resources);
      }
    }
  );

  if (!context.app.$config.isStandalone) {
    plugin.addRoute({
      name:      'ai-chat',
      path:      '/ai-chat',
      component: Chat
    });
  }

  plugin.addRoute({
    name:      'home',
    path:      '/home',
    component: NewHome
  });

  document.body.innerHTML += '<div id="ai-chat" />';
  new Vue({
    el:         '#ai-chat',
    components: { Slideout },
    render(h) {
      return h('div', [h(Slideout, {
        props: {
          setup: (fn: any) => {
            toggle = fn;
          },
          store: context.store
        }
      })]);
    },
  });
}
