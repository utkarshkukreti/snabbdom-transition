import { h } from 'snabbdom';

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

const addClass = (elm, classes) => {
  classes = classes.split(/\s+/);
  for (let i = 0; i < classes.length; i++) {
    elm.classList.add(classes[i]);
  }
};

const removeClass = (elm, classes) => {
  classes = classes.split(/\s+/);
  for (let i = 0; i < classes.length; i++) {
    elm.classList.remove(classes[i]);
  }
};

export const create = (oldVnode, vnode) => {
  const t = vnode.data.transition;
  if (t) {
    const elm = vnode.elm;
    removeClass(elm, t.enter);
    removeClass(elm, t.enterActive);
    removeClass(elm, t.enterTo);
    addClass(elm, t.enter);
    addClass(elm, t.enterActive);
  }
};

export const insert = vnode => {
  const t = vnode.data.transition;
  if (t) {
    const elm = vnode.elm;
    removeClass(elm, t.enterTo);
    nextFrame(() => {
      removeClass(elm, t.enter);
      addClass(elm, t.enterTo);
    });
    onEnd(elm, () => {
      removeClass(elm, t.enterTo);
      removeClass(elm, t.enterActive);
    });
  }
};

export const remove = (vnode, callback) => {
  const t = vnode.data.transition;
  if (t) {
    const elm = vnode.elm;
    removeClass(elm, t.leave);
    removeClass(elm, t.leaveActive);
    removeClass(elm, t.leaveTo);
    addClass(elm, t.leave);
    addClass(elm, t.leaveActive);
    nextFrame(() => {
      removeClass(elm, t.leave);
      addClass(elm, t.leaveTo);
    });
    onEnd(elm, () => {
      removeClass(elm, t.leaveTo);
      removeClass(elm, t.leaveActive);
      callback();
    });
  }
};

export const update = (oldVnode, vnode) => {
  const t = vnode.data.transition;
  if (t) {
    const oldRect = oldVnode.data.transitionGroupRect;
    if (oldRect) {
      const elm = oldVnode.elm;
      removeClass(elm, t.move);
      nextFrame(() => {
        const newRect = elm.getBoundingClientRect();
        const dx = oldRect.x - newRect.x;
        const dy = oldRect.y - newRect.y;
        if (dx || dy) {
          elm.style.transform = `translate(${dx}px, ${dy}px)`;
          nextFrame(() => {
            addClass(elm, t.move);
            elm.style.transform = '';
            onEnd(elm, () => {
              removeClass(elm, t.move);
            });
          });
        }
      });
    }
  }
};

export const nextFrame = requestAnimationFrame || setTimeout;

export const onEnd = (elm, callback) => {
  let remaining = countAnimationsAndTransitions(elm);
  if (remaining === 0) return callback();
  const listener = event => {
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
const countAnimationsAndTransitions = elm => {
  const styles = window.getComputedStyle(elm);
  const transitionDelays = styles['transitionDelay'].split(', ');
  const transitionDurations = styles['transitionDuration'].split(', ');
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = styles['animationDelay'].split(', ');
  const animationDurations = styles['animationDuration'].split(', ');
  const animationTimeout = getTimeout(animationDelays, animationDurations);

  let count = 0;
  if (transitionTimeout > 0) count += transitionDurations.length;
  if (animationTimeout > 0) count += animationDurations.length;
  return count;

  function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(
      null,
      durations.map((d, i) => {
        return toMs(d) + toMs(delays[i]);
      })
    );
  }

  function toMs(s) {
    return Number(s.slice(0, -1)) * 1000;
  }
};

const normalize = o => {
  o = o ? (typeof o === 'string' ? { prefix: o } : o) : { prefix: 's' };
  const prefix = o.prefix;

  if (!o.enter) o.enter = `${prefix}-enter`;
  if (!o.enterActive) o.enterActive = `${prefix}-enter-active`;
  if (!o.enterTo) o.enterTo = `${prefix}-enter-to`;
  if (!o.leave) o.leave = `${prefix}-leave`;
  if (!o.leaveActive) o.leaveActive = `${prefix}-leave-active`;
  if (!o.leaveTo) o.leaveTo = `${prefix}-leave-to`;
  if (!o.move) o.move = `${prefix}-move`;

  return o;
};

export const Transition = (o, sel, data, children) => {
  data.transition = normalize(o);
  data.hook = { create, insert, update, remove };
  return h(sel, data, children);
};

export const TransitionGroup = (o, sel, data, children) => {
  const update = (oldVnode, vnode) => {
    for (let i = 0; i < oldVnode.children.length; i++) {
      const child = oldVnode.children[i];
      child.data.transitionGroupRect = child.elm.getBoundingClientRect();
    }
  };
  data.hook = { update };
  return h(
    sel,
    data,
    children.map(child => {
      return Transition(o, child.sel, child.data, child.children);
    })
  );
};
