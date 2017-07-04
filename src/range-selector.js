/**
* @ngdoc directive // Mark the object as a directive
* @name rangeSelector //start with the module name. the second part is always directive. the directive name goes after the the column
**/
function rangeSelectorController($scope, $element, $attrs, $timeout) {
  'ngInject';

  this.$onInit = () => {
    let $ctrl = this,
      lo = $element.find('lo').eq(0),
      hi = $element.find('hi').eq(0),
      bar = $element.find('bar').eq(0),
      band = $element.find('band').eq(0),
      barWidth = width(bar),
      containerWidth = width($element),
      controlWidth = width(lo),
      modelUpdateInProgress = false,
      updatePending, //a $timeout promise
      modelUpdateDelay = 250, //ms
      pixelsPerUnit = Math.ceil(barWidth / ($ctrl.range.max - $ctrl.range.min));

    $ctrl.ticks = [];
    if ($ctrl.numTicks) {
      for (let i = 0; i < $ctrl.numTicks - 1; i++) {
        $ctrl.ticks.push(i);
      }

      $ctrl.tickWidth = 100 / $ctrl.numTicks - 0.001 + '%';
    }

    $ctrl.updateBand = () => {
      let lowPx = right(lo);
      let highPx = left(hi);

      let width = highPx - lowPx;

      band.css({
        left: lowPx + 'px',
        width: width + 'px',
      });

      modelUpdateInProgress = true;
      $scope.$apply(
        $ctrl.updateRangeModel(lowPx - controlWidth, highPx - controlWidth)
      );
      modelUpdateInProgress = false;
    };

    $ctrl.updateRangeModel = (lowValueInPixels, highValueInPixels) => {
      let rangeInPixels = barWidth;
      let rangeInUnits = $ctrl.range.max - $ctrl.range.min;

      let lowAsPercentage = lowValueInPixels / rangeInPixels;
      let highAsPercentage = highValueInPixels / rangeInPixels;

      let lowInUnits = lowAsPercentage * rangeInUnits;
      let highInUnits = highAsPercentage * rangeInUnits;

      lowInUnits = Math.round(lowInUnits);
      highInUnits = Math.ceil(highInUnits);

      $ctrl.range.low = $ctrl.range.min + lowInUnits;
      $ctrl.range.high = $ctrl.range.min + highInUnits;
    };

    $ctrl.enforceSafeValues = () => {
      //ensure low and high are numbers
      if (isNaN($ctrl.range.low)) {
        $ctrl.range.low = $ctrl.range.min;
      }

      if (isNaN($ctrl.range.high)) {
        $ctrl.range.high = $ctrl.range.max;
      }

      //TODO: expose an attr to allow specifying rounding approach per range selector instance
      $ctrl.range.low = Math.round($ctrl.range.low);
      $ctrl.range.high = Math.round($ctrl.range.high);

      //enforce min and max values
      $ctrl.range.low = Math.max($ctrl.range.low, $ctrl.range.min);
      $ctrl.range.high = Math.min($ctrl.range.high, $ctrl.range.max);

      //ensure low <= high
      $ctrl.range.low = Math.min($ctrl.range.low, $ctrl.range.high);
      $ctrl.range.high = Math.max($ctrl.range.low, $ctrl.range.high);
    };

    $ctrl.updateRangeUI = () => {
      if (modelUpdateInProgress === true) return; //we are already processing a model change

      $ctrl.enforceSafeValues();

      let rangeInUnits = $ctrl.range.max - $ctrl.range.min;
      let lowValueInUnits = $ctrl.range.low - $ctrl.range.min;
      let highValueInUnits = $ctrl.range.high - $ctrl.range.min;
      let rangeInPixels = barWidth;
      let lowValueInPixels = Math.floor(
        lowValueInUnits / rangeInUnits * rangeInPixels
      );
      let highValueInPixels = Math.floor(
        highValueInUnits / rangeInUnits * rangeInPixels
      );

      let loLeft = lowValueInPixels; // + controlWidth;
      let hiLeft = highValueInPixels + controlWidth;

      lo[0].style.left = loLeft + 'px';
      hi[0].style.left = hiLeft + 'px';
      band[0].style.left = loLeft + 'px';
      band[0].style.width = hiLeft - loLeft + 'px';
    };

    $ctrl.debounceUpdateRangeUI = () => {
      if (updatePending) {
        $timeout.cancel(updatePending);
      }

      updatePending = $timeout($ctrl.updateRangeUI, modelUpdateDelay);
    };

    $ctrl.updateRangeUI();

    $ctrl.constrainLo = () => {
      return {
        roundPixelsToNearest: pixelsPerUnit,
        x: {
          min: () => {
            return 0;
          },
          max: () => {
            return left(hi) - controlWidth;
          },
        },
        y: {
          min: () => {
            return 0;
          },
          max: () => {
            return 0;
          },
        },
        callback: $ctrl.updateBand,
      };
    };

    $ctrl.constrainHi = () => {
      return {
        roundPixelsToNearest: pixelsPerUnit,
        x: {
          min: () => {
            return right(lo);
          },
          max: () => {
            return containerWidth - controlWidth;
          },
        },
        y: {
          min: () => {
            return 0;
          },
          max: () => {
            return 0;
          },
        },
        callback: $ctrl.updateBand,
      };
    };
  };

  this.$doCheck = () => {
    this.updateRangeUI();
  };
}

function left(elm) {
  return Math.floor(elm.prop('offsetLeft') || 0);
}

function right(elm) {
  return left(elm) + width(elm);
}

function width(elm) {
  return Math.floor(elm.prop('offsetWidth') || 0);
}

export let rangeSelector = {
  template: `
	<div class="range-selector" data-min="{{::$ctrl.range.min}}" data-max="{{::$ctrl.range.max}}">
	<lo draggable="$ctrl.constrainLo()"></lo>
	<hi draggable="$ctrl.constrainHi()"></hi>
	<ticks>
	<tick ng-repeat="i in $ctrl.ticks track by $index" style="width:{{::$ctrl.tickWidth}}"></tick>
	</ticks>
	<bar></bar>
	<band></band>
	</div>
	`,
  controller: rangeSelectorController,
  bindings: {
    range: '=',
    numTicks: '@',
  },
};
