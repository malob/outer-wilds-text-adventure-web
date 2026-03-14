// GlobalMessenger + Message — ported from GlobalMessenger.pde
class GlobalMessenger {
  constructor() {
    this._observers = [];
  }

  addObserver(observer) {
    if (!this._observers.includes(observer)) {
      this._observers.push(observer);
    }
  }

  removeObserver(observer) {
    const idx = this._observers.indexOf(observer);
    if (idx !== -1) {
      this._observers.splice(idx, 1);
    }
  }

  removeAllObservers() {
    this._observers = [];
  }

  sendMessage(messageOrId, text) {
    let message;
    if (typeof messageOrId === 'string') {
      message = new Message(messageOrId, text);
    } else {
      message = messageOrId;
    }

    for (let i = 0; i < this._observers.length; i++) {
      this._observers[i].onReceiveGlobalMessage(message);
    }
  }
}

class Message {
  constructor(id, text) {
    this.id = id;
    this.text = text || null;
  }
}
