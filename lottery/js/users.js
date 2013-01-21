var users = '';

for(var i = 0; i < 400; i++) {
	users += "抽奖"+i+",";
}

users = users.substr(0, users.length-1);
console.log(users);