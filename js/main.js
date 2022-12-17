import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js'
import {
  getColorBackground,
  getColorElementList,
  getColorListElement,
  getInActiveColorList,
  getPlayAgainButton,
} from './selectors.js'
import {
  createTimer,
  getRandomColorPairs,
  hidePlayAgainButton,
  setTimerText,
  showPlayAgainButton,
} from './utils.js'

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING
let timer = createTimer({
  second: GAME_TIME,
  onChange: handleTimerChange,
  onFinish: handleTimerFinish,
})

function handleTimerChange(second) {
  const fullSecond = `0${second}`.slice(-2)
  setTimerText(second)
}
function handleTimerFinish() {
  // end game
  gameStatus = GAME_STATUS.FINISHED
  setTimerText('GAME OVER! 😭')
  // show play again button
  showPlayAgainButton()
}

// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

function handleColorClick(liElement) {
  const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus)
  const isClicked = liElement.classList.contains('active')
  if (!liElement || isClicked || shouldBlockClick) return

  liElement.classList.add('active')

  // save clicked cell to selections
  selections.push(liElement)

  if (selections.length < 2) return

  // check isMatch
  const firstColor = selections[0].dataset.color
  const secondColor = selections[1].dataset.color
  const isMatch = firstColor === secondColor

  if (isMatch) {
    // Check win;
    const isWin = getInActiveColorList().length === 0
    const colorBackgroundElement = getColorBackground()
    colorBackgroundElement.style.backgroundColor = selections[0].dataset.color
    if (isWin) {
      // show button replay
      showPlayAgainButton()
      // show You Win
      setTimerText('YOU WIN! 🎉')

      // clearTimer
      timer.clear()

      // game status equal finished
      gameStatus = GAME_STATUS.FINISHED
    }

    selections = []
    return
  }

  // in case of not match
  // remove class active for 2 li elements
  gameStatus = GAME_STATUS.BLOCKING
  setTimeout(() => {
    selections[0].classList.remove('active')
    selections[1].classList.remove('active')

    // reset selection for the next turn
    selections = []

    // race-condition check with handleTimerFinish
    if (gameStatus !== GAME_STATUS.FINISHED) gameStatus = GAME_STATUS.PLAYING
  }, 500)
}

function initColors() {
  // random 8 pair of colors
  const colorList = getRandomColorPairs(PAIRS_COUNT)

  // bind o li > div.overlay
  const liList = getColorElementList()

  liList.forEach((liElement, index) => {
    liElement.dataset.color = colorList[index]
    const overlayElement = liElement.querySelector('.overlay')
    if (overlayElement) overlayElement.style.backgroundColor = colorList[index]
  })
}

function attachEventForColorList() {
  const ulElement = getColorListElement()
  if (!ulElement) return

  // Event delegation
  ulElement.addEventListener('click', (event) => {
    if (event.target.tagName !== 'LI') return
    handleColorClick(event.target)
  })
}

function resetGame() {
  // reset global var
  gameStatus = GAME_STATUS.PLAYING
  selections = []
  // reset Dom elements
  // - remove active class from li
  // - hide replay button
  // - clear you win / timeout text
  const colorElementList = getColorElementList()
  for (const colorElement of colorElementList) {
    colorElement.classList.remove('active')
  }
  hidePlayAgainButton()
  setTimerText('')
  // Re-generate new colors
  initColors()
  // start timer a new game
  startTimer()
}

function attachEventForPlayAgainButton() {
  const playAgainButton = getPlayAgainButton()
  if (!playAgainButton) return

  playAgainButton.addEventListener('click', resetGame)
}

function startTimer() {
  timer.start()
}

// main
;(() => {
  initColors()

  attachEventForColorList()

  attachEventForPlayAgainButton()

  startTimer()
})()
