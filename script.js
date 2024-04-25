evalInput = () => {

	const input = document.getElementById('jsonInput').value;
  var cursorPosition = document.getElementById("jsonInput").selectionStart;

  const parser = clarinet.parser();
  
  const stack = [];

  parser.onopenobject = key => {  
  	if (stack.length && stack[stack.length-1].type == 'a') {
    	stack[stack.length-1].index ++;
    }
		stack.push({'type': 'o'})
    stack.push({'type': 'k', 'value': key});
  };

  parser.onopenarray = () => {
    if (stack.length && stack[stack.length-1].type == 'a') {
    	stack[stack.length-1].index ++;
    }
 
		stack.push({'type': 'a', 'index': 0});
  };

  parser.onkey = key => {
		stack.push({'type': 'k', 'value': key});
  };

  parser.onvalue = value => {
  	let vStart = 0;
    let vEnd = 0;
    if (typeof value == 'string') {
    	vStart = parser.position - value.length - 2;
      vEnd = parser.position - 2;
    } else if (typeof value == 'number' || typeof value == 'boolean') {
      vStart = parser.position - (value + '').length;
	    vEnd = parser.position;
    } else if (value == null) {
      vStart = parser.position - 4;
			vEnd = parser.position;
    }
    if (cursorPosition > vStart && cursorPosition < vEnd) {
    	 console.log(value + ':\t', toJsonPath(stack));
       // TODO: abort parsing
    }
		if (stack.length && stack[stack.length-1].type == 'k') {
    	stack.pop();
    }
  };

  parser.oncloseobject = () => {
    stack.pop();
    if (stack.length && stack[stack.length-1].type == 'a') {
    	stack[stack.length-1].index ++;
    }
    if (stack.length && stack[stack.length-1].type == 'k') {
    	stack.pop();
    }
  };

  parser.onclosearray = () => {
    stack.pop();
    if (stack.length && stack[stack.length-1].type == 'a') {
    	stack[stack.length-1].index ++;
    }
    if (stack.length && stack[stack.length-1].type == 'k') {
    	stack.pop();
    }
  };


  parser.write(input).close();
}

toJsonPath = stack => {

	let path = '$';
  
  if (!stack || !stack.length) {
  	return path;
  }
  
  for (let i = 0; i < stack.length; i++) {
  	const item = stack[i];
    if (item.type == 'a') {
    	path += '[' + item.index + ']';
    } else if (item.type == 'k') {
    	path += '.[\'' + item.value + '\']';
    }
  }
  
  return path;
};


