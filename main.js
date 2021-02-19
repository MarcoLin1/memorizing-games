const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', //黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', //愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', //方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg'  //梅花
]

const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished',
}

// MVC架構中view是呈現介面的程式碼
const view = {
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1) // 取餘數+1 = 撲克牌的數字
    const symbol = Symbols[Math.floor(index / 13)] // 除以13後取整數再帶回Symbols陣列中
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>`
  },
  // 數字轉換成A、J、Q、K
  transformNumber(number) {
    switch (number) { //switch是指當代入參數符合case條件，就執行該條件的陳述式
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  // 渲染畫面
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    // 產生array從array(52)的跌代器中，然後透過map迭代陣列一個個拿出來放到getCardElement中，再用join將陣列合成大字串
    // rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join('')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    cards.map(card => {
      // 回傳正面，當card的class包含back就刪除這個class，然後呼叫正面的內容
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面，card的class增加back，然後innerHTML都刪除，只出現卡的背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },
  renderTimes(times) {
    document.querySelector('.times').innerText = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML =
      `
    <p>Congratulation!!!</p>
    <p>Final Score: ${model.score}<p>
    <p>You've tried: ${model.triedTimes} times<p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


// MVC架構中model是存放資料
const model = {
  revealCards: [],
  isRevealedCardMatched() {
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}

// MVC架構中controller是控制資料和畫面，存放和流程有關的程式碼
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {  //當卡片不包含back的class就return
      return
    }
    // 轉換currentState，當是FirstCardAwaits，翻開卡片，把卡片push到revealCards裡面，然後改變currentState狀態
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      // 當是secondCardAwaits，翻開卡片，把卡片push到revealCards裡面
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealCards.push(card)
        view.renderTimes(model.triedTimes += 1)
        // 判斷配對是否成功
        if (model.isRevealedCardMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealCards)
          model.revealCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCard, 1000)
        }
        break
    }
    console.log('this currentState', this.currentState)
    console.log('revealedCards', model.revealCards.map(card => card.dataset.index))
  },
  // 重置卡片
  resetCard() {
    view.flipCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

// 隨機洗牌
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        // ;是區分上下程式碼, 避免連在一起解讀
        // 解構賦值讓index和randomIndex交換，ex: 如果index = 6、randomIndex = 2，number = [0, 1, 6, 3, 4, 5, 2]
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

// 用controller呼叫函式渲染畫面
controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => { // 將每一張卡片都掛上監聽器
    controller.dispatchCardAction(card)
  })
})