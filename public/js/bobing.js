
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


// A base class is defined using the new reserved 'class' keyword
class MainChat  {
	// constructor
	constructor () {
		$('.messages-content').mCustomScrollbar();
		MainChat.LoadEventHandlers();		
	}
	
	static insertMessage() {
	  // tell server to execute 'sendchat' and send along one parameter
	  socket.emit('sendchat', msg);
	}
		
	static LoadEventHandlers() {
			// listener, whenever the server emits 'updatechat', this updates the chat body
			socket.on('updatechat',  (username, data) => {
			});
			
			// on connection to server, ask for user's name with an anonymous callback
      let name = localStorage.getItem('bobing-name');
      if (!name) {
        name = prompt("请输入你的 名字+学校+入学年级 开始");
        localStorage.setItem('bobing-name', name)
        socket.on('connect', () => socket.emit('adduser', name));
      }
      $('.chat-title').html('<h2>欢迎，' + name + '</h2>')
      let results = JSON.parse(localStorage.getItem('bobing-results'))
      if (results.length > 0) {
        let resultsHtml = results.map( result => '<div><span>' + result.map(i => '<img src="/public/img/' + (i+1) + '.jpg" />').join('</span><span>') + '</span></div>').join('')
        $('.my-results').html('<h3>你的摇色子记录</h3>' + resultsHtml)
      }
	}
	
	static updateScrollbar() {
		$('.messages-content').mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
			scrollInertia: 10,timeout: 0
		});
	}
}










