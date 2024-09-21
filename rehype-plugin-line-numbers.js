// rehype-plugin-line-numbers.js

import { visit } from 'unist-util-visit';

export default function rehypePluginLineNumbers() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'pre' && node.children && node.children.length === 1) {
        const codeNode = node.children[0];
        if (codeNode.tagName === 'code' && codeNode.children && codeNode.children.length === 1) {
          const [textNode] = codeNode.children;
          if (textNode.type === 'text') {
            const lines = textNode.value.split('\n');
            codeNode.children = lines.map((line) => ({
              type: 'element',
              tagName: 'div',
              properties: {},
              children: [
                {
                  type: 'text',
                  value: line,
                },
              ],
            }));
          }
        }
      }
    });
  };
}
