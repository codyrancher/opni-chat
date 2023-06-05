<script>
import Vue from 'vue';
import { TextAreaAutoGrow } from '@components/Form/TextArea';
import { NORMAN } from '@shell/config/types';
import { sendMessage } from '../../utils/requests/chat';
import Message from './Message';

export default Vue.extend({
  components: { Message, TextAreaAutoGrow },

  props: {
    store: {
      type:     Object,
      required: true
    }
  },

  data() {
    return {
      message:  '',
      messages: [
        {
          sender:  'Assistant',
          message: `You can begin our conversation by entering and sending me messages below.`
        },
      ],
      waiting: false
    };
  },

  methods: {
    async sendMessage(ev) {
      ev.preventDefault();

      const history = this.history;

      this.messages.push({
        sender:   'You',
        message: this.message
      });
      const currentMessage = this.message;

      await this.$set(this, 'message', '');
      await this.$set(this, 'waiting', true);
      this.scroll();

      const newMessage = await sendMessage(currentMessage, history);

      this.messages.push({
        sender:   'Assistant',
        message: newMessage
      });
      await this.$set(this, 'waiting', false);
      this.scroll();
    },

    scroll() {
      this.$nextTick(() => {
        const element = this.$refs.messages;

        element.scrollTop = element.scrollHeight;
      });
    }
  },

  computed: {
    history() {
      return this.messages.map((message) => {
        return {
          type:    message.sender === 'You' ? 'human' : 'ai',
          content: message.message
        };
      });
    },

    principal() {
      return this.store.getters['rancher/byId'](NORMAN.PRINCIPAL, this.store.getters['auth/principalId']) || {};
    }
  },
});
</script>
<template>
  <div class="chat">
    <div ref="messages" class="messages">
      <div v-for="(m, i) in messages" :key="i" class="message" :class="{user: m.sender === 'You', assistant: m.sender === 'Assistant' }">
        <div class="sender h-pad v-pad">
          <div v-if="m.sender === 'You'" class="user-image hand">
            <img
              v-if="principal && principal.avatarSrc"
              :src="principal.avatarSrc"
              :class="{'avatar-round': principal.roundAvatar}"
              width="36"
              height="36"
            >
            <i
              v-else
              class="icon icon-user icon-3x avatar"
            />
          </div>
          <div v-else>
            <i
              class="icon icon-user icon-3x avatar"
            />
          </div>
        </div>
        <Message :message="m.message" :store="store" @shell-opened="$emit('shell-opened')" /> <!--eslint-disable-line vue/singleline-html-element-content-newline -->
      </div>
      <div v-if="waiting" class="message assistant">
        <div class="sender h-pad v-pad">
          <i
            class="icon icon-user icon-3x avatar"
          />
        </div>
        <div class="body">
          <div class="dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="user-input m-10">
      <TextAreaAutoGrow v-model="message" placeholder="Type your message here..." style="padding-top: 10px; min-height: 42px;" @keyup.enter.native="sendMessage" />
      <button class="btn bg-primary ml-10" @click="sendMessage">
        Send
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.chat {
    display: flex;
    flex-direction: column;
    height: 100%;

    .h-pad {
        $size: 18px;

        padding-left: $size;
        padding-right: $size;
    }

    .v-pad {
        $size: 12px;

        padding-top: $size;
        padding-bottom: $size;
    }

    .messages {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
    }

    .message {
        display: flex;
        flex-direction: row;
        margin-bottom: 0;

        position: relative;

        color: #000;

        .user-image, .avatar {
            $size: 36px;
            width: $size;
            height: $size;
        }

        .avatar {
            margin-left: -2px;
            margin-top: -2px;
            margin-right: 2px;
        }

        .body {
            padding-top: 22px;
            padding-bottom: 16px;

            & > * {
                background: none;
            }
        }

        pre {
          background: none;
          padding: 0;
          margin: 0;

          code {
            padding: 8px;
            color: #FFF;
            background-color: rgba(20, 20, 25, 0.9);
          }
        }

        a {
          color: #FFF;
        }

        &.user {
            background-color: var(--topmost-border);
        }

        .sender {
            margin-bottom: 2px;
            font-weight: 800;
        }

        .dots {
          margin-top: -4px;
        }

        $dotSize: 4px;
        .dot {
          display: inline-block;
          width: $dotSize;
          height: $dotSize;
          border-radius: 50%;
          background-color: #000;

          margin-left: 3px;
        }

        .dots .dot:nth-last-child(1) {
          animation: jumpingAnimation 0.8s 0.1s ease-in infinite;
        }
        .dots .dot:nth-last-child(2) {
          animation: jumpingAnimation 0.8s 0.2s ease-in infinite;
        }
        .dots .dot:nth-last-child(3) {
          animation: jumpingAnimation 0.8s 0.4s ease-in infinite;
        }

        @keyframes jumpingAnimation {
          0% {
            transform: translate3d(0, 0,0);
          }
          50% {
            transform: translate3d(0, calc($dotSize/1.5),0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
    }

    .user-input {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
    }
}
</style>
