import * as snabbdom from 'snabbdom';
import { Transition, TransitionGroup } from '..';

const { h } = snabbdom;

const patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default,
]);

const run = f => {
  let node = document.createElement('div');
  document.body.appendChild(node);
  const render = () => {
    const vnode = f(render);
    node = patch(node, vnode);
  };
  render();
};

(() => {
  let show = true;
  run(render =>
    h('div.demo', {}, [
      h(
        'button',
        {
          on: {
            click: () => {
              show = !show;
              render();
            },
          },
        },
        ['Toggle']
      ),
      show ? Transition('fade', 'p', {}, ['hello']) : null,
    ])
  );
})();

(() => {
  let show = true;
  run(render =>
    h('div.demo', {}, [
      h(
        'button',
        {
          on: {
            click: () => {
              show = !show;
              render();
            },
          },
        },
        ['Toggle']
      ),
      show ? Transition('slide-fade', 'p', {}, ['hello']) : null,
    ])
  );
})();

(() => {
  let show = true;
  run(render =>
    h('div.demo', {}, [
      h(
        'button',
        {
          on: {
            click: () => {
              show = !show;
              render();
            },
          },
        },
        ['Toggle']
      ),
      show
        ? Transition('bounce', 'p', {}, [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris facilisis enim libero, at lacinia diam fermentum id. Pellentesque habitant morbi tristique senectus et netus.',
          ])
        : null,
    ])
  );
})();

(() => {
  let show = true;
  run(render =>
    h('div.demo', {}, [
      h(
        'button',
        {
          on: {
            click: () => {
              show = !show;
              render();
            },
          },
        },
        ['Toggle']
      ),
      show
        ? Transition(
            {
              enterActive: 'animated tada',
              leaveActive: 'animated bounceOutRight',
            },
            'p',
            {},
            ['Hello']
          )
        : null,
    ])
  );
})();

(() => {
  let array = [1, 2, 3, 4, 5, 6, 7, 8, 9],
    next = 10;
  const randomIndex = () => Math.floor(Math.random() * array.length);
  run(render =>
    h('div.demo', {}, [
      h(
        'button',
        {
          on: {
            click: () => {
              array.splice(randomIndex(), 0, next++);
              render();
            },
          },
        },
        ['Add']
      ),
      h(
        'button',
        {
          on: {
            click: () => {
              array.splice(randomIndex(), 1);
              render();
            },
          },
        },
        ['Remove']
      ),
      TransitionGroup(
        'list',
        'p',
        {},
        array.map(x => h('span', { class: { 'list-item': true }, key: x }, [x]))
      ),
    ])
  );
})();

(() => {
  const shuffle = array => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };
  let array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  run(render =>
    h('div.demo', {}, [
      JSON.stringify(array),
      h(
        'button',
        {
          on: {
            click: () => {
              shuffle(array);
              render();
            },
          },
        },
        ['Shuffle']
      ),
      TransitionGroup(
        'flip-list',
        'ul',
        {},
        array.map(x => h('li', { key: x }, [x]))
      ),
    ])
  );
})();

(() => {
  const shuffle = array => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };

  const cells = Array.apply(null, { length: 81 }).map(function(_, index) {
    return {
      id: index,
      number: (index % 9) + 1,
    };
  });

  run(render =>
    h('div.demo.sudoku', {}, [
      h(
        'button',
        {
          on: {
            click: () => {
              shuffle(cells);
              render();
            },
          },
        },
        ['Shuffle']
      ),
      TransitionGroup(
        'cell',
        'div.container',
        {},
        cells.map(cell => h('div.cell', { key: cell.id }, [cell.number]))
      ),
    ])
  );
})();
