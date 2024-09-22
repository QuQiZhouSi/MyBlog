// rehype-plugin-line-numbers.js

import { visit } from 'unist-util-visit';

export default function rehypePluginLineNumbers() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName == 'pre' && node.children && node.children.length === 1) {
        const codeNode = node.children[0];
        let cnt = 0;
        codeNode.children.forEach(e => {
          e.children.unshift({
            type: 'element', tagName: 'span', properties: {
              className: ['line-num']
            },
            children: [{ type: 'text', value: `${++cnt}` }]
          });
        });

      }
    });
  };
}
