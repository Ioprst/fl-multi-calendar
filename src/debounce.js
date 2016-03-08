function debounce(callback, FuncDelay) {
  var delay = FuncDelay,
    params,
    context = this,
    timeoutObj;

  function timeoutFunc() {
    if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    callback.apply(context, params); //Call function with latest parameters
  }
  return function () {
    params = arguments;
    if (timeoutObj) {
      clearTimeout(timeoutObj);
    }
    timeoutObj = setTimeout(timeoutFunc, delay);

    //Now we return a function that allows the user to call the
    //method immediately and cancel any timeouts.
    //use it like myDebouncedFunc(arg1, arg2)("now!");
    return function (now) {
      if (now) {
        timeoutFunc();
      }
    };
  };
}
