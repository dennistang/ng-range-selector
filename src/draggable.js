/**
* @ngdoc directive
* @name draggable
**/
export const draggable = function($document) {
  'ngInject';

  let endTypes = 'touchend touchcancel mouseup mouseleave',
    moveTypes = 'touchmove mousemove',
    startTypes = 'touchstart mousedown';

  let normalisePoints = function(event) {
    event = event.touches ? event.touches[0] : event;
    return {
      pageX: event.pageX,
      pageY: event.pageY,
    };
  };

  return {
    restrict: 'A',
    link: link,
    scope: {
      constrain: '&draggable',
    },
  };

  function link($scope, $element, $attrs) {
    let $elementStartX = 0,
      $elementStartY = 0,
      interactionStart = {
        pageX: 0,
        pageY: 0,
      };

    $document.on(endTypes, function(event) {
      event.preventDefault();
      $document.off(moveTypes, handleMove);
    });

    $element.on(startTypes, function(event) {
      event.preventDefault();

      $elementStartX = parseInt($element.css('left'));
      $elementStartY = parseInt($element.css('top'));
      interactionStart = normalisePoints(event);

      if (isNaN($elementStartX)) $elementStartX = 0;

      if (isNaN($elementStartY)) $elementStartY = 0;

      $document.on(moveTypes, handleMove);
    });

    function handleMove(event) {
      event.preventDefault();

      let interactionCurrent = normalisePoints(event);

      let x = Math.floor(
        $elementStartX + (interactionCurrent.pageX - interactionStart.pageX)
      );
      let y = Math.floor(
        $elementStartY + (interactionCurrent.pageY - interactionStart.pageY)
      );

      //enforce constraints
      let c = $scope.constrain();
      y = Math.min(y, c.y.max());
      y = Math.max(y, c.y.min());
      x = Math.min(x, c.x.max());
      x = Math.max(x, c.x.min());

      $element.css({
        left: x + 'px',
        top: y + 'px',
      });

      c.callback();
    }
  }
};
