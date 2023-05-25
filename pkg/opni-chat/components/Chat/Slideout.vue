<script>
import Vue from 'vue';
import Chat from './Chat.vue';

export default Vue.extend({
  props: {
    store: {
      type:     Object,
      required: true
    },
    setup: {
      type:     Function,
      required: true
    }
  },

  components: { Chat },

  created() {
    this.setup(this.toggle);
  },

  data() {
    return { opened: false };
  },

  computed: {},

  methods: {
    toggle() {
      this.opened = !this.opened;

      if (this.opened) {
        document.body.addEventListener('click', this.toggleIfClickedOutside, true); 
      } else {
        document.body.removeEventListener('click', this.toggleIfClickedOutside, true); 
      }
    },

    toggleIfClickedOutside(ev) {
        if (!this.$refs.slideout.contains(ev.target)) {
            this.toggle();
        }
    }

  }
});
</script>
<template>
  <div class="slideout" :class="{opened}" ref="slideout">
    <Chat :store="store" @shell-opened="toggle" @click="(ev) => ev.preventDefault()" />
  </div>
</template>

<style lang="scss">
.slideout {
    $width: 800px;
    $top: 55px;

    position: fixed;
    right: -$width;
    top: $top;
    bottom: 0;
    z-index: 20;
    background-color: var(--topmenu-bg);
    border-left: 1px solid var(--topmost-border);
    box-shadow: 0 0 15px 4px var(--topmost-shadow);

    width: $width;
    transition: 0.5s;

    .catch {
        position: fixed;

        left: 0;
        right: 0;
        top: $top;
        bottom: 0;
    }

    &.opened {
        right: 0;
    }
}
</style>
