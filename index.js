"use strict";

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

app.use('/public', express.static('public'))

app.get('/', (req, res) =>  {
  res.sendFile(__dirname + '/'); 
});

app.get('/bobing', (req, res) =>  {
  res.sendFile(__dirname + '/bobing.html'); 
});

app.get('/dice', (req, res) =>  {
  res.sendFile(__dirname + '/dice.html'); 
});

app.get('/lines', (req, res) =>  {
  res.sendFile(__dirname + '/lines.html'); 
});


// usernames which are currently connected to the chat
let usernames = {};

const check_key = v =>{
	let val = '';	
	for(let key in usernames){
		if(usernames[key] == v)	val = key;
	}
	return val;
}

let winners = []

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

function handleResult(socket, data) {
	io.emit('updatechat', socket.username, data)
	let winTitle = getWinTitle(data.result)
	if (winTitle[0] < 4) {
		winners.push({
			name: data.name,
			title: winTitle[1],
		})
	}
	io.emit('updatewinners', socket.username, winners)
}

io.on('connection',  socket => {
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', data => handleResult(socket, data));
	
	socket.on('bobingcontrol', data => io.emit('bobingcontrol', socket.username, 'start'));

	socket.on('reset', data => {
		winners.splice(0)
		for(let i in usernames) {
			delete usernames[i]
		}
	})

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', username => {
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = socket.id;
		// echo to client they've connected
		//socket.emit('updatechat', 'Chat Bot', socket.username + ' you have joined the chat');
		io.emit('updatechat', 'Chat Bot', `${socket.username} 加入 ${Object.keys(usernames).length}`);
		// echo to client their username
		socket.emit('store_username', username);
		// echo globally (all clients) that a person has connected
		//socket.broadcast.emit('updatechat', 'Chat Bot', `${username} has connected`);
	});
});

http.listen(3000, () => console.log('listening on *:3000'));
    