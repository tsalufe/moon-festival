
let questions = []
let messages = ''
let answersByQuestion = {}
let correctAnswers = {}
let winners = {}

function loadMessages() {
  messages = $('#messages').val()
  let lines = messages.split("\n")
  let currentQuestion = "1"
  let i = 0
  let currentAnswers = []
  for(let i in lines) {
    lines[i] = lines[i].replace(/^ +| +$/g, '').replace(/[0-9]+:[0-9]+$/g, '').replace(/ +$/, '')
  }
  while( i < lines.length - 1) {
    if (isDivider(lines[i+1])) {
      let correctAnswer
      let dashesOnly = false
      while (i+1 < lines.length && lines[i+1].match(/^-+$/)) {
        dashesOnly = true
        i++
      }
      // Skip between "-----" and "------12.D----"
      if (dashesOnly && !isDivider(lines[i+1])) {
        while (i+1 < lines.length && !isDivider(lines[i+1])) {
          i++
        }
      }
      // "------12-----" starting
      let question = getQuestionFromDivider(lines[i+1])
      if (question) {
        currentAnswers = []
        currentQuestion = question
        i+=2
        continue
      }
      // "--------12.C-----" ending
      correctAnswer = getCorrectAnswerFromDivider(lines[i+1])
      if (correctAnswer) {
        currentQuestion = correctAnswer.question
        answersByQuestion[currentQuestion] = currentAnswers
        correctAnswers[currentQuestion] = currentAnswers.filter(answer => answer[1] == correctAnswer.answer)
        i+=2
        currentAnswers = []
        continue
      }
    } else if (isAnswer(lines[i+1])) {
      currentAnswers.push([lines[i], lines[i+1].replace(/[0-9. ]/g, '').toLowerCase()])
      i+=2
      continue
    }
    i++
  }
}

function isAnswer(line) {
  if (line.replace(/[0-9. ]/g, '').match(/^[a-z]$/i)) {
    return true
  }
  return false
}

function isDivider(line) {
  return line.match(/^(-+-|--+[0-9]+[ .]*[a-zA-Z]?-*)$/)
}

function getQuestionFromDivider(line) {
  let matched = line.match(/^-+([0-9]+)-+$/)
  if (!matched) {
    return null
  }
  return matched[1]
}

function getCorrectAnswerFromDivider(line) {
  let matched = line.match(/([0-9]+)[ .]*([a-zA-Z])/)
  if (!matched) {
    return null
  }
  return {
    question: matched[1],
    answer: matched[2].toLowerCase(),
  }
}

function selectQuestion() {
  let max = parseInt($('#max').val()) || 0
  if (max < 10) {
    return
  }
  let selected = 1 + Math.floor(Math.random() * max);
  let i = 0;
  while (questions.findIndex(q => q == selected) > -1) {
    selected = 1 + Math.floor(Math.random() * max)
  }
  questions.push(selected)
  showSelectedQuestion(selected)
  showWinnersForQuestion(selected)
}

function showSelectedQuestion(selected) {
  $('.selected-questions').append('<span>' + selected + '</span>')
}

function showWinnersForQuestion(selected) {
  let currentWinners = correctAnswers[selected] || []
  names = currentWinners.map(winner => winner[0]).sort()
  let div = document.createElement('div')
  $('.winners-by-question').append(div)
  names = names.filter((name, i) => names.indexOf(name) == i)
  $(div).html('<h3>' + selected + '</h3>' + '<div>' + names.join('</div><div>') + '</div>')
  for(let i in names) {
    let name = names[i]
    if (name in winners) {
      winners[name] += 1
    } else {
      winners[name] = 1
    }
  }
  let sorted = Object.keys(winners).sort((a, b) => winners[b] - winners[a])
  let html = sorted.map(winner => '<div class="winner"><div class="winner-name">' + winner + '</div><div class="winner-score">' + winners[winner] + '</div></div>').join('')
  $('.winners').html(html)
}