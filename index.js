'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransitionGroup = exports.Transition = exports.onEnd = exports.nextFrame = exports.update = exports.remove = exports.insert = exports.create = undefined;

var _snabbdom = require('snabbdom');

/*
 * Source: https://vuejs.org/v2/guide/transitions.html#Transition-Classes
 *
 * There are six classes applied for enter/leave transitions.
 *
 * 1. v-enter: Starting state for enter. Added before element is inserted,
 * removed one frame after element is inserted.
 *
 * 2. v-enter-active: Active state for enter. Applied during the entire entering
 * phase. Added before element is inserted, removed when transition/animation
 * finishes. This class can be used to define the duration, delay and easing
 * curve for the entering transition.
 *
 * 3. v-enter-to: Ending state for enter. Added one frame after element is
 * inserted (at the same time v-enter is removed), removed when
 * transition/animation finishes.
 *
 * 4. v-leave: Starting state for leave. Added immediately when a leaving
 * transition is triggered, removed after one frame.
 *
 * 5. v-leave-active: Active state for leave. Applied during the entire leaving
 * phase. Added immediately when leave transition is triggered, removed when the
 * transition/animation finishes. This class can be used to define the duration,
 * delay and easing curve for the leaving transition.
 *
 * 6. v-leave-to: Ending state for leave. Added one frame after a leaving
 * transition is triggered (at the same time v-leave is removed), removed when
 * the transition/animation finishes.
*/

var addClass = function addClass(elm, classes) {
  classes = classes.split(/\s+/);
  for (var i = 0; i < classes.length; i++) {
    elm.classList.add(classes[i]);
  }
};

var removeClass = function removeClass(elm, classes) {
  classes = classes.split(/\s+/);
  for (var i = 0; i < classes.length; i++) {
    elm.classList.remove(classes[i]);
  }
};

var create = exports.create = function create(oldVnode, vnode) {
  var t = vnode.data.transition;
  if (t) {
    var elm = vnode.elm;
    removeClass(elm, t.enter);
    removeClass(elm, t.enterActive);
    removeClass(elm, t.enterTo);
    addClass(elm, t.enter);
    addClass(elm, t.enterActive);
  }
};

var insert = exports.insert = function insert(vnode) {
  var t = vnode.data.transition;
  if (t) {
    var elm = vnode.elm;
    removeClass(elm, t.enterTo);
    nextFrame(function () {
      removeClass(elm, t.enter);
      addClass(elm, t.enterTo);
    });
    onEnd(elm, function () {
      removeClass(elm, t.enterTo);
      removeClass(elm, t.enterActive);
    });
  }
};

var remove = exports.remove = function remove(vnode, callback) {
  var t = vnode.data.transition;
  if (t) {
    var elm = vnode.elm;
    removeClass(elm, t.leave);
    removeClass(elm, t.leaveActive);
    removeClass(elm, t.leaveTo);
    addClass(elm, t.leave);
    addClass(elm, t.leaveActive);
    nextFrame(function () {
      removeClass(elm, t.leave);
      addClass(elm, t.leaveTo);
    });
    onEnd(elm, function () {
      removeClass(elm, t.leaveTo);
      removeClass(elm, t.leaveActive);
      callback();
    });
  }
};

var update = exports.update = function update(oldVnode, vnode) {
  var t = vnode.data.transition;
  if (t) {
    var oldRect = oldVnode.data.transitionGroupRect;
    if (oldRect) {
      var elm = oldVnode.elm;
      removeClass(elm, t.move);
      nextFrame(function () {
        var newRect = elm.getBoundingClientRect();
        var dx = oldRect.x - newRect.x;
        var dy = oldRect.y - newRect.y;
        if (dx || dy) {
          elm.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
          nextFrame(function () {
            addClass(elm, t.move);
            elm.style.transform = '';
            onEnd(elm, function () {
              removeClass(elm, t.move);
            });
          });
        }
      });
    }
  }
};

var nextFrame = exports.nextFrame = requestAnimationFrame || setTimeout;

var onEnd = exports.onEnd = function onEnd(elm, callback) {
  var remaining = countAnimationsAndTransitions(elm);
  if (remaining === 0) return callback();
  var listener = function listener(event) {
    if (event.target === elm) remaining--;
    if (remaining === 0) {
      elm.removeEventListener('transitionend', listener);
      elm.removeEventListener('animationend', listener);
      callback();
    }
  };
  elm.addEventListener('transitionend', listener);
  elm.addEventListener('animationend', listener);
};

// Source: https://github.com/vuejs/vue/blob/59860b0a756526f37468655598c68d119f0e74bd/src/platforms/web/runtime/transition-util.js
var countAnimationsAndTransitions = function countAnimationsAndTransitions(elm) {
  var styles = window.getComputedStyle(elm);
  var transitionDelays = styles['transitionDelay'].split(', ');
  var transitionDurations = styles['transitionDuration'].split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = styles['animationDelay'].split(', ');
  var animationDurations = styles['animationDuration'].split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var count = 0;
  if (transitionTimeout > 0) count += transitionDurations.length;
  if (animationTimeout > 0) count += animationDurations.length;
  return count;

  function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i]);
    }));
  }

  function toMs(s) {
    return Number(s.slice(0, -1)) * 1000;
  }
};

var normalize = function normalize(o) {
  o = o ? typeof o === 'string' ? { prefix: o } : o : { prefix: 's' };
  var prefix = o.prefix;

  if (!o.enter) o.enter = prefix + '-enter';
  if (!o.enterActive) o.enterActive = prefix + '-enter-active';
  if (!o.enterTo) o.enterTo = prefix + '-enter-to';
  if (!o.leave) o.leave = prefix + '-leave';
  if (!o.leaveActive) o.leaveActive = prefix + '-leave-active';
  if (!o.leaveTo) o.leaveTo = prefix + '-leave-to';
  if (!o.move) o.move = prefix + '-move';

  return o;
};

var Transition = exports.Transition = function Transition(o, sel, data, children) {
  data.transition = normalize(o);
  data.hook = { create: create, insert: insert, update: update, remove: remove };
  return (0, _snabbdom.h)(sel, data, children);
};

var TransitionGroup = exports.TransitionGroup = function TransitionGroup(o, sel, data, children) {
  var update = function update(oldVnode, vnode) {
    for (var i = 0; i < oldVnode.children.length; i++) {
      var child = oldVnode.children[i];
      child.data.transitionGroupRect = child.elm.getBoundingClientRect();
    }
  };
  data.hook = { update: update };
  return (0, _snabbdom.h)(sel, data, children.map(function (child) {
    return Transition(o, child.sel, child.data, child.children);
  }));
};
