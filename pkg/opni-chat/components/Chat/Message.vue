<script>
import Vue from 'vue';
import { marked } from 'marked';

export default Vue.extend({
  props: {
    message: {
      type:     String,
      required: true
    },
    store: {
      type:     Object,
      required: true
    }
  },

  computed: {
    preProcessedMessage() {
      const regex = /"kubectl (.*?)"/g;
      const matches = [...this.message.matchAll(regex)];

      let result = this.message;

      matches.forEach(([full, command]) => {
        result = result.replace(full, `\`kubectl ${ command }\``);
      });

      return result.replaceAll('"', '**');
    }
  },

  mounted() {
    this.$nextTick(() => {
      $('code').toArray()
        .filter(code => code.textContent.startsWith('kubectl') && !code.textContent.includes('<') && $(code).children('.buttons-filler').length === 0)
        .forEach((code) => {
          const command = $(code).text();

          const buttons = $('<div class="buttons"></div>')
            .append(
              $('<div class="icon-container hand"><i class="icon icon-terminal"></i><span class="tooltip">Execute</span></div>').on('click', () => {
                this.runCommand(command);
              }),
              $('<div class="icon-container hand"><i class="icon icon-copy"></i><span class="tooltip">Copy</span></div>').on('click', () => {
                navigator.clipboard.writeText(command);
              })
            );
          
          $(code).append('<div class="buttons-filler">&nbsp;</div>', buttons);
        });
    });
  },

  methods: {
    marked,
    runCommand(command) {
      const cluster = this.store.getters['currentCluster'];

      this.store.dispatch('wm/open', {
        id:        `quick-command-shell`,
        label:     `Quick Kubectl: ${ cluster.nameDisplay }`,
        icon:      'terminal',
        component: 'KubectlShell',
        attrs:     {
          cluster,
          pod:                   {},
          commandOnFirstConnect: `${ command }\r`
        }
      }, { root: true });
      this.$emit('shell-opened');
    }
  }
});
</script>
<template>
  <div class="body" v-html="marked(preProcessedMessage)" />
</template>

<style lang="scss">
.message {
  code {
    margin-bottom: 2px;
    position: relative;

    .buttons-filler {
      display: inline-block;
      width: 50px;
    }

    .buttons {
      position: absolute;
      border-left: 1px solid var(--border);
      top: 0;
      bottom: 0;
      right: 0;

      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;

      & > .icon-container {
        position: relative;
        height: 100%;
        width: 26px;

        display: flex;
        justify-content: center;
        align-items: center;

        .tooltip {
          $width: 60px;
          $background: var(--topmost-border);
          visibility: hidden;
          display: inline-block;
          background-color: $background;
          text-align: center;
          border-radius: var(--border-radius);
          padding: 10px 8px;
          position: absolute;
          z-index: 1;
          top: calc(100% + 7px);
          font-family: "Lato", arial, helvetica, sans-serif;

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent $background transparent;
          }
        }

        &:hover {
          background-color: var(--border);

          .tooltip {
            visibility: visible;
          }
        }
      }
    }
  }
}
</style>
