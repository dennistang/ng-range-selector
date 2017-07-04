import Angular from 'angular';
import { rangeSelector } from './range-selector';
import { draggable } from './draggable';

export const APP = Angular.module('app', []);

APP.controller('rangeController', function() {
  this.range = {
    low: 20,
    high: 80,
    min: 0,
    max: 100,
  };

  this.rangeFloat = {
    low: 15000,
    high: 18000,
    min: 12000,
    max: 29875,
  };
});

APP.component('rangeSelector', rangeSelector).directive('draggable', draggable);
