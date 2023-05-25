<script>
import Vue from 'vue';
import Chat from './Chat';

export default Vue.extend({
  components: { Chat },
  layout:     'plain',
});
</script>
<template>
  <Chat :store="$store" />
</template>
