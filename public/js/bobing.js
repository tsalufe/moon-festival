
'use strict';

let Fake, i=0, my_username = '';	
const socket = io();		

let chat

$(document).ready( () => {	
	chat = new MainChat();
});

var dicefun = {
	init:function(){
		var container = document.getElementById('dicebox');
		$('.redpacket').remove();
		var arr = this.randomFun();
    let prevResults = localStorage.getItem('bobing-results') || '[]'
    let results = JSON.parse(prevResults)
    results.push(arr)
    localStorage.setItem('bobing-results', JSON.stringify(results))
		for (var i = 0 ; i<6;i++) {
			container.appendChild(this.createDice(arr[i]+1,i));
		}
    localStorage.setItem('bobing-control', 'stop')
    $('#start').hide()
    setTimeout(() => {
      MainChat.showHistory(results)
      MainChat.sendResult(localStorage.getItem('bobing-name'), arr)
    }, 1500)
	},
	randomFun:function(){
		var arr = [];
		for (var i = 0 ; i<6;i++ ) {
			arr.push(Math.floor(Math.random()*6));
		}
		return arr;
	},
	createDice:function(num,i){
		var image = document.createElement('img');
    image.setAttribute("class","redpacket");
    image.id = "redpacket" + i;
    image.src = 'public/img/' + num +'.jpg';
    return image;
	},
}

function getWinTitle(result) {
  let resultStr = result.sort().join('')
  if (resultStr === '003333') {
    return [0, '金花']
  } else if (resultStr === '333333') {
    return [1, '状元-六杯红']
  } else if (resultStr === '000000') {
    return [1, '状元-遍地锦']
  } else if (resultStr === '111111') {
    return [1, '状元-黑六勃']
  } else if (resultStr === '033333') {
    return [1, '状元-五红']
  } else if (resultStr === '012345') {
    return [2, '榜眼-对堂']
  } else if (result.filter(x => x == 1).length === 5) {
    return [1, '状元-五子登科']
  } else if (result.filter(x => x == 3).length === 4) {
    return [1, '状元-四点红']
  } else if (result.filter(x => x == 3).length === 3) {
    return [3, '探花-三红']
  } else if (result.filter(x => x == 1).length === 4) {
    return [4, '进士-四进']
  } else if (result.filter(x => x == 3).length === 2) {
    return [5, '举人-二举']
  } else if (result.filter(x => x == 3).length === 1) {
    return [6, '秀才-一秀']
  }
  return [7, '中秋快乐']
}

function getBestResult(results) {
  return results.reduce((carry, value) => {
    if (carry.length == 0) {
      return value
    }
    let carryTitle = getWinTitle(carry)
    let valueTitle = getWinTitle(value)
    if (valueTitle[0] < carryTitle[0]) {
      return value
    }
    return carry
  }, [])
}

// A base class is defined using the new reserved 'class' keyword
class MainChat  {
	// constructor
	constructor () {
		$('.messages-content').mCustomScrollbar();
		MainChat.LoadEventHandlers();		
	}
	
	static sendResult(name, result) {
	  // tell server to execute 'sendchat' and send along one parameter
	  socket.emit('sendchat', {
      name: name,
      result: result,
    });
	}
		
	static LoadEventHandlers() {
			// listener, whenever the server emits 'updatechat', this updates the chat body
			socket.on('updatechat',  (username, data) => {
        if (typeof data === 'string') {
          $('.message-box').prepend('<div>' + data + '</div>')
        } else if (data.result) {
          MainChat.renderMessage(data)
        }
			});
			socket.on('updatewinners',  (username, winners) => {
        MainChat.renderWinners(winners)
			});
      if (localStorage.getItem('bobing-control') == 'start') {
        $('#start').show()
      }
      if (localStorage.getItem('bobing-name') === '叶树扬 南大 08' || localStorage.getItem('bobing-admin') == 'admin') {
        $('#new-game').show()
      }
			socket.on('bobingcontrol',  (username, status) => {
        if (status == 'start') {
          localStorage.setItem('bobing-control', 'start')
          $('#start').show()
        } else {
          localStorage.setItem('bobing-control', 'stop')
          $('#start').hide()
        }
			});
      socket.on('reset', (username, status) => {
        localStorage.removeItem('bobing-name')
        localStorage.removeItem('bobing-results')
        localStorage.removeItem('bobing-control')
      })
			
			// on connection to server, ask for user's name with an anonymous callback
      let name = localStorage.getItem('bobing-name');
      if (!name) {
        name = prompt("请输入你的中文 名字+学校+入学年级 开始");
        while (!name || name.match(/[a-z]+/)) {
          name = prompt("请输入你的中文 名字+学校+入学年级 开始");
        }
        if (name) {
          localStorage.setItem('bobing-name', name)
        }
        if (localStorage.getItem('bobing-name') === '叶树扬 南大 08') {
          $('#new-game').show()
        }
        socket.on('connect', () => socket.emit('adduser', name));
      }
      $('.chat-title').html('<h2>欢迎，' + name + '</h2>')
      let results = JSON.parse(localStorage.getItem('bobing-results')) || []
      MainChat.showHistory(results)
	}

  static showHistory(results) {
    if (results.length > 0) {
      let resultsHtml = results.map( result => MainChat.getResultAsDices(result, true)).join('')
      $('.my-results').html('<h3>你的摇色子记录</h3>' + resultsHtml)
    }
  }
	
	static updateScrollbar() {
		$('.messages-content').mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
			scrollInertia: 10,timeout: 0
		});
	}

  static renderWinners(winners) {
    let html = winners.map(winner => '<div class="winner-card"><div class="winner-name">' + winner.name + '</div><div class="winner-title">' + winner.title +'</div></div>').join('')
    $('.winner-board').html(html)
  }
  
  static renderMessage(message) {
    let html = '<div class="message-row"><div class="message-name">' + message.name + '</div><div class="message-result">' + MainChat.getResultAsDices(message.result) +'</div><div class="message-title">' + getWinTitle(message.result)[1] +'</div></div>'
    $('.message-box').prepend(html)
  }

  static getResultAsDices(result, withTitle = false) {
    return '<div class="bobing-result"><span>' + result.sort().map(i => '<img src="/public/img/' + (i+1) + '.jpg" />').join('</span><span>') + '</span>' + (withTitle ? '&nbsp;&nbsp;&nbsp;&nbsp;<span>' + getWinTitle(result)[1] + '</span>' : '') + '</div>'
  }

  static controlGame(status) {
    if (status == 'start') {
      $('#start').show()
    }
    $('#start').hide()
  }

  static newgame() {
    socket.emit('bobingcontrol', 'start');
  }
}