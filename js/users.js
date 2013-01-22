var users = '';

for(var i = 0; i < 100; i++) {
	users += "抽奖"+i+",";
}

users = users.substr(0, users.length-1);