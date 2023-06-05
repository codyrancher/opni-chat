import { importTypes } from '@rancher/auto-import';
import { ActionLocation, IPlugin } from '@shell/core/types';
import Vue from 'vue';
import Chat from './components/Chat/index.vue';
import Slideout from './components/Chat/Slideout.vue';

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
      tooltip:    'AI Chat',
      svg:       require('./assets/icon-opni-chat.svg'),
      invoke(opts: any, resources: any) {
        toggle?.();
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
