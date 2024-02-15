import { LitElement, html, css } from 'lit';

class InputArea extends LitElement {

  static get properties() {
    return {
      quotedMessage: { type: Object },
      user: { type: String},
    };
  }

  constructor() {
    super();
    this.quotedMessage = null;
  }

  static get styles() {
    return css`
    .input-area {
      display: flex;
      align-items: center;
      background: #fff;
      padding: 8px;
      box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);
      border-radius: 24px;
      margin: 10px;
    }
    

      input {
        flex: 1;
        border: none;
        padding: 8px 16px;
        margin-right: 8px;
        border-radius: 20px;
        outline: none;
        font-size: 16px;
      }

      input:focus {
        box-shadow: inset 0 0 0 2px #007BFF;
      }

      button {
        padding: 8px 16px;
        background-color: rgb(76, 130, 246);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      button:hover {
        background-color: #0056b3;
        color: white;
      }

      .quoted-message-container {    
        background: rgb(76, 130, 246);
        color: white;
        padding: 6px 20px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        animation: 0.3s ease-out 0s 1 normal forwards running slideIn;
      }

      .close-button {
        margin-left: 8px;
        cursor: pointer;
        background: transparent;
        border: 0;
        font-size: 1rem;
        color: #333;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-40%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
  }

  sendMessage() {
    const input = this.shadowRoot.querySelector('input');
    const message = input.value.trim();
    if (message) {

      console.log({ question: this.quotedMessage ? this.quotedMessage : message, answer: !this.quotedMessage ? '' : message });
      this.dispatchEvent(new CustomEvent('send-message', {
        detail: { question: this.quotedMessage ? this.quotedMessage.question : message, answer: !this.quotedMessage ? '' : message },
        bubbles: true,
        composed: true
      }));

      this.quotedMessage = null;
      input.value = '';
    }
  }

  _removeQuotedMessage() {
    this.quotedMessage = null; // Clear the quoted message
  }

  render() {
    return html`
    
    ${this.quotedMessage ? html
        `<div class="quoted-message-container">
         <div class="quoted-message">
    <b>reply to: (${this.quotedMessage.user}) </b>${this.quotedMessage.question}</div>
    <button class="close-button" @click=${this._removeQuotedMessage}>&times;</button>
    </div>` : ''}
    
      <div class="input-area">
        <input type="text" maxlength="280" placeholder="${this.user}: type your message..." @keyup="${this.handleKeyUp}" />
        <button @click="${this.sendMessage}">Send</button>
      </div>
    `;
  }

  handleKeyUp(e) {
    if (e.key === 'Enter') {
      this.sendMessage();
    }
  }
}

customElements.define('input-area', InputArea);
