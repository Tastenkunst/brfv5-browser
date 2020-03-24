(function() {

  var waitForARTOv5 = function() {

    if(window.initARTOv5 && window.initARTOv5UI) {

      window.initARTOv5(window.artov5)
      window.initARTOv5UI(window.artov5)

    } else {

      setTimeout(waitForARTOv5, 100)
    }
  }

  waitForARTOv5()

})();
