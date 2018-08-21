import * as snabbdom from 'snabbdom';
import { Transition, TransitionGroup } from '..';

const { h } = snabbdom;

const patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default,
]);

const all = [
  'All their equipment and instruments are alive.',
  'A red flair silhouetted the jagged edge of a wing.',
  'I watched the storm, so beautiful yet terrific.',
  'Almost before we knew it, we had left the ground.',
  'A shining crescent far beneath the flying vessel.',
  'It was going to be a lonely trip back.',
  'Mist enveloped the ship three hours out from port.',
  'My two natures had memory in common.',
  'Silver mist suffused the deck of the ship.',
  'The face of the moon was in shadow.',
  'She stared through the window at the stars.',
  'The recorded voice scratched in the speaker.',
  'The sky was cloudless and of a deep dark blue.',
  'The spectacle before us was indeed sublime.',
  'Then came the night of the first falling star.',
  'Waves flung themselves at the blue evening.',
];

const messages = [];

let node = document.querySelector('main');
let next = 0;

const render = () => {
  const vnode = h('div', {}, [
    h(
      'button',
      {
        on: {
          click: () => {
            messages.push({ index: next++, text: sample(all) });
            render();
          },
        },
      },
      ['Add']
    ),
    TransitionGroup(
      'message',
      'div.messages',
      {},
      messages.map(message =>
        h(
          'div.message',
          {
            key: message.index,
            on: {
              click: () => {
                messages.splice(messages.indexOf(message), 1);
                render();
              },
            },
          },
          [message.text]
        )
      )
    ),
  ]);
  node = patch(node, vnode);
};

const sample = array => array[~~(Math.random() * array.length)];

render();
