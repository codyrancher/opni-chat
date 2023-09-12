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
    },
    resource: {
      type:    Object,
      default: null
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

      return result
        .replaceAll('```', '`')
        .replaceAll('"', '**')
        .replaceAll('{{scale}}', '**scale**')
        .replaceAll('{{alert}}', '**alert**');
    }
  },

  mounted() {
    this.process();
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
    },

    async updateDeploymentReplicas(id, count) {
      const deployment = await this.getDeployment(id);

      deployment.spec.replicas = count;
      deployment.save();
    },

    async getDeployment(id) {
      const deployments = await this.store.dispatch('cluster/findAll', { type: 'apps.deployment' });

      return deployments.find(d => d.metadata.name === id);
    },

    process() {
      if (!window.$) {
        return;
      }

      this.$nextTick(() => {
      // Kubectl commands
        $('code').toArray()
          .filter(code => code.textContent.startsWith('kubectl') && code.textContent.length > 'kubectl'.length && !code.textContent.includes('<') && $(code).children('.buttons-filler').length === 0)
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

            $(code).addClass('with-buttons');
            $(code).append('<div class="buttons-filler">&nbsp;</div>', buttons);
          });
      });

      // Scale buttons
      $('strong').toArray()
        .filter(s => s.textContent === 'scale')
        .forEach((s) => {
        // const deployment = this.resource;
          const container = $(`<div class="plus-minus"></div>`);
          const value = $(`<div class="value">1</div>`);
          const minus = $(`<button type="button" class="btn btn-sm role-secondary"><i class="icon icon-sm icon-minus"></i></button>`)
            .on('click', () => {
              if (value.text() > 0) {
                const newValue = value.text() - 1;

                value.text(newValue);
                this.updateDeploymentReplicas(this.resource, newValue);
              }
            });
          const plus = $(`<button type="button" class="btn btn-sm role-secondary"><i class="icon icon-sm icon-plus"></i></button>`)
            .on('click', () => {
              const newValue = Number.parseInt(value.text()) + 1;

              value.text(newValue);
              this.updateDeploymentReplicas(this.resource, newValue);
            });

          container.append(minus, value, plus);

          $(s).replaceWith(container);

          if (this.resource) {
            this.getDeployment(this.resource).then((d) => {
              value.text(d.spec.replicas);
            });
          }
        });

      // Alert icon
      $('strong').toArray()
        .filter(s => s.textContent === 'alert')
        .forEach((s) => {
          $(s).replaceWith(`<div class="icon-spacer">&nbsp;<i class="conditions-alert-icon icon-warning icon text-error icon-2x" /><div>`);
        });
    }
  }
});
</script>
<template>
  <div class="body" v-html="marked(preProcessedMessage)" />
</template>

<style lang="scss">
.message {
  .icon-spacer {
    display: inline-block;
    width: 28px;
    position: relative;
    margin-right: 4px;
  }

  p {
    line-height: 1.5;
    &:not(:last-of-type) {
      margin-bottom: 10px;
    }
  }

  li {
    line-height: 1.5;
  }

  .icon-warning {
    position: absolute;
    top: -6px;
    left: 0;
  }

  .plus-minus {
    display: inline-flex;
    align-items: center;
    margin-left: 8px;

    .value {
      margin: 0 5px;
    }
  }

  .body {
    img {
      max-width: 500px;
      margin: 5px auto;
    }

    color: var(--body-text);
  }

  code {
    margin-bottom: 2px;
    position: relative;
    line-height: 1;

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
