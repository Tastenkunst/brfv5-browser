(function() {

  var events      = window.artov5.events;
  var faceLost    = true;

  var onFaceLost  = function() {

    console.log('Face lost: Show scanning instructions now.')
  }

  events.onBRFv5Tracked = function(faces) {

    for(let i = 0; i < faces.length; i++) {

      const face = faces[i]

      if(face.show) {

        faceLost = false

      } else {

        if(!faceLost) {

          faceLost = true;

          onFaceLost()
        }
      }
    }
  }

})();
