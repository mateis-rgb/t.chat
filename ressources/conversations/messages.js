try {
	const fs = require('fs');
	const sha1 = require('sha1');
	const $ = require('jquery');
	const sorting = require('../store/sorting');
	const { app, session, Notification } = require('electron');
	const mysql = require('mysql');

	if (sessionStorage.getItem('user')) {
		var GetUser = sessionStorage.getItem('user');
		user = JSON.parse(GetUser);
	}
	
	if (!user.id) window.location.href = "../index.html";

	function autoscroll () {
		// const $messages = document.querySelector('#messagesConversation');
		// $messages.scrollTop = $messages.scrollHeight;
	
		$("#conversations").stop().animate({
			scrollTop: $("#conversations")[0].scrollHeight
		}, 500);
	}

	function getUsers() {
		fs.readFile('ressources/auth/users.json', function (err, data) {
			if (err) throw err;
			else {
				var file = JSON.parse(data);
				var userLength = file.users.length;
				
				var parent = document.getElementById('users');
				parent.className = "list-group";
				
				file.users.forEach(element => {
					if (element.id != user.id) {
						var child = document.createElement('div');
						var childBadge = document.createElement('span');

						parent.appendChild(child);
						
						child.innerHTML = `<div onclick="openConv(`+ element.id +`)" style="cursor: pointer;">` + element.email + `</div>`;
						child.className = "list-group-item d-flex justify-content-between align-items-center";
						child.appendChild(childBadge);

						childBadge.innerHTML = Math.floor(Math.random() * 10);
						childBadge.className = "badge rounded-pill bg-primary";
					}
				});

			}
		});
	}

	function getMessage(from_id, to_id) {
		fs.readFile('./ressources/conversations/conv.json', function (err, data) {
			if (err) throw err;
			else {
				var file = JSON.parse(data);

				var GetTo = sessionStorage.getItem('to');
				to = JSON.parse(GetTo);

				
				file.conversations.forEach(msg => {
					if ((msg.from_id == from_id && msg.to_id == to_id) || (msg.from_id == to_id && msg.to_id == from_id)) {
						var child = document.createElement('div');
						var messageArea = document.getElementById('messagesConversation');
						messageArea.appendChild(child);

						if (msg.to_id == to_id) {
							child.innerHTML = "<p> <strong>Moi</strong> <br>" + msg.content + "</p>";
							child.className = "col-md-10 offset-md-2 text-right";
							child.style = "text-align: right !important;";
							child.id = "from";
						}
						else {
							child.innerHTML = "<p> <strong>" + to.name + "</strong> <br>" + msg.content + "</p>";
							child.className = "col-md-10";
							child.id = "to";
						}

					}
				});

				autoscroll();
			}
		});
	}
	
	function sendMessage() {
		fs.readFile('./ressources/conversations/conv.json', function (err, data) {
			if (err) throw err;
			else {
				var fieldFrom = document.getElementById('fieldFrom');
				var from = user;
				var content = fieldFrom.value;
				var date = new Date().toUTCString();

				var file = JSON.parse(data);

				var GetTo = sessionStorage.getItem('to');
				to = JSON.parse(GetTo);
				
				file.conversations.push({
					"id": file.conversations.length + 1,
					"from_id": from.id,
					"to_id": to.id,
					"content": content,
					"created_at": date
				});

				var json = JSON.stringify(file, null, "\t");

				fieldFrom.value = "";

				var child = document.createElement('div');
				var messageArea = document.getElementById('messagesConversation');

				messageArea.appendChild(child);

				child.innerHTML = `<div class="col-md-10 offset-md-2 text-right" style="text-align: right !important;">
							<p>
								<strong>Moi</strong> <br>
								`+ content +`
							</p>
						</div>`;
				child.id = 'from';

				sessionStorage.setItem('toMessageId', from.id);
				sessionStorage.setItem('toMessage', to.name + ' : ' + content);
				sessionStorage.setItem('contentMessage', content);

				fs.writeFile('./ressources/conversations/conv.json', json, function (err) {
					if (err) throw err;
				});

				autoscroll();
			}
		});
	
	}

	function openConv(to_id) {
		// define live state => setLiveState(state)

		fs.readFile('./ressources/auth/users.json', function(err, data) {
			if (err) throw err;
			else {
                const file = JSON.parse(data);

				result = file.users.find(usr => {
					return usr.id === to_id;
				});
				
				if (sessionStorage.getItem("to") !== undefined) {
					sessionStorage.removeItem("to");
					var to = {
						"id": result.id,
						"name": result.name,
						"email": result.email,
					}
					sessionStorage.setItem("to", JSON.stringify(to));
					
					var to = {
						"id": result.id,
						"name": result.name,
						"email": result.email,
					}
					sessionStorage.setItem("to", JSON.stringify(to));
					
					var messageBox = document.getElementById('messageArea');

					messageBox.innerHTML = `<div class="card">
						<div class="card-header">${to.name} ${ to.state == "online" ? '<i class="bi bi-circle-fill" style="color: green;"></i>' : '' }</div>
						<div class="card-body">
							<div id="conversations" class="row">
								<p class="fs-6 text-muted text-center">Start of conversation with <span class="text-decoration-underline">`+ to.name +`</span></p>
								<div id="messagesConversation"></div>
							</div>
							
							<hr>

							<div class="form-group fixed">
								<input id="fieldFrom" placeholder="Your message..." class="form-control"> <br>
							</div>
							<button type="button" class="btn btn-primary" onclick="sendMessage()">Send</button>
						</div>
					</div>`;

					getMessage(user.id, to_id);
				}
			}
		});
	}
	
	function exitConv(where) {
		switch (where) {
			case "home":
				sessionStorage.removeItem('to');
				// setLiveState('offline');
				window.location.href = '../index.html';
				
				break;

			case "disconnect":
				sessionStorage.removeItem('to');
				// setLiveState('offline');
				window.location.href = '../auth/disconnect.html';	

				break;

			default:
				sessionStorage.removeItem('to');
				// setLiveState('offline');
				window.location.href = './index.html';
				
				break;
		}
	}

	

	// function setLiveState(value) {
	// 	fs.readFile("./ressources/auth/users.json", (err, data) => {
	// 		if (err) throw err;

	// 		data = JSON.parse(data);
	// 		users = data.users;

	// 		users.forEach(element => {
	// 			if (element.id == user.id) {
	// 				element.state = value;
	// 			}
	// 		});

	// 		data = JSON.stringify({ "users": users }, "", "\t");

	// 		fs.writeFile("./ressources/auth/users.json", data, "utf-8", (err) => {
	// 			if (err) throw err;
	// 		})
	// 	});
	// }
		
	addEventListener("keydown", function (e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			sendMessage();
		}
	});
	
	// developpement de ces fonction en dernier
	// function delMessage() {}
	// function sendFile() {}


	fs.watchFile("./ressources/conversations/conv.json", (curr, prev) => {
		document.querySelector("div#messagesConversation").innerHTML = "";

		getMessage(user.id, to.id);
	});

	// liveState
	// fs.watchFile("./ressources/auth/users.json", (curr, prev) => {
	// 	fs.readFile("./ressources/auth/users.json", (err, data) => {
	// 		if (err) throw err;

	// 		data = JSON.parse(data);
	// 		users = data.users;

	// 		users.forEach(element => {
	// 			if (element.id == user.id) {
	// 				sessionStorage.setItem("user", JSON.stringify(element));
	// 				user = element;
	// 			}
	// 		});
	// 	});
	// });
}
catch (err) {
	if (err) throw err;
}