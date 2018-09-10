import KeyboardModule from '../../../diagram-js/features/keyboard';

import BpmnKeyBindings from './BpmnKeyBindings';

export default {
  __depends__: [
    KeyboardModule
  ],
  __init__: [ 'bpmnKeyBindings' ],
  bpmnKeyBindings: [ 'type', BpmnKeyBindings ]
};
