evalInput = () => {

	const input = document.getElementById('jsonInput').value;
  var cursorPosition = document.getElementById("jsonInput").selectionStart;
  let matched = false;

  // https://github.com/dscape/clarinet
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
      vEnd = input.substring(0, parser.position).lastIndexOf('"') + 1;
      vStart = vEnd - value.length - 1;
    } else if (typeof value == 'number') {
      vEnd = parser.position - 1;
      vStart = vEnd - ('' + value).length;
    } else {
      vEnd = parser.position;
      vStart = vEnd - ('' + value).length;
    }

    if (cursorPosition >= vStart && cursorPosition <= vEnd) {
      document.getElementById('value').value = value + '';
      document.getElementById('path').value = toJsonPath(stack);

      matched = true;

      const jsonObject = JSON.parse(input);
      const result = jsonpath.query(jsonObject, toJsonPath(stack));

      document.getElementById('check').value = result.length ? result[0] + '' : result + '';

      //console.log(value, '\t', result, '\t', toJsonPath(stack));
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

  if (!matched) {
    document.getElementById('value').value = 'Select a value';
    document.getElementById('check').value = '';
    document.getElementById('path').value = '';
  }
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
      if (/^[$_a-zA-Z]+[$_a-zA-Z0-9]*$/.test(item.value)) {
        path += '.' + item.value;
      } else {
        path += '["' + item.value + '"]';  
      }
    }
  }
  
  return path;
};


formatJson = () => {
  const elem = document.getElementById('jsonInput');
  const formatted = JSON.stringify(JSON.parse(elem.value), undefined, 2);
  elem.value = formatted;
}

minifyJson = () => {
  const elem = document.getElementById('jsonInput');
  const formatted = JSON.stringify(JSON.parse(elem.value));
  elem.value = formatted;
}