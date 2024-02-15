import { LitElement, html, css } from 'lit';

class MessageList extends LitElement {
  static get properties() {
    return {
      messages: { type: Array },
      user: { type: String }
    };
  }

  constructor() {
    super();
    this.messages = [];
  }

  static get styles() {
    return css`
    .message-list {
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 75vh;
      background: linear-gradient(to bottom, #ffffff 0%, #f7f7f8 100%);
      box-shadow: 0 10px 25px 0 rgba(0,0,0,0.1);
    }
    
    .blinking-dot {
      height: 10px;
      width: 10px;
      background-color: #76ff03;
      border-radius: 50%;
      display: inline-block;
      margin-left: 5px;
      animation: blink-animation 1.5s infinite;
    }
    
    @keyframes blink-animation {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }
    /* Style for each message bubble */
.message-item {
  max-width: 60%;
  color: white;
  padding: 8px 12px;
  font-size: 16px;
  line-height: 1.4;
  border-radius: 18px;
  margin-bottom: 4px;
  word-wrap: break-word;
  align-self: flex-end; /* Aligns your messages to the right */
  background-color: rgb(65 72 87); /* Blue for sent messages */
}

/* Style for received messages if needed */
.message-item.received {
  background-color: #e5e5ea; /* Light grey for received messages */
  color: black;
  align-self: flex-start; /* Aligns received messages to the left */
}

/* Style for quoted (previous) messages */
.quoted-message {
  background-color: #d1d1d6; /* Slightly darker grey for contrast */
  color: black;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 4px;
  font-size: 14px;
  border-left: 3px solid #007aff; /* Blue border for a visual hint */
}
    .reply-icon {
      cursor: pointer;
      transition: transform 0.2s ease-in-out;
    }
    .reply-icon:hover {
      transform: scale(1.2);
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translate3d(0, 20px, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
      .user-message {
        background-color: #e3f2fd;
        padding: 10px;
        border-radius: 5px;
      }

      .time-stamp {
        float: right;
        padding: 3px;
      }

      .user-avatar {
        width: 25px; /* Adjust the size as needed */
        height: 25px; /* Adjust the size as needed */
        border-radius: 50%; /* Makes the image circular */
        margin-right: 5px; /* Adds some space between the avatar and the message */
        align-self: end;
        margin-top: -5px;
      }
    `;
  }

  // Function to emit the selected message for quoting
  _quoteMessage(message) {
    this.dispatchEvent(new CustomEvent('quote-message', { detail: JSON.parse(JSON.stringify(message)) }));
  }

  updated() {
    const messageListContainer = this.shadowRoot.querySelector('.message-list');
    messageListContainer.scrollTop = messageListContainer.scrollHeight;
  }

  svgElementFromString(str) {
    if(str) {
      const div = document.createElement('DIV');
      div.innerHTML = str;
      const svg = div.querySelector('svg');
  
      if (!svg) {
        throw Error('<svg> tag not found');
      }
  
      return svg;
    }
  }


  formatDate(date) {
    const currentDate = new Date(date);
    const today = new Date();

    const isToday = currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    if (isToday) {
      // If the date is today, return only the time
      return currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // If the date is not today, return the full date and time
      return currentDate.toLocaleString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  render() {
    return html`
      <div class="message-list">
        ${this.messages.map(message => html`
        
        ${message.answer ? html`<div class="message-item received"> <b> <small>${message.user}: </small></b> ${message.question}</div>` : ''}

          <div class="message-item"> 
          <img src="./reply-icon.svg" height=10 class="reply-icon" @click=${() => this._quoteMessage(message)} alt="Reply">
          ${message.bot ? html`(bot)` : message.user}: <b> ${message.answer ? message.answer : message.question} </b><small class="time-stamp"> ${this.formatDate(message.timestamp)} </small>
          </div>
          ${message.bot ? html`<img src="./bot-avatar.png" class="user-avatar" alt="User Avatar">` : ''}
        `)}
      </div>
    `;
  }
}

customElements.define('message-list', MessageList);
